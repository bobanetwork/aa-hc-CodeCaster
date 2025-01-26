from web3 import Web3
from jsonrpclib.SimpleJSONRPCServer import SimpleJSONRPCServer, SimpleJSONRPCRequestHandler
from server_action import offchain_text2multi
from hybrid_compute_sdk import HybridComputeSDK
import logging

# Initialize logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def server_loop():
    print("Booting")
    print("Using EP", os.environ.get('ENTRY_POINTS')
    print("Using HH", os.environ.get('HC_HELPER_ADDR')
    print("Using OO", os.environ.get('OC_OWNER')

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
