// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

interface ITranslator {
    function get_back_general(string memory instruction) external returns(string memory);
    function do_it(string memory instruction) external payable;
    function get_back(string memory instruction) external returns(address target, uint256 txValue, bytes memory txData);
}

contract SimpleContract {
    string public winningNumber;

    address public translator;

    struct Player {
        string pickedNumber;
        address playerAddr;
    }

    mapping (address => Player) public playerMap;

    constructor(address _translator) {
        translator = _translator;
    }

    function pickNumber(string memory number) public {
        playerMap[msg.sender] = Player(number, msg.sender);
    }

    // general AI call which replies with a single word answer
    function pickWinningNumber() public {
        winningNumber = ITranslator(translator).get_back_general('Generate a number between 1 and 10 which is not a prime');
    }

    // calldata generation call, AI parses and gives "transfer", "100", "USD", "Boba", "caller" to the offchain rpc
    function transferPrize() public {
        if (keccak256(bytes(playerMap[msg.sender].pickedNumber)) == keccak256(bytes(winningNumber))) {
            ITranslator(translator).do_it('Transfer 100 USD worth of Boba tokens to the caller');
            // OR
            //translator.call('Transfer 100 USD worth of Boba tokens to the caller');
        }
    }

    // calldata generation call, AI parses and gives "approve", "200", "USD", "Boba", "translator" to the offchain rpc
    function approveBoba() public {
        (address target, , bytes memory txData) = ITranslator(translator).get_back('Approve 200 USD worth of Boba tokens to the translator');
        (bool success, ) = target.call(txData);
        require(success);
    }
}