// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract Web3Coffee {
    AggregatorV3Interface internal dataFeed;
    uint256 public platformFee = 2; 
    address public owner;
    
    mapping(address => uint256) public creatorBalance;
    
    event Donation(
        address indexed creator,
        address indexed supporter,
        uint256 ethAmount,
        uint256 usdAmount,
        string message
    );
    
    event Withdrawal(
        address indexed creator,
        uint256 amount
    );
    
    // Constructor for Ethereum Mainnet
    // ETH/USD feed: 0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419
    // Sepolia testnet: 0x694AA1769357215DE4FAC081bf1f309adC325306
    constructor(address _priceFeed) {
        dataFeed = AggregatorV3Interface(_priceFeed);
        owner = msg.sender;
    }
    
    // Get latest ETH/USD price from Chainlink
    function getLatestPrice() public view returns (int256) {
        (
            ,
            int256 answer,
            ,
            ,
            
        ) = dataFeed.latestRoundData();
        
        require(answer > 0, "Invalid price");
        return answer; // Returns price with 8 decimals (e.g., 319135000000 = $3191.35)
    }
    
    // Get decimals from price feed
    function getPriceFeedDecimals() public view returns (uint8) {
        return dataFeed.decimals();
    }
    
    // Convert ETH amount to USD
    // ethAmount: in wei (e.g., 1 ETH = 1e18 wei)
    // Returns: USD amount with 8 decimals
    function getEthToUsd(uint256 ethAmount) public view returns (uint256) {
        int256 ethPrice = getLatestPrice(); // 8 decimals
        // (ethAmount / 1e18) * (ethPrice / 1e8) = usdAmount / 1e8
        // Simplify: (ethAmount * ethPrice) / 1e26
        uint256 usdAmount = (ethAmount * uint256(ethPrice)) / 1e26;
        return usdAmount;
    }
    
    // Convert USD to ETH amount
    // usdAmount: in 8 decimals (e.g., 500000000 = $5.00)
    // Returns: ETH amount in wei
    function getUsdToEth(uint256 usdAmount) public view returns (uint256) {
        int256 ethPrice = getLatestPrice(); // 8 decimals
        // (usdAmount / 1e8) / (ethPrice / 1e8) = ethAmount in wei
        // Simplify: (usdAmount * 1e18) / ethPrice
        uint256 ethAmount = (usdAmount * 1e18) / uint256(ethPrice);
        return ethAmount;
    }
    
    // Donate with ETH directly
    function donateWithEth(
        address creator,
        string memory message
    ) external payable {
        require(creator != address(0), "Invalid creator");
        require(msg.value > 0, "Amount > 0");
        
        // Calculate USD value (8 decimals)
        uint256 usdAmount = getEthToUsd(msg.value);
        
        // Calculate creator amount (after 2% fee)
        uint256 fee = (msg.value * platformFee) / 100;
        uint256 creatorAmount = msg.value - fee;
        
        // Update creator balance
        creatorBalance[creator] += creatorAmount;
        
        emit Donation(creator, msg.sender, msg.value, usdAmount, message);
    }
    
    // Donate with USD amount
    // usdAmount: amount in 8 decimals (e.g., 500000000 = $5.00)
    function donateWithUsdAmount(
        address creator,
        uint256 usdAmount,
        string memory message
    ) external payable {
        require(creator != address(0), "Invalid creator");
        require(usdAmount > 0, "Amount > 0");
        
        // Calculate required ETH
        uint256 requiredEth = getUsdToEth(usdAmount);
        require(msg.value >= requiredEth, "Insufficient ETH sent");
        
        // Calculate creator amount (after 2% fee)
        uint256 fee = (msg.value * platformFee) / 100;
        uint256 creatorAmount = msg.value - fee;
        
        // Update creator balance
        creatorBalance[creator] += creatorAmount;
        
        emit Donation(creator, msg.sender, msg.value, usdAmount, message);
    }
    
    // Withdraw funds by creator
    function withdraw(uint256 amount) external {
        require(amount > 0, "Amount > 0");
        require(creatorBalance[msg.sender] >= amount, "Insufficient balance");
        
        // Update balance first (prevent reentrancy)
        creatorBalance[msg.sender] -= amount;
        
        // Transfer ETH to creator
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Withdrawal failed");
        
        emit Withdrawal(msg.sender, amount);
    }
    
    // Get creator balance in both ETH and USD
    function getBalance(address creator) external view returns (uint256 ethBalance, uint256 usdBalance) {
        ethBalance = creatorBalance[creator];
        usdBalance = getEthToUsd(ethBalance);
    }
}