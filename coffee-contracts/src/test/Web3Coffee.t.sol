// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contract/Web3Coffee.sol";
import "../contract/MockUSDC.sol";

contract Web3CoffeeTest is Test {
    Web3Coffee public coffee;
    MockUSDC public usdc;

    address public owner;
    address public creator;
    address public supporter;

    // check log event
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

    function setUp() public {
        // create addresses for owner, creator, supporter
        owner = makeAddr("owner");
        creator = makeAddr("creator");
        supporter = makeAddr("supporter");
        
        // Deploy Mock USDC and Web3Coffee under owner
        vm.startPrank(owner);
        usdc = new MockUSDC();
        coffee = new Web3Coffee(address(usdc));
        vm.stopPrank();

        // Mint 1000 USDC for supporter to test
        usdc.mint(supporter, 1000 * 10**6); 
    }

    /* ============ TEST DONATE ============ */

    function test_Donate_Success() public {
        uint256 donateAmount = 100 * 10**6; // 100 USDC
        string memory message = "Keep it up!";
        
        // calculate expected creator amount after fee
        uint256 fee = (donateAmount * 2) / 100;
        uint256 creatorAmount = donateAmount - fee;

        vm.startPrank(supporter);
        // Approve contract to spend supporter's USDC
        usdc.approve(address(coffee), donateAmount);

        // Check event emitted correctly
        vm.expectEmit(true, true, false, true);
        emit Donation(creator, supporter, creatorAmount, message);

        // Perform donate
        coffee.donate(creator, donateAmount, message);
        vm.stopPrank();

        // Check logic
        // 1. Balance recorded in contract for creator must be correct
        assertEq(coffee.getBalance(creator), creatorAmount, "Creator internal balance incorrect");
        
        // 2. Actual USDC balance in contract must increase by donateAmount
        assertEq(usdc.balanceOf(address(coffee)), donateAmount, "Contract USDC balance incorrect");
    }

    function test_RevertIf_DonateZero() public {
        vm.startPrank(supporter);
        vm.expectRevert("Amount > 0");
        coffee.donate(creator, 0, "Zero");
        vm.stopPrank();
    }

    function test_RevertIf_InvalidCreator() public {
        vm.startPrank(supporter);
        usdc.approve(address(coffee), 100);
        
        vm.expectRevert("Invalid creator");
        coffee.donate(address(0), 100, "Fail");
        vm.stopPrank();
    }

    /* ============ TEST WITHDRAW ============ */

    function test_Withdraw_Success() public {
        // Setup: Donate 100 USDC to creator
        uint256 donateAmount = 100 * 10**6;
        vm.startPrank(supporter);
        usdc.approve(address(coffee), donateAmount);
        coffee.donate(creator, donateAmount, "Support");
        vm.stopPrank();

        // Get current balance of creator in contract
        uint256 withdrawableAmount = coffee.getBalance(creator);
        
        // Creator performs withdrawal
        vm.startPrank(creator);
        
        // Check event withdraw
        vm.expectEmit(true, false, false, true);
        emit Withdrawal(creator, withdrawableAmount);
        
        coffee.withdraw(withdrawableAmount);
        vm.stopPrank();

        // Check after withdrawal
        // 1. Balance in contract should be 0
        assertEq(coffee.getBalance(creator), 0, "Internal balance should be 0");
        
        // 2. Creator receives USDC in their wallet
        assertEq(usdc.balanceOf(creator), withdrawableAmount, "Creator should receive USDC");
    }

    function test_RevertIf_WithdrawTooMuch() public {
        // Setup: Donate small amount to creator
        vm.startPrank(supporter);
        usdc.approve(address(coffee), 1000);
        coffee.donate(creator, 1000, "Small");
        vm.stopPrank();

        // Intentionally withdraw more than balance
        vm.startPrank(creator);
        vm.expectRevert("Insufficient balance");
        coffee.withdraw(2000); 
        vm.stopPrank();
    }
    
    function test_RevertIf_WithdrawZero() public {
        vm.startPrank(creator);
        vm.expectRevert("Amount > 0");
        coffee.withdraw(0);
        vm.stopPrank();
    }
}


