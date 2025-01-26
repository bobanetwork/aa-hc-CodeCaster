from eth_abi import abi as ethabi
from eth_abi import encode
from utils.userop_utils import *

def run():
    print("Calling: SubmitResults")

    ENTRY_POINT = '0x0000000071727De22E5E9d8BAf0edAc6f37da032'
    CONTRACT = '0x317D94C2E84ADAC31ED39D5F31287F99A5BB2BFA'
    USER_ACCOUNT = '0x96f6528F54468a9D9a06559B4a0a40FFD9fE4E40'

    aa = aa_rpc(ENTRY_POINT, w3, bundler_rpc)

    # Let's print the exact calldata we're generating
    message = "send 0.00000001 eth to 0x000000000000000000000000000000000000dead"
    func_call = selector("do_it(string)")
    params = encode(['string'], [message])
    print("Function selector:", func_call.hex())
    print("Encoded params:", params.hex())

    calldata = func_call + params
    print("Full calldata:", calldata.hex())

    op = aa.build_op(USER_ACCOUNT, CONTRACT, 0, calldata, nKey)

    op['preVerificationGas'] = Web3.to_hex(25238)
    op['verificationGasLimit'] = Web3.to_hex(105238)
    op['callGasLimit'] = Web3.to_hex(10000)
    op['initCode'] = '0x'
    # Estimate gas
#     (success, op) = estimateOp(aa, op)
#     if not success:
#         print("𐄂 Gas estimation failed")
#         return
    # Now sign and submit
    rcpt = aa.sign_submit_op(op, u_key)
    print("Receipt:", rcpt)

run()