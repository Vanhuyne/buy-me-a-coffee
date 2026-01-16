// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {Web3Coffee} from "../../src/contract/Web3Coffee.sol";

contract DeployScript is Script {
    function run() public {
        // USDC address on Base Sepolia
        address usdcAddress = 0x124c5Ae201B24146423a88c79aE6E4Ad33234c7E;

       vm.startBroadcast();

        Web3Coffee web3Coffee = new Web3Coffee(usdcAddress);

        vm.stopBroadcast();

        console.log("Web3Coffee deployed at:", address(web3Coffee));
        console.log("USDC address:", usdcAddress);
    }
}