// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../interfaces/ITIP20.sol";

/**
 * @title MockTIP20
 * @notice Mock implementation of Tempo L1 pathUSD (TIP-20) with 6 decimals and 32-byte memo support.
 */
contract MockTIP20 is ERC20, ITIP20 {
    uint8 private constant _DECIMALS = 6;

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(msg.sender, 1_000_000 * 10 ** _DECIMALS);
    }

    function decimals() public pure override returns (uint8) {
        return _DECIMALS;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function transferWithMemo(
        address to,
        uint256 amount,
        bytes32 memo
    ) external override returns (bool) {
        bool success = transfer(to, amount);
        if (success) {
            emit TransferWithMemo(msg.sender, to, amount, memo);
        }
        return success;
    }

    function transferFromWithMemo(
        address from,
        address to,
        uint256 amount,
        bytes32 memo
    ) external override returns (bool) {
        bool success = transferFrom(from, to, amount);
        if (success) {
            emit TransferWithMemo(from, to, amount, memo);
        }
        return success;
    }
}
