// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contract/Web3Coffee.sol";

contract Web3CoffeeVer2Test is Test {
    Web3Coffee public coffee;
    
    address public owner;
    address public creator;
    address public supporter;
    
    // Mock Chainlink price feed address (we'll mock the responses)
    address public mockPriceFeed;
    
    // Events
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
    
    function setUp() public {
        // Create test addresses
        owner = makeAddr("owner");
        creator = makeAddr("creator");
        supporter = makeAddr("supporter");
        
        // Deploy mock price feed
        mockPriceFeed = deployMockPriceFeed();
        
        // Deploy Web3Coffee contract
        vm.startPrank(owner);
        coffee = new Web3Coffee(mockPriceFeed);
        vm.stopPrank();
        
        // Give supporter some ETH for testing
        vm.deal(supporter, 100 ether);
        vm.deal(creator, 1 ether);
    }
    
    // Deploy a mock price feed that returns ~$3000 per ETH
    function deployMockPriceFeed() internal returns (address) {
        // Deploy mock contract with ETH price of $3000
        // Price feed returns 8 decimals: 3000 * 1e8 = 300000000000
        MockV3Aggregator mock = new MockV3Aggregator(8, 3000 * 1e8);
        return address(mock);
    }
    
    /* ============ TEST DONATE WITH ETH ============ */
    
    function test_DonateWithEth_Success() public {
        uint256 donateAmount = 1 ether;
        string memory message = "Keep it up!";
        
        // Calculate expected amounts
        uint256 fee = (donateAmount * 2) / 100; // 2% fee
        uint256 creatorAmount = donateAmount - fee;
        
        // Get USD value
        uint256 usdAmount = coffee.getEthToUsd(donateAmount);
        
        vm.startPrank(supporter);
        
        // Check event emitted correctly
        vm.expectEmit(true, true, false, true);
        emit Donation(creator, supporter, donateAmount, usdAmount, message);
        
        // Perform donation
        coffee.donateWithEth{value: donateAmount}(creator, message);
        vm.stopPrank();
        
        // Verify creator balance
        assertEq(coffee.creatorBalance(creator), creatorAmount, "Creator balance incorrect");
        
        // Verify contract received the ETH
        assertEq(address(coffee).balance, donateAmount, "Contract ETH balance incorrect");
    }
    
    function test_RevertIf_DonateWithEthZero() public {
        vm.startPrank(supporter);
        vm.expectRevert("Amount > 0");
        coffee.donateWithEth{value: 0}(creator, "Zero");
        vm.stopPrank();
    }
    
    function test_RevertIf_DonateWithEthInvalidCreator() public {
        vm.startPrank(supporter);
        vm.expectRevert("Invalid creator");
        coffee.donateWithEth{value: 1 ether}(address(0), "Fail");
        vm.stopPrank();
    }
    
    /* ============ TEST DONATE WITH USD AMOUNT ============ */
    
    function test_DonateWithUsdAmount_Success() public {
        // Want to donate $5 USD (with 8 decimals: 500000000)
        uint256 usdAmount = 5 * 1e8;
        string memory message = "Great work!";
        
        // Get required ETH
        uint256 requiredEth = coffee.getUsdToEth(usdAmount);
        
        // Calculate creator amount after fee
        uint256 fee = (requiredEth * 2) / 100;
        uint256 creatorAmount = requiredEth - fee;
        
        vm.startPrank(supporter);
        
        // Check event
        vm.expectEmit(true, true, false, true);
        emit Donation(creator, supporter, requiredEth, usdAmount, message);
        
        // Donate with exact ETH needed
        coffee.donateWithUsdAmount{value: requiredEth}(creator, usdAmount, message);
        vm.stopPrank();
        
        // Verify balance
        assertEq(coffee.creatorBalance(creator), creatorAmount, "Creator balance incorrect");
    }
    
    function test_RevertIf_DonateWithUsdAmountInsufficientEth() public {
        uint256 usdAmount = 5 * 1e8;
        uint256 requiredEth = coffee.getUsdToEth(usdAmount);
        
        vm.startPrank(supporter);
        vm.expectRevert("Insufficient ETH sent");
        // Send less than required
        coffee.donateWithUsdAmount{value: requiredEth - 0.001 ether}(creator, usdAmount, "Fail");
        vm.stopPrank();
    }
    
    /* ============ TEST WITHDRAW ============ */
    
    function test_Withdraw_Success() public {
        // Setup: Donate 1 ETH first
        uint256 donateAmount = 1 ether;
        vm.prank(supporter);
        coffee.donateWithEth{value: donateAmount}(creator, "Support");
        
        // Get withdrawable amount
        uint256 withdrawableAmount = coffee.creatorBalance(creator);
        uint256 creatorBalanceBefore = creator.balance;
        
        // Creator withdraws
        vm.startPrank(creator);
        
        // Check event
        vm.expectEmit(true, false, false, true);
        emit Withdrawal(creator, withdrawableAmount);
        
        coffee.withdraw(withdrawableAmount);
        vm.stopPrank();
        
        // Verify balance is 0
        assertEq(coffee.creatorBalance(creator), 0, "Balance should be 0");
        
        // Verify creator received ETH
        assertEq(creator.balance, creatorBalanceBefore + withdrawableAmount, "Creator should receive ETH");
    }
    
    function test_RevertIf_WithdrawTooMuch() public {
        // Donate small amount
        vm.prank(supporter);
        coffee.donateWithEth{value: 0.1 ether}(creator, "Small");
        
        // Try to withdraw more than balance
        vm.startPrank(creator);
        vm.expectRevert("Insufficient balance");
        coffee.withdraw(1 ether);
        vm.stopPrank();
    }
    
    function test_RevertIf_WithdrawZero() public {
        vm.startPrank(creator);
        vm.expectRevert("Amount > 0");
        coffee.withdraw(0);
        vm.stopPrank();
    }
    
    /* ============ TEST PRICE FEED FUNCTIONS ============ */
    
    function test_GetLatestPrice() public {
        int256 price = coffee.getLatestPrice();
        assertEq(price, 3000 * 1e8, "Price should be $3000");
        assertTrue(price > 0, "Price should be positive");
    }
    
    function test_GetEthToUsd() public {
        uint256 ethAmount = 1 ether;
        uint256 usdAmount = coffee.getEthToUsd(ethAmount);
        
        // At $3000/ETH: 1 ETH = 3000 USD (NO decimals - contract returns plain number)
        // The contract divides by 1e26, which removes the 8 decimals
        assertEq(usdAmount, 3000, "USD conversion incorrect");
    }
    
    function test_GetUsdToEth() public {
        uint256 usdAmount = 3000 * 1e8; // $3000
        uint256 ethAmount = coffee.getUsdToEth(usdAmount);
        
        // Should be approximately 1 ETH
        assertApproxEqRel(ethAmount, 1 ether, 0.01e18, "ETH conversion incorrect");
    }
    
    function test_GetBalance() public {
        // Donate 1 ETH
        vm.prank(supporter);
        coffee.donateWithEth{value: 1 ether}(creator, "Test");
        
        // Get balance
        (uint256 ethBalance, uint256 usdBalance) = coffee.getBalance(creator);
        
        // Verify ETH balance (after 2% fee: 0.98 ETH)
        assertEq(ethBalance, 0.98 ether, "ETH balance incorrect");
        
        // Verify USD balance (0.98 ETH * $3000 = $2940)
        // Contract returns plain number without 8 decimals
        assertEq(usdBalance, 2940, "USD balance incorrect");
    }
    
    /* ============ TEST MULTIPLE DONATIONS ============ */
    
    function test_MultipleDonations() public {
        address supporter2 = makeAddr("supporter2");
        vm.deal(supporter2, 100 ether);
        
        // First donation
        vm.prank(supporter);
        coffee.donateWithEth{value: 1 ether}(creator, "First");
        
        // Second donation
        vm.prank(supporter2);
        coffee.donateWithEth{value: 0.5 ether}(creator, "Second");
        
        // Total donated: 1.5 ETH
        // After 2% fee: 1.47 ETH
        uint256 expectedBalance = (1 ether * 98 / 100) + (0.5 ether * 98 / 100);
        assertEq(coffee.creatorBalance(creator), expectedBalance, "Multiple donations balance incorrect");
    }
    
    /* ============ TEST PLATFORM FEE ============ */
    
    function test_PlatformFee() public {
        assertEq(coffee.platformFee(), 2, "Platform fee should be 2%");
    }
    
    function test_FeeCalculation() public {
        uint256 donateAmount = 10 ether;
        
        vm.prank(supporter);
        coffee.donateWithEth{value: donateAmount}(creator, "Fee test");
        
        // Creator should receive 98% (2% fee)
        uint256 expectedAmount = (donateAmount * 98) / 100;
        assertEq(coffee.creatorBalance(creator), expectedAmount, "Fee calculation incorrect");
        
        // Contract holds full amount
        assertEq(address(coffee).balance, donateAmount, "Contract balance incorrect");
    }
}

// Mock Chainlink Aggregator for testing
contract MockV3Aggregator {
    uint8 public decimals;
    int256 public latestAnswer;
    
    constructor(uint8 _decimals, int256 _initialAnswer) {
        decimals = _decimals;
        latestAnswer = _initialAnswer;
    }
    
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (
            uint80(1),
            latestAnswer,
            block.timestamp,
            block.timestamp,
            uint80(1)
        );
    }
    
    function updateAnswer(int256 _answer) external {
        latestAnswer = _answer;
    }
}