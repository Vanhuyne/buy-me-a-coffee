// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {Web3Coffee} from "../../src/contract/Web3Coffee.sol";

contract DeployWeb3Coffee is Script {
    function run() external {
        address usdc = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;

        vm.startBroadcast();

        new Web3Coffee(usdc);

        vm.stopBroadcast();
    }
}