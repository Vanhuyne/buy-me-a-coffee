// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {Web3Coffee} from "../../src/contract/Web3Coffee.sol";

contract DeployWeb3CoffeeVer2 is Script {
    function run() external {
        // ETH/USD Price Feed for Base Sepolia
        address priceFeed = 0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1;
        
        // For Base Mainnet, use: 0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70

        vm.startBroadcast();

        Web3Coffee coffee = new Web3Coffee(priceFeed);
        
        vm.stopBroadcast();
    }
}