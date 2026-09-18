// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title SynapseMPPReceiver
 * @notice Verifiable HTTP 402 Payment Gateway for API Providers on Tempo L1.
 *         Receives autonomous machine payments, matches TIP-20 ISO 20022 memos,
 *         and issues cryptographic receipt proofs for downstream API unlock.
 */
contract SynapseMPPReceiver is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct Invoice {
        address merchant;
        uint256 amountRequired;
        bool isSettled;
        address settledBy;
        uint256 settledAt;
        bytes32 memo;
    }

    IERC20 public immutable acceptedToken;

    /// @notice invoiceId => Invoice metadata
    mapping(bytes32 => Invoice) public invoices;

    event InvoiceCreated(bytes32 indexed invoiceId, address indexed merchant, uint256 amountRequired);
    event InvoiceSettled(
        bytes32 indexed invoiceId,
        address indexed payer,
        address indexed merchant,
        uint256 amount,
        bytes32 memo,
        uint256 timestamp
    );
    event MerchantPayout(address indexed merchant, uint256 amount);

    error InvoiceAlreadyExists(bytes32 invoiceId);
    error InvoiceNotFound(bytes32 invoiceId);
    error InvoiceAlreadyPaid(bytes32 invoiceId);
    error IncorrectPaymentAmount(uint256 required, uint256 sent);
    error ZeroAddress();

    constructor(address _acceptedToken, address _owner) Ownable(_owner) {
        if (_acceptedToken == address(0)) revert ZeroAddress();
        acceptedToken = IERC20(_acceptedToken);
    }

    /**
     * @notice API Merchant registers an HTTP 402 invoice before serving challenge.
     * @param invoiceId Unique hash derived from request ID & timestamp.
     * @param amountRequired pathUSD amount required to unlock API resource.
     */
    function createInvoice(bytes32 invoiceId, uint256 amountRequired) external {
        if (invoices[invoiceId].amountRequired != 0) revert InvoiceAlreadyExists(invoiceId);
        if (amountRequired == 0) revert IncorrectPaymentAmount(1, 0);

        invoices[invoiceId] = Invoice({
            merchant: msg.sender,
            amountRequired: amountRequired,
            isSettled: false,
            settledBy: address(0),
            settledAt: 0,
            memo: bytes32(0)
        });

        emit InvoiceCreated(invoiceId, msg.sender, amountRequired);
    }

    /**
     * @notice Settles an invoice. Can be called by payer or SynapseVault.
     * @param invoiceId Target invoice hash.
     * @param memo TIP-20 32-byte memo.
     */
    function settleInvoice(bytes32 invoiceId, bytes32 memo) external nonReentrant {
        Invoice storage invoice = invoices[invoiceId];
        if (invoice.amountRequired == 0) revert InvoiceNotFound(invoiceId);
        if (invoice.isSettled) revert InvoiceAlreadyPaid(invoiceId);

        uint256 required = invoice.amountRequired;
        invoice.isSettled = true;
        invoice.settledBy = msg.sender;
        invoice.settledAt = block.timestamp;
        invoice.memo = memo;

        // Pull tokens from payer / vault
        acceptedToken.safeTransferFrom(msg.sender, invoice.merchant, required);

        emit InvoiceSettled(
            invoiceId,
            msg.sender,
            invoice.merchant,
            required,
            memo,
            block.timestamp
        );
    }

    /**
     * @notice Helper to check if an invoice is cryptographically settled for instant API gateway response.
     */
    function isInvoicePaid(bytes32 invoiceId) external view returns (bool, address, uint256) {
        Invoice storage inv = invoices[invoiceId];
        return (inv.isSettled, inv.settledBy, inv.settledAt);
    }
}
