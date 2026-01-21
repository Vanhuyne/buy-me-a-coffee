// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../../src/contract/Web3CoffeeOptimized.sol";

contract DeployWeb3CoffeeMainnet is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // ⚠️ MAINNET - Base Mainnet ETH/USD Price Feed
        // Chainlink ETH/USD on Base Mainnet: 0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70
        // Source: https://docs.chain.link/data-feeds/price-feeds/addresses?network=base
        address priceFeed = 0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70;
        
        // Configuration for PRODUCTION
        uint8 platformFee = 2; // 2% platform fee
        uint256 minDonation = 0.0001 ether; // 0.0001 ETH minimum (~$0.30 at $3000/ETH)
        
        vm.startBroadcast(deployerPrivateKey);
        
        Web3CoffeeOptimized coffee = new Web3CoffeeOptimized(
            priceFeed,
            platformFee,
            minDonation
        );
        
        console.log("========================================");
        console.log("PRODUCTION DEPLOYMENT - BASE MAINNET");
        console.log("========================================");
        console.log("Web3CoffeeOptimized deployed to:", address(coffee));
        console.log("Owner:", coffee.owner());
        console.log("Platform Fee:", coffee.platformFee(), "%");
        console.log("Min Donation:", coffee.minDonation(), "wei");
        console.log("Min Donation ETH:", coffee.minDonation() / 1e18, "ETH");
        console.log("Chainlink Price Feed:", priceFeed);
        console.log("========================================");
        console.log("IMPORTANT: Save this contract address!");
        console.log("========================================");
        
        // Verify price feed is working
        try coffee.isPriceFeedHealthy() returns (bool healthy) {
            console.log("Price Feed Status:", healthy ? "HEALTHY" : "UNHEALTHY");
            if (healthy) {
                int256 price = coffee.getLatestPrice();
                console.log("Current ETH Price:", uint256(price) / 1e8, "USD");
            }
        } catch {
            console.log("WARNING: Could not verify price feed health");
        }
        
        vm.stopBroadcast();
    }
}
