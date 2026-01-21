// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../../src/contract/Web3CoffeeOptimized.sol";

contract DeployWeb3CoffeeOptimized is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Base Sepolia ETH/USD Price Feed
        address priceFeed = 0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1;
        
        // Configuration
        uint8 platformFee = 2; // 2%
        uint256 minDonation = 0.00001 ether; // 0.00001 ETH minimum
        
        vm.startBroadcast(deployerPrivateKey);
        
        Web3CoffeeOptimized coffee = new Web3CoffeeOptimized(
            priceFeed,
            platformFee,
            minDonation
        );
        
        console.log("Web3CoffeeOptimized deployed to:", address(coffee));
        console.log("Owner:", coffee.owner());
        console.log("Platform Fee:", coffee.platformFee(), "%");
        console.log("Min Donation:", coffee.minDonation(), "wei");
        
        vm.stopBroadcast();
    }
}
