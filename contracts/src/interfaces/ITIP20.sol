// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title ITIP20
 * @notice Interface for Tempo L1 TIP-20 Enhanced Token with 32-byte Memo support (ISO 20022).
 */
interface ITIP20 is IERC20 {
    event TransferWithMemo(
        address indexed from,
        address indexed to,
        uint256 value,
        bytes32 indexed memo
    );

    /**
     * @notice Transfer tokens with an attached 32-byte memo.
     * @param to Recipient address.
     * @param amount Token amount.
     * @param memo 32-byte ISO 20022 remittance reference.
     */
    function transferWithMemo(
        address to,
        uint256 amount,
        bytes32 memo
    ) external returns (bool);

    /**
     * @notice Transfer tokens from an allowance with an attached 32-byte memo.
     * @param from Source address.
     * @param to Recipient address.
     * @param amount Token amount.
     * @param memo 32-byte ISO 20022 remittance reference.
     */
    function transferFromWithMemo(
        address from,
        address to,
        uint256 amount,
        bytes32 memo
    ) external returns (bool);
}
