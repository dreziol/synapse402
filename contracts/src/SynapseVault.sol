// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/ITIP20.sol";

/**
 * @title SynapseVault
 * @notice Production-grade Escrow & Policy Engine for Autonomous AI Agent payments on Tempo L1.
 *         Supports EIP-712 scoped session delegations, Merkle whitelist verification,
 *         2D-nonce concurrency channels, and TIP-20 ISO 20022 payment memos.
 */
contract SynapseVault is Ownable, ReentrancyGuard, EIP712 {
    using SafeERC20 for IERC20;

    enum SessionStatus {
        INACTIVE,
        ACTIVE,
        PAUSED,
        DEPLETED,
        REVOKED
    }

    struct SessionKeyConfig {
        uint256 maxPerCall;       // Max token units per HTTP 402 payment
        uint256 totalBudget;      // Total cumulative budget allocated
        uint256 currentSpent;     // Cumulative tokens spent so far
        uint256 validBefore;      // Expiry timestamp (UNIX)
        bytes32 merkleRoot;       // Merkle root of whitelisted API endpoints (bytes32(0) = wildcard)
        SessionStatus status;     // Lifecycle status
    }

    struct PaymentParams {
        address sessionKey;
        uint64 channelId;
        uint64 nonce;
        address payee;
        uint256 amount;
        string endpoint;
        bytes32[] merkleProof;
        bytes32 memo;
        uint256 deadline;
        bytes signature;
    }

    // EIP-712 Typehash for authorization signatures
    bytes32 public constant MPP_AUTHORIZATION_TYPEHASH = keccak256(
        "MPPAuthorization(address sessionKey,uint64 channelId,uint64 nonce,address payee,uint256 amount,bytes32 endpointHash,bytes32 memo,uint256 validBefore)"
    );

    /// @notice Primary settlement token (e.g., pathUSD TIP-20 on Tempo L1)
    IERC20 public immutable paymentToken;

    /// @notice Address of the official Protocol Treasury for routing fee accruals
    address public treasury;

    /// @notice Protocol route fee in basis points (10 bps = 0.1%)
    uint256 public constant PROTOCOL_FEE_BPS = 10;

    /// @notice Total pathUSD balance held inside the vault
    uint256 public totalVaultBalance;

    /// @notice Session key configs: sessionKey address => configuration
    mapping(address => SessionKeyConfig) public sessionKeys;

    /// @notice 2D Nonce tracking: sessionKey => channelId => lastSequenceNonce
    mapping(address => mapping(uint64 => uint64)) public lastNonce;

    // Events
    event Deposited(address indexed depositor, uint256 amount);
    event Withdrawn(address indexed owner, address indexed recipient, uint256 amount);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event ProtocolFeeCollected(address indexed sessionKey, address indexed treasury, uint256 feeAmount);
    event SessionKeyRegistered(
        address indexed sessionKey,
        uint256 maxPerCall,
        uint256 totalBudget,
        uint256 validBefore,
        bytes32 merkleRoot
    );
    event SessionKeyStatusUpdated(address indexed sessionKey, SessionStatus status);
    event SessionBudgetUpdated(address indexed sessionKey, uint256 newTotalBudget, uint256 newMaxPerCall);
    event PaymentSettled(
        address indexed sessionKey,
        address indexed payee,
        uint256 amount,
        uint64 channelId,
        uint64 nonce,
        bytes32 indexed memo,
        string endpoint
    );

    // Custom Errors
    error InvalidTokenAddress();
    error ZeroAmount();
    error InsufficientVaultBalance();
    error SessionNotActive(SessionStatus currentStatus);
    error SessionExpired(uint256 validBefore, uint256 currentTimestamp);
    error AuthorizationExpired(uint256 validBefore, uint256 currentTimestamp);
    error ExceedsMaxPerCall(uint256 amount, uint256 maxAllowed);
    error ExceedsTotalBudget(uint256 requestedTotal, uint256 budget);
    error Invalid2DNonce(uint64 expectedNonce, uint64 providedNonce);
    error EndpointNotWhitelisted(bytes32 endpointHash, bytes32 merkleRoot);
    error InvalidSignature(address recoveredSigner, address expectedSessionKey);

    /**
     * @param _token Address of the pathUSD / TIP-20 token on Tempo L1
     * @param _initialOwner Address of the team/human custodian
     */
    constructor(address _token, address _initialOwner)
        Ownable(_initialOwner)
        EIP712("SynapseVault", "1.0.0")
    {
        if (_token == address(0)) revert InvalidTokenAddress();
        paymentToken = IERC20(_token);
        treasury = _initialOwner;
    }

    /**
     * @notice Deposit funds into the vault for agent settlements.
     * @param amount Token amount to deposit.
     */
    function deposit(uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        paymentToken.safeTransferFrom(msg.sender, address(this), amount);
        totalVaultBalance += amount;
        emit Deposited(msg.sender, amount);
    }

    /**
     * @notice Custodian can withdraw unspent vault funds.
     */
    function withdraw(address recipient, uint256 amount) external onlyOwner nonReentrant {
        if (recipient == address(0)) revert InvalidTokenAddress();
        if (amount == 0) revert ZeroAmount();
        if (amount > totalVaultBalance) revert InsufficientVaultBalance();

        totalVaultBalance -= amount;
        paymentToken.safeTransfer(recipient, amount);
        emit Withdrawn(msg.sender, recipient, amount);
    }

    /**
     * @notice Update the official protocol treasury address.
     * @param newTreasury The new recipient address for protocol routing fees.
     */
    function setTreasury(address newTreasury) external onlyOwner {
        if (newTreasury == address(0)) revert InvalidTokenAddress();
        address oldTreasury = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(oldTreasury, newTreasury);
    }

    /**
     * @notice Register or reconfigure an AI agent session key.
     */
    function registerSessionKey(
        address sessionKey,
        uint256 maxPerCall,
        uint256 totalBudget,
        uint256 validBefore,
        bytes32 merkleRoot
    ) external onlyOwner {
        if (sessionKey == address(0)) revert InvalidTokenAddress();
        if (validBefore <= block.timestamp) revert SessionExpired(validBefore, block.timestamp);
        if (maxPerCall == 0 || totalBudget == 0 || maxPerCall > totalBudget) {
            revert ExceedsMaxPerCall(maxPerCall, totalBudget);
        }

        sessionKeys[sessionKey] = SessionKeyConfig({
            maxPerCall: maxPerCall,
            totalBudget: totalBudget,
            currentSpent: 0,
            validBefore: validBefore,
            merkleRoot: merkleRoot,
            status: SessionStatus.ACTIVE
        });

        emit SessionKeyRegistered(sessionKey, maxPerCall, totalBudget, validBefore, merkleRoot);
    }

    /**
     * @notice Set status for a session key (PAUSE / UNPAUSE / REVOKE).
     */
    function setSessionStatus(address sessionKey, SessionStatus newStatus) external onlyOwner {
        SessionKeyConfig storage config = sessionKeys[sessionKey];
        if (config.status == SessionStatus.INACTIVE) {
            revert SessionNotActive(config.status);
        }
        config.status = newStatus;
        emit SessionKeyStatusUpdated(sessionKey, newStatus);
    }

    /**
     * @notice Update budget limits for an active session key.
     */
    function updateSessionBudget(
        address sessionKey,
        uint256 newTotalBudget,
        uint256 newMaxPerCall
    ) external onlyOwner {
        SessionKeyConfig storage config = sessionKeys[sessionKey];
        if (config.status != SessionStatus.ACTIVE) {
            revert SessionNotActive(config.status);
        }
        if (newTotalBudget < config.currentSpent) {
            revert ExceedsTotalBudget(config.currentSpent, newTotalBudget);
        }
        if (newMaxPerCall == 0 || newMaxPerCall > newTotalBudget) {
            revert ExceedsMaxPerCall(newMaxPerCall, newTotalBudget);
        }

        config.totalBudget = newTotalBudget;
        config.maxPerCall = newMaxPerCall;
        emit SessionBudgetUpdated(sessionKey, newTotalBudget, newMaxPerCall);
    }

    /**
     * @notice Settle an HTTP 402 Machine Payment on Tempo L1 using PaymentParams struct.
     */
    function settle402Payment(PaymentParams calldata p) external nonReentrant {
        SessionKeyConfig storage config = sessionKeys[p.sessionKey];

        // 1. Session Status Check
        if (config.status != SessionStatus.ACTIVE) {
            revert SessionNotActive(config.status);
        }
        if (block.timestamp > config.validBefore) {
            config.status = SessionStatus.PAUSED;
            revert SessionExpired(config.validBefore, block.timestamp);
        }
        if (block.timestamp > p.deadline) {
            revert AuthorizationExpired(p.deadline, block.timestamp);
        }

        // 2. Budget & Policy Checks
        if (p.amount == 0) revert ZeroAmount();
        if (p.amount > config.maxPerCall) {
            revert ExceedsMaxPerCall(p.amount, config.maxPerCall);
        }
        uint256 newSpent = config.currentSpent + p.amount;
        if (newSpent > config.totalBudget) {
            config.status = SessionStatus.DEPLETED;
            revert ExceedsTotalBudget(newSpent, config.totalBudget);
        }
        if (p.amount > totalVaultBalance) {
            revert InsufficientVaultBalance();
        }

        // 3. 2D Nonce Progression Check (prevents replay attacks across parallel channels)
        uint64 expectedNonce = lastNonce[p.sessionKey][p.channelId] + 1;
        if (p.nonce != expectedNonce) {
            revert Invalid2DNonce(expectedNonce, p.nonce);
        }

        // 4. Merkle Whitelist Verification (OpenZeppelin StandardMerkleTree double-hashing)
        bytes32 endpointLeaf = keccak256(bytes.concat(keccak256(abi.encode(p.endpoint))));
        if (config.merkleRoot != bytes32(0)) {
            if (!MerkleProof.verify(p.merkleProof, config.merkleRoot, endpointLeaf)) {
                revert EndpointNotWhitelisted(endpointLeaf, config.merkleRoot);
            }
        }

        // 5. Signature verification (if caller is not the session key itself)
        if (msg.sender != p.sessionKey) {
            bytes32 structHash = keccak256(
                abi.encode(
                    MPP_AUTHORIZATION_TYPEHASH,
                    p.sessionKey,
                    p.channelId,
                    p.nonce,
                    p.payee,
                    p.amount,
                    endpointLeaf,
                    p.memo,
                    p.deadline
                )
            );
            bytes32 hash = _hashTypedDataV4(structHash);
            address signer = ECDSA.recover(hash, p.signature);
            if (signer != p.sessionKey) {
                revert InvalidSignature(signer, p.sessionKey);
            }
        }

        // 6. Update State
        lastNonce[p.sessionKey][p.channelId] = p.nonce;
        config.currentSpent = newSpent;
        if (newSpent == config.totalBudget) {
            config.status = SessionStatus.DEPLETED;
        }
        totalVaultBalance -= p.amount;

        // 7. Dispatch Payment with 0.1% Protocol Route Fee deduction to Treasury
        uint256 protocolFee = (p.amount * PROTOCOL_FEE_BPS) / 10000;
        uint256 payeeAmount = p.amount - protocolFee;

        if (protocolFee > 0 && treasury != address(0)) {
            _dispatchPayment(treasury, protocolFee, bytes32("SYNAPSE_0.1%_PROTOCOL_FEE"));
            emit ProtocolFeeCollected(p.sessionKey, treasury, protocolFee);
        }

        _dispatchPayment(p.payee, payeeAmount, p.memo);

        emit PaymentSettled(p.sessionKey, p.payee, p.amount, p.channelId, p.nonce, p.memo, p.endpoint);
    }

    /**
     * @notice Internal helper to dispatch payment using TIP-20 transferWithMemo if supported,
     *         or standard ERC20 transfer.
     */
    function _dispatchPayment(address payee, uint256 amount, bytes32 memo) internal {
        // Attempt TIP-20 transferWithMemo via low-level call
        (bool success, bytes memory returnData) = address(paymentToken).call(
            abi.encodeWithSelector(ITIP20.transferWithMemo.selector, payee, amount, memo)
        );

        if (success && (returnData.length == 0 || abi.decode(returnData, (bool)))) {
            // TIP-20 payment with memo succeeded
            return;
        }

        // Fallback to standard SafeERC20 transfer
        paymentToken.safeTransfer(payee, amount);
    }

    /**
     * @notice View remaining budget for a session key.
     */
    function getRemainingBudget(address sessionKey) external view returns (uint256) {
        SessionKeyConfig storage config = sessionKeys[sessionKey];
        if (config.currentSpent >= config.totalBudget) return 0;
        return config.totalBudget - config.currentSpent;
    }
}
