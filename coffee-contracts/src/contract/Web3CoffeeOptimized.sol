// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

/**
 * @title Web3CoffeeOptimized
 * @notice Optimized donation platform with Chainlink price feeds
 * @dev Includes gas optimizations, proper validations, and complete functionality
 */
contract Web3CoffeeOptimized {
    // ============================================
    // CUSTOM ERRORS (Gas Efficient)
    // ============================================
    error InvalidCreator();
    error InvalidAmount();
    error InsufficientBalance();
    error InsufficientETHSent();
    error WithdrawalFailed();
    error OnlyOwner();
    error ContractPaused();
    error StalePrice();
    error InvalidRound();
    error BelowMinimum();
    error InvalidPriceFeed();

    // ============================================
    // STATE VARIABLES (Optimized Storage Packing)
    // ============================================
    address public owner;                    // slot 0 (20 bytes)
    uint8 public platformFee;                // slot 0 (1 byte) - packed
    bool public paused;                      // slot 0 (1 byte) - packed
    
    AggregatorV3Interface public dataFeed;   // slot 1
    uint256 public minDonation;              // slot 2
    uint256 public platformBalance;          // slot 3
    
    mapping(address => uint256) public creatorBalance;  // slot 4
    
    // Chainlink staleness threshold (3 hours)
    uint256 private constant STALENESS_THRESHOLD = 3 hours;
    
    // ============================================
    // EVENTS
    // ============================================
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
    
    event PlatformFeeWithdrawn(
        address indexed owner,
        uint256 amount
    );
    
    event PlatformFeeUpdated(
        uint8 oldFee,
        uint8 newFee
    );
    
    event MinDonationUpdated(
        uint256 oldMin,
        uint256 newMin
    );
    
    event PausedStateChanged(bool isPaused);

    // ============================================
    // MODIFIERS
    // ============================================
    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }
    
    modifier whenNotPaused() {
        if (paused) revert ContractPaused();
        _;
    }

    // ============================================
    // CONSTRUCTOR
    // ============================================
    /**
     * @param _priceFeed Chainlink ETH/USD price feed address
     * @param _platformFee Platform fee percentage (0-100)
     * @param _minDonation Minimum donation amount in wei
     */
    constructor(address _priceFeed, uint8 _platformFee, uint256 _minDonation) {
        if (_priceFeed == address(0)) revert InvalidPriceFeed();
        if (_platformFee > 100) revert InvalidAmount();
        
        dataFeed = AggregatorV3Interface(_priceFeed);
        owner = msg.sender;
        platformFee = _platformFee;
        minDonation = _minDonation;
        paused = false;
    }

    // ============================================
    // PRICE FEED FUNCTIONS (With Proper Validation)
    // ============================================
    /**
     * @notice Get latest ETH/USD price with staleness check
     * @return price ETH price with 8 decimals
     */
    function getLatestPrice() public view returns (int256 price) {
        (
            uint80 roundId,
            int256 answer,
            ,
            uint256 updatedAt,
            uint80 answeredInRound
        ) = dataFeed.latestRoundData();
        
        // Validate price data
        if (answer <= 0) revert InvalidAmount();
        if (updatedAt == 0) revert StalePrice();
        if (answeredInRound < roundId) revert InvalidRound();
        
        // Check staleness
        unchecked {
            if (block.timestamp - updatedAt > STALENESS_THRESHOLD) {
                revert StalePrice();
            }
        }
        
        return answer;
    }
    
    /**
     * @notice Get decimals from price feed
     */
    function getPriceFeedDecimals() public view returns (uint8) {
        return dataFeed.decimals();
    }
    
    /**
     * @notice Convert ETH amount to USD
     * @param ethAmount Amount in wei
     * @return usdAmount USD amount with 8 decimals
     */
    function getEthToUsd(uint256 ethAmount) public view returns (uint256 usdAmount) {
        int256 ethPrice = getLatestPrice();
        // (ethAmount * ethPrice) / 1e26
        // Using unchecked for gas optimization (overflow extremely unlikely)
        unchecked {
            usdAmount = (ethAmount * uint256(ethPrice)) / 1e26;
        }
    }
    
    /**
     * @notice Convert USD to ETH amount
     * @param usdAmount USD amount with 8 decimals
     * @return ethAmount Amount in wei
     */
    function getUsdToEth(uint256 usdAmount) public view returns (uint256 ethAmount) {
        int256 ethPrice = getLatestPrice();
        // (usdAmount * 1e18) / ethPrice
        ethAmount = (usdAmount * 1e18) / uint256(ethPrice);
    }

    // ============================================
    // DONATION FUNCTIONS
    // ============================================
    /**
     * @notice Donate with ETH directly
     * @param creator Address of the creator receiving donation
     * @param message Message attached to donation
     */
    function donateWithEth(
        address creator,
        string calldata message
    ) external payable whenNotPaused {
        if (creator == address(0)) revert InvalidCreator();
        if (msg.value < minDonation) revert BelowMinimum();
        
        // Calculate USD value
        uint256 usdAmount = getEthToUsd(msg.value);
        
        // Calculate fee and creator amount
        uint256 fee;
        uint256 creatorAmount;
        unchecked {
            fee = (msg.value * platformFee) / 100;
            creatorAmount = msg.value - fee;
        }
        
        // Update balances
        creatorBalance[creator] += creatorAmount;
        platformBalance += fee;
        
        emit Donation(creator, msg.sender, msg.value, usdAmount, message);
    }
    
    /**
     * @notice Donate with specific USD amount
     * @param creator Address of the creator receiving donation
     * @param usdAmount USD amount with 8 decimals (e.g., 500000000 = $5.00)
     * @param message Message attached to donation
     */
    function donateWithUsdAmount(
        address creator,
        uint256 usdAmount,
        string calldata message
    ) external payable whenNotPaused {
        if (creator == address(0)) revert InvalidCreator();
        if (usdAmount == 0) revert InvalidAmount();
        
        // Calculate required ETH
        uint256 requiredEth = getUsdToEth(usdAmount);
        if (msg.value < requiredEth) revert InsufficientETHSent();
        if (msg.value < minDonation) revert BelowMinimum();
        
        // Calculate fee and creator amount
        uint256 fee;
        uint256 creatorAmount;
        unchecked {
            fee = (msg.value * platformFee) / 100;
            creatorAmount = msg.value - fee;
        }
        
        // Update balances
        creatorBalance[creator] += creatorAmount;
        platformBalance += fee;
        
        // Refund excess ETH if any
        uint256 excess;
        unchecked {
            excess = msg.value - requiredEth;
        }
        if (excess > 0) {
            (bool success, ) = msg.sender.call{value: excess}("");
            if (!success) revert WithdrawalFailed();
        }
        
        emit Donation(creator, msg.sender, msg.value - excess, usdAmount, message);
    }

    // ============================================
    // WITHDRAWAL FUNCTIONS
    // ============================================
    /**
     * @notice Withdraw specific amount by creator
     * @param amount Amount to withdraw in wei
     */
    function withdraw(uint256 amount) external {
        if (amount == 0) revert InvalidAmount();
        if (creatorBalance[msg.sender] < amount) revert InsufficientBalance();
        
        // Update balance first (CEI pattern - prevent reentrancy)
        unchecked {
            creatorBalance[msg.sender] -= amount;
        }
        
        // Transfer ETH
        (bool success, ) = msg.sender.call{value: amount}("");
        if (!success) revert WithdrawalFailed();
        
        emit Withdrawal(msg.sender, amount);
    }
    
    /**
     * @notice Withdraw all available balance by creator
     */
    function withdrawAll() external {
        uint256 balance = creatorBalance[msg.sender];
        if (balance == 0) revert InsufficientBalance();
        
        // Update balance first (CEI pattern)
        creatorBalance[msg.sender] = 0;
        
        // Transfer ETH
        (bool success, ) = msg.sender.call{value: balance}("");
        if (!success) revert WithdrawalFailed();
        
        emit Withdrawal(msg.sender, balance);
    }
    
    /**
     * @notice Withdraw platform fees (owner only)
     * @param amount Amount to withdraw
     */
    function withdrawPlatformFee(uint256 amount) external onlyOwner {
        if (amount == 0) revert InvalidAmount();
        if (platformBalance < amount) revert InsufficientBalance();
        
        // Update balance first
        unchecked {
            platformBalance -= amount;
        }
        
        // Transfer ETH
        (bool success, ) = owner.call{value: amount}("");
        if (!success) revert WithdrawalFailed();
        
        emit PlatformFeeWithdrawn(owner, amount);
    }
    
    /**
     * @notice Withdraw all platform fees (owner only)
     */
    function withdrawAllPlatformFees() external onlyOwner {
        uint256 balance = platformBalance;
        if (balance == 0) revert InsufficientBalance();
        
        platformBalance = 0;
        
        // Transfer ETH
        (bool success, ) = owner.call{value: balance}("");
        if (!success) revert WithdrawalFailed();
        
        emit PlatformFeeWithdrawn(owner, balance);
    }

    // ============================================
    // ADMIN FUNCTIONS
    // ============================================
    /**
     * @notice Update platform fee percentage
     * @param newFee New fee percentage (0-100)
     */
    function setPlatformFee(uint8 newFee) external onlyOwner {
        if (newFee > 100) revert InvalidAmount();
        
        uint8 oldFee = platformFee;
        platformFee = newFee;
        
        emit PlatformFeeUpdated(oldFee, newFee);
    }
    
    /**
     * @notice Update minimum donation amount
     * @param newMin New minimum donation in wei
     */
    function setMinDonation(uint256 newMin) external onlyOwner {
        uint256 oldMin = minDonation;
        minDonation = newMin;
        
        emit MinDonationUpdated(oldMin, newMin);
    }
    
    /**
     * @notice Pause/unpause the contract
     * @param _paused True to pause, false to unpause
     */
    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        emit PausedStateChanged(_paused);
    }
    
    /**
     * @notice Transfer ownership
     * @param newOwner Address of new owner
     */
    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert InvalidCreator();
        owner = newOwner;
    }

    // ============================================
    // VIEW FUNCTIONS
    // ============================================
    /**
     * @notice Get creator balance in both ETH and USD
     * @param creator Address of creator
     * @return ethBalance Balance in wei
     * @return usdBalance Balance in USD with 8 decimals
     */
    function getBalance(address creator) external view returns (
        uint256 ethBalance,
        uint256 usdBalance
    ) {
        ethBalance = creatorBalance[creator];
        usdBalance = getEthToUsd(ethBalance);
    }
    
    /**
     * @notice Get contract info
     */
    function getContractInfo() external view returns (
        address _owner,
        uint8 _platformFee,
        uint256 _minDonation,
        uint256 _platformBalance,
        bool _paused
    ) {
        return (owner, platformFee, minDonation, platformBalance, paused);
    }
    
    /**
     * @notice Check if price feed is working and fresh
     */
    function isPriceFeedHealthy() external view returns (bool) {
        try this.getLatestPrice() returns (int256) {
            return true;
        } catch {
            return false;
        }
    }
}
