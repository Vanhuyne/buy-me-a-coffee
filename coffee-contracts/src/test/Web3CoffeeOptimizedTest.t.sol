// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../../src/contract/Web3CoffeeOptimized.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract Web3CoffeeOptimizedTest is Test {
    Web3CoffeeOptimized public coffee;
    address public owner;
    address public creator;
    address public supporter;
    
    // Mock price feed
    address constant PRICE_FEED = 0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1; // Base Sepolia
    
    uint8 constant PLATFORM_FEE = 2; // 2%
    uint256 constant MIN_DONATION = 0.00001 ether;
    
    event Donation(
        address indexed creator,
        address indexed supporter,
        uint256 ethAmount,
        uint256 usdAmount,
        string message
    );
    
    event Withdrawal(address indexed creator, uint256 amount);
    event PlatformFeeWithdrawn(address indexed owner, uint256 amount);

    function setUp() public {
        // Use Base Sepolia fork for testing
        string memory rpcUrl = vm.envString("BASE_SEPOLIA_RPC_URL");
        vm.createSelectFork(rpcUrl);
        
        owner = address(this);
        creator = makeAddr("creator");
        supporter = makeAddr("supporter");
        
        // Deploy contract
        coffee = new Web3CoffeeOptimized(PRICE_FEED, PLATFORM_FEE, MIN_DONATION);
        
        // Fund supporter
        vm.deal(supporter, 10 ether);
    }

    // ============================================
    // DEPLOYMENT TESTS
    // ============================================
    function test_Deployment() public view {
        assertEq(coffee.owner(), owner);
        assertEq(coffee.platformFee(), PLATFORM_FEE);
        assertEq(coffee.minDonation(), MIN_DONATION);
        assertEq(coffee.paused(), false);
        assertEq(coffee.platformBalance(), 0);
    }
    
    function testFail_DeployWithZeroAddress() public {
        new Web3CoffeeOptimized(address(0), PLATFORM_FEE, MIN_DONATION);
    }
    
    function testFail_DeployWithInvalidFee() public {
        new Web3CoffeeOptimized(PRICE_FEED, 101, MIN_DONATION);
    }

    // ============================================
    // PRICE FEED TESTS
    // ============================================
    function test_GetLatestPrice() public view {
        int256 price = coffee.getLatestPrice();
        assertGt(price, 0);
        console.log("ETH Price:", uint256(price));
    }
    
    function test_GetEthToUsd() public view {
        uint256 usdAmount = coffee.getEthToUsd(1 ether);
        assertGt(usdAmount, 0);
        console.log("1 ETH =", usdAmount, "USD (8 decimals)");
    }
    
    function test_GetUsdToEth() public view {
        uint256 ethAmount = coffee.getUsdToEth(500000000); // $5.00
        assertGt(ethAmount, 0);
        console.log("$5 =", ethAmount, "wei");
    }
    
    function test_PriceFeedHealthy() public view {
        assertTrue(coffee.isPriceFeedHealthy());
    }

    // ============================================
    // DONATION TESTS
    // ============================================
    function test_DonateWithEth() public {
        uint256 donationAmount = 0.1 ether;
        
        vm.startPrank(supporter);
        
        vm.expectEmit(true, true, false, false);
        emit Donation(creator, supporter, donationAmount, 0, "Test donation");
        
        coffee.donateWithEth{value: donationAmount}(creator, "Test donation");
        
        vm.stopPrank();
        
        uint256 expectedCreatorBalance = (donationAmount * 98) / 100; // 98%
        uint256 expectedPlatformBalance = (donationAmount * 2) / 100; // 2%
        
        assertEq(coffee.creatorBalance(creator), expectedCreatorBalance);
        assertEq(coffee.platformBalance(), expectedPlatformBalance);
    }
    
    function test_DonateWithUsdAmount() public {
        uint256 usdAmount = 500000000; // $5.00
        uint256 requiredEth = coffee.getUsdToEth(usdAmount);
        
        vm.startPrank(supporter);
        coffee.donateWithUsdAmount{value: requiredEth}(creator, usdAmount, "USD donation");
        vm.stopPrank();
        
        assertGt(coffee.creatorBalance(creator), 0);
    }
    
    function test_DonateWithExcessETH() public {
        uint256 usdAmount = 500000000; // $5.00
        uint256 requiredEth = coffee.getUsdToEth(usdAmount);
        uint256 sentEth = requiredEth + 0.01 ether; // Send excess
        
        uint256 balanceBefore = supporter.balance;
        
        vm.startPrank(supporter);
        coffee.donateWithUsdAmount{value: sentEth}(creator, usdAmount, "Excess test");
        vm.stopPrank();
        
        uint256 balanceAfter = supporter.balance;
        
        // Should refund excess
        assertApproxEqAbs(balanceBefore - balanceAfter, requiredEth, 0.0001 ether);
    }
    
    function testFail_DonateBelowMinimum() public {
        vm.startPrank(supporter);
        coffee.donateWithEth{value: 0.000001 ether}(creator, "Too small");
        vm.stopPrank();
    }
    
    function testFail_DonateToZeroAddress() public {
        vm.startPrank(supporter);
        coffee.donateWithEth{value: 0.1 ether}(address(0), "Invalid");
        vm.stopPrank();
    }
    
    function testFail_DonateWhenPaused() public {
        coffee.setPaused(true);
        
        vm.startPrank(supporter);
        coffee.donateWithEth{value: 0.1 ether}(creator, "Paused");
        vm.stopPrank();
    }

    // ============================================
    // WITHDRAWAL TESTS
    // ============================================
    function test_Withdraw() public {
        // Setup: Make a donation
        uint256 donationAmount = 0.1 ether;
        vm.prank(supporter);
        coffee.donateWithEth{value: donationAmount}(creator, "Setup");
        
        uint256 creatorBalance = coffee.creatorBalance(creator);
        uint256 balanceBefore = creator.balance;
        
        // Withdraw
        vm.prank(creator);
        coffee.withdraw(creatorBalance);
        
        uint256 balanceAfter = creator.balance;
        
        assertEq(coffee.creatorBalance(creator), 0);
        assertEq(balanceAfter - balanceBefore, creatorBalance);
    }
    
    function test_WithdrawAll() public {
        // Setup: Make multiple donations
        vm.startPrank(supporter);
        coffee.donateWithEth{value: 0.1 ether}(creator, "Donation 1");
        coffee.donateWithEth{value: 0.05 ether}(creator, "Donation 2");
        vm.stopPrank();
        
        uint256 creatorBalance = coffee.creatorBalance(creator);
        uint256 balanceBefore = creator.balance;
        
        // Withdraw all
        vm.prank(creator);
        coffee.withdrawAll();
        
        uint256 balanceAfter = creator.balance;
        
        assertEq(coffee.creatorBalance(creator), 0);
        assertEq(balanceAfter - balanceBefore, creatorBalance);
    }
    
    function testFail_WithdrawMoreThanBalance() public {
        vm.prank(supporter);
        coffee.donateWithEth{value: 0.1 ether}(creator, "Setup");
        
        uint256 balance = coffee.creatorBalance(creator);
        
        vm.prank(creator);
        coffee.withdraw(balance + 1 ether); // Should fail
    }
    
    function test_WithdrawPlatformFee() public {
        // Setup: Make donations to accumulate fees
        vm.startPrank(supporter);
        coffee.donateWithEth{value: 1 ether}(creator, "Big donation");
        vm.stopPrank();
        
        uint256 platformBalance = coffee.platformBalance();
        assertGt(platformBalance, 0);
        
        uint256 ownerBalanceBefore = owner.balance;
        
        // Withdraw platform fee
        coffee.withdrawPlatformFee(platformBalance);
        
        uint256 ownerBalanceAfter = owner.balance;
        
        assertEq(coffee.platformBalance(), 0);
        assertEq(ownerBalanceAfter - ownerBalanceBefore, platformBalance);
    }
    
    function test_WithdrawAllPlatformFees() public {
        vm.startPrank(supporter);
        coffee.donateWithEth{value: 1 ether}(creator, "Donation");
        vm.stopPrank();
        
        uint256 platformBalance = coffee.platformBalance();
        uint256 ownerBalanceBefore = owner.balance;
        
        coffee.withdrawAllPlatformFees();
        
        uint256 ownerBalanceAfter = owner.balance;
        
        assertEq(coffee.platformBalance(), 0);
        assertEq(ownerBalanceAfter - ownerBalanceBefore, platformBalance);
    }
    
    function testFail_NonOwnerWithdrawPlatformFee() public {
        vm.prank(supporter);
        coffee.donateWithEth{value: 1 ether}(creator, "Setup");
        
        vm.prank(supporter);
        coffee.withdrawPlatformFee(100); // Should fail
    }

    // ============================================
    // ADMIN TESTS
    // ============================================
    function test_SetPlatformFee() public {
        uint8 newFee = 5;
        coffee.setPlatformFee(newFee);
        assertEq(coffee.platformFee(), newFee);
    }
    
    function testFail_SetInvalidPlatformFee() public {
        coffee.setPlatformFee(101); // Should fail
    }
    
    function test_SetMinDonation() public {
        uint256 newMin = 0.001 ether;
        coffee.setMinDonation(newMin);
        assertEq(coffee.minDonation(), newMin);
    }
    
    function test_SetPaused() public {
        coffee.setPaused(true);
        assertTrue(coffee.paused());
        
        coffee.setPaused(false);
        assertFalse(coffee.paused());
    }
    
    function test_TransferOwnership() public {
        address newOwner = makeAddr("newOwner");
        coffee.transferOwnership(newOwner);
        assertEq(coffee.owner(), newOwner);
    }
    
    function testFail_TransferOwnershipToZero() public {
        coffee.transferOwnership(address(0));
    }
    
    function testFail_NonOwnerSetFee() public {
        vm.prank(supporter);
        coffee.setPlatformFee(5);
    }

    // ============================================
    // VIEW FUNCTION TESTS
    // ============================================
    function test_GetBalance() public {
        vm.prank(supporter);
        coffee.donateWithEth{value: 0.1 ether}(creator, "Test");
        
        (uint256 ethBalance, uint256 usdBalance) = coffee.getBalance(creator);
        
        assertGt(ethBalance, 0);
        assertGt(usdBalance, 0);
    }
    
    function test_GetContractInfo() public view {
        (
            address _owner,
            uint8 _platformFee,
            uint256 _minDonation,
            uint256 _platformBalance,
            bool _paused
        ) = coffee.getContractInfo();
        
        assertEq(_owner, owner);
        assertEq(_platformFee, PLATFORM_FEE);
        assertEq(_minDonation, MIN_DONATION);
        assertEq(_platformBalance, 0);
        assertEq(_paused, false);
    }

    // ============================================
    // GAS OPTIMIZATION TESTS
    // ============================================
    function test_GasComparison_Donate() public {
        uint256 gasBefore = gasleft();
        
        vm.prank(supporter);
        coffee.donateWithEth{value: 0.1 ether}(creator, "Gas test");
        
        uint256 gasUsed = gasBefore - gasleft();
        console.log("Gas used for donation:", gasUsed);
        
        // Should be more efficient than original
        assertLt(gasUsed, 100000);
    }
}
