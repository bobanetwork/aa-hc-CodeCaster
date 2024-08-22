// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../contracts/samples/HybridAccount.sol";
import "../contracts/samples/TokenPaymaster.sol";
import "../contracts/core/HCHelper.sol";
import "../contracts/samples/HybridAccountFactory.sol";
import "../contracts/SimpleContract.sol";
import {Translator} from "../contracts/Translator.sol";

contract DeployExample is Script {
    // Configs
    uint256 public deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    address public deployerAddress;
    string public backendURL = vm.envString("BACKEND_URL"); // default backend for boba sepolia
    address public hcHelperAddr = vm.envAddress("HC_HELPER_ADDR"); // System-wide HCHelper

    // Contracts
    address public entrypoint = vm.envAddress("ENTRY_POINT"); // system wide
    address public haFactory = address(0x3DD6EE2e539CCd7EaB881173fB704f766e877848); // System-wide Account factory

    // Contracts
    HybridAccount public hybridAccount;
    HCHelper public hcHelper;
    SimpleContract public simpleContract;
    TokenPaymaster public tokenPaymaster;

    function run() public {
        deployerAddress = vm.addr(deployerPrivateKey);

        tokenPaymaster = TokenPaymaster(address(0x8223388f7aF211d84289783ed97ffC5Fefa14256));
        console.log(address(tokenPaymaster.entryPoint()));

        vm.startBroadcast(deployerPrivateKey);

        hcHelper = new HCHelper(
            entrypoint,
            hcHelperAddr
        );

        // Deploy using HybridAccountFactory, salt = block.number to force redeploy HybridAccount if already existing from this wallet
        hybridAccount = HybridAccountFactory(haFactory).createAccount(deployerAddress, block.number);
        IEntryPoint(entrypoint).depositTo{value: 0.01 ether}(address(hybridAccount));
        IEntryPoint(entrypoint).depositTo{value: 0.01 ether}(address(tokenPaymaster)); // might be redundant
        tokenPaymaster.deposit{value: 0.01 ether}();

        console.log(address(hybridAccount));

        // deploy your own contract
        Translator translator = new Translator(payable(hybridAccount));
        simpleContract = new SimpleContract(address(translator));

        // register url, add credit
        // only owner - reach out to Boba foundation: hcHelper.RegisterUrl(address(hybridAccount), backendURL);
        hcHelper.AddCredit(address(hybridAccount), 100);
        hybridAccount.PermitCaller(address(simpleContract), true);
        // permit caller
        hybridAccount.initialize(deployerAddress);
        vm.stopBroadcast();
    }
}