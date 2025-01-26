from eth_abi import abi as ethabi
from eth_abi import encode
from utils.userop_utils import *

# $ python auto-request-transfer.py

def run():
    print("Calling: Transfer 0.000000001 eth to 0x000000000000000000000000000000000000dead")

    ENTRY_POINT = '0x0000000071727De22E5E9d8BAf0edAc6f37da032'
    CONTRACT = '0x317D94C2E84ADAC31ED39D5F31287F99A5BB2BFA'
    USER_ACCOUNT = '0xE7aEE557FbdA3341B542BA4f624e93a6118ced4A'
#   OTHER_USER_ACCOUNT = '0x96f6528F54468a9D9a06559B4a0a40FFD9fE4E40'

    aa = aa_rpc(ENTRY_POINT, w3, bundler_rpc)

    message = "send 0.00000001 eth to 0x000000000000000000000000000000000000dead"
    func_call = selector("do_it(string)")
    params = encode(['string'], [message])
    print("Function selector:", func_call.hex())
    print("Encoded params:", params.hex())

    calldata = func_call + params
    print("Full calldata:", calldata.hex())

    value = Web3.to_wei(0.00000001, 'ether')  # Converts 0.00000001 ETH to Wei
    op = aa.build_op(USER_ACCOUNT, CONTRACT, value, calldata, nKey)

    print("Op before estimation")
    print("op", op)

    (success, op) = estimateOp(aa, op)
    if not success:
        print("𐄂 Gas estimation failed")
        return


#     Now sign and submit
    rcpt = aa.sign_submit_op(op, u_key)
    print("Receipt:", rcpt)

run()