// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Web3Coffee {
    IERC20 public usdc;
    uint256 public platformFee = 2; 
    address public owner;
    
    mapping(address => uint256) public creatorBalance;
    
    event Donation(
        address indexed creator,
        address indexed supporter,
        uint256 amount,
        string message
    );
    
    event Withdrawal(
        address indexed creator,
        uint256 amount
    );
    
    constructor(address _usdc) {
        usdc = IERC20(_usdc);
        owner = msg.sender;
    }
    
    
    // Donate to a creator
    function donate(
        address creator,
        uint256 amount,
        string memory message
    ) external {
        require(creator != address(0), "Invalid creator");
        require(amount > 0, "Amount > 0");
        
        // Transfer USDC from supporter to this contract
        require(
            usdc.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
        
        // Calculate creator amount (after fee)
        uint256 fee = (amount * platformFee) / 100;
        uint256 creatorAmount = amount - fee;
        
        // Update creator balance
        creatorBalance[creator] += creatorAmount;
        
        emit Donation(creator, msg.sender, creatorAmount, message);
    }
    
    // withdraw funds by creator
    function withdraw(uint256 amount) external {
        require(amount > 0, "Amount > 0");
        require(creatorBalance[msg.sender] >= amount, "Insufficient balance");
        
        // Update balance first (prevent reentrancy)
        creatorBalance[msg.sender] -= amount;
        
        // Transfer USDC to creator
        require(usdc.transfer(msg.sender, amount), "Withdrawal failed");
        
        emit Withdrawal(msg.sender, amount);
    }
    
    // Get creator balance
    function getBalance(address creator) external view returns (uint256) {
        return creatorBalance[creator];
    }
}