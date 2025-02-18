from web3 import Web3
from jsonrpclib.SimpleJSONRPCServer import SimpleJSONRPCServer, SimpleJSONRPCRequestHandler
from server_action import offchain_text2multi
from hybrid_compute_sdk import HybridComputeSDK
import logging

# Initialize logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def server_loop():
    # new sdk instance
    sdk = HybridComputeSDK()
    # prepare the server
    sdk.create_json_rpc_server_instance()
    # add a custom server action
    sdk.add_server_action("text2multi(string)", offchain_text2multi)
    # start server
    print("Actions added, serving")
    sdk.serve_forever()

server_loop()
