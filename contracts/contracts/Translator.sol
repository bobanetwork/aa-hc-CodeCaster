import "./HybridAccount.sol";

// User Account approves this contract for using commands that include erc20 tokens
contract Translator {

    address payable immutable hybridAccountAddress;

    constructor(address payable _hybridAccountAddress) {
      hybridAccountAddress = _hybridAccountAddress;
    }

    /**
     * Generates calldata, target from the prompt and calls the target with calldata from this contract
     */
    function do_it(string memory instruction) public payable {
        HybridAccount HA = HybridAccount(hybridAccountAddress);
        bytes memory req = abi.encodeWithSignature("text2multi(string)", instruction);
        bytes32 userKey = bytes32(abi.encode(msg.sender));
        (uint32 error, bytes memory ret) = HA.CallOffchain(userKey, req);

        if (error == 0) {
           bytes[] memory instructions = abi.decode(ret,(bytes[]));
           require(instructions.length > 0, "Received empty response");

           for (uint256 i = 0; i < instructions.length; i++) {
               (address payable target, uint256 value_ret, bytes memory call_data) = abi.decode(instructions[i],(address,uint256,bytes));
               // require(value_ret <= msg.value, "You didn't give me funds");

               (bool success,) = target.call{value: value_ret}(call_data);
               require(success, "Target call failed");
           }
       } else {
           revert(string(ret));
       }
    }

    /**
     * Returns calldata for the prompt
     * Contracts that want to invoke calldata directly on their own state use get_back to fetch calldata,
     * that can be subsequently called from the context of the contract
     * the current implementation only support single instruction
     */
    function get_back(string memory instruction) public returns(address target, uint256 txValue, bytes memory txData) {
        HybridAccount HA = HybridAccount(hybridAccountAddress);
        bytes memory req = abi.encodeWithSignature("text2multi(string)", instruction);
        bytes32 userKey = bytes32(abi.encode(msg.sender));
        (uint32 error, bytes memory ret) = HA.CallOffchain(userKey, req);

        if (error == 0) {
           bytes[] memory instructions = abi.decode(ret,(bytes[]));
           require(instructions.length > 0, "Received empty response");

           (address payable target, uint256 txValue, bytes memory txData) = abi.decode(instructions[0],(address,uint256,bytes));
       } else {
           revert(string(ret));
       }
    }

    /**
     * Returns general AI responses (computations, response to queries) in one word
     * Results can be used by contracts directly 
     */
    function get_back_general(string memory instruction) public returns(string memory) {
        HybridAccount HA = HybridAccount(hybridAccountAddress);
        // can alternatively use a new req method "text2Info(string)"
        bytes memory req = abi.encodeWithSignature("text2general(string)", instruction);
        bytes32 userKey = bytes32(abi.encode(msg.sender));
        (uint32 error, bytes memory ret) = HA.CallOffchain(userKey, req);

        if (error == 0) {
           (bytes memory txData) = abi.decode(ret,(bytes));

           // Instead, this can also be merged with get_back and it automatically determines wether this is a calldata req or not
           // with a condition for eg- if target is a specific address = address(1), that means this is
           // a general AI request, no calldata is requested by the user contract, return the decoded txData with the string then
           return string(txData);
       } else {
           revert(string(ret));
       }
    }

    /**
     * Allows invoking the contract by only passing data
     * Note: Its possible that on a very rare occurance, some input texts may have a selector collision with the other methods in the contract
     */
    fallback() external payable {
        HybridAccount HA = HybridAccount(hybridAccountAddress);
        bytes memory req = abi.encodeWithSignature("text2multi(string)", string(msg.data));
        bytes32 userKey = bytes32(abi.encode(msg.sender));
        (uint32 error, bytes memory ret) = HA.CallOffchain(userKey, req);

        if (error == 0) {
           bytes[] memory instructions = abi.decode(ret,(bytes[]));
           require(instructions.length > 0, "Received empty response");

           for (uint256 i = 0; i < instructions.length; i++) {
               (address payable target, uint256 value_ret, bytes memory call_data) = abi.decode(instructions[i],(address,uint256,bytes));
               // require(value_ret <= msg.value, "You didn't give me funds");

               (bool success,) = target.call{value: value_ret}(call_data);
           require(success, "Target call failed");
           }
       } else {
           revert(string(ret));
       }
    }
}
