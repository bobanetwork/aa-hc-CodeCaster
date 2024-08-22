// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.19;

import "forge-std/Test.sol";
import "../contracts/SimpleContract.sol";
import "../contracts/Translator.sol";

contract MockHybridAccount {
    function get_back_general(string memory instruction) public returns(string memory) {
        return "100";
    }
}

contract TokenPriceTest is Test {
    SimpleContract public simpleContract;
    Translator public translator;
    MockHybridAccount public mockHA;

    event FetchPriceError(uint32 err);
    event FetchPriceRet(bytes err);

    function setUp() public {
        mockHA = new MockHybridAccount();
        translator = new Translator(payable(address(mockHA)));
        simpleContract = new SimpleContract(address(translator));
    }

    function testWinningNumber() public {
        vm.mockCall(
            address(translator),
            abi.encodeWithSelector(Translator.get_back_general.selector),
            abi.encode("100")
        );

        uint256 timestampBefore = block.timestamp;
        simpleContract.pickWinningNumber();

        string memory winningNumber = simpleContract.winningNumber();

        assert(compareStrings(winningNumber, "100"));
    }

    function compareStrings(string memory a, string memory b) public view returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }
}
