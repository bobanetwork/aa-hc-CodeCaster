from web3 import Web3
from jsonrpclib.SimpleJSONRPCServer import SimpleJSONRPCServer, SimpleJSONRPCRequestHandler
from text2call import offchain_text2multi

def selector(name):
    nameHash = Web3.to_hex(Web3.keccak(text=name))
    return nameHash[2:10]

class RequestHandler(SimpleJSONRPCRequestHandler):
    rpc_paths = ('/', '/hc')

def offchain_hello(ver, sk, src_addr, src_nonce, oo_nonce, payload, *args):
    return { "success":True, "response":payload, "signature":"0x" }

def server_loop():
    server = SimpleJSONRPCServer(('0.0.0.0', 1234), requestHandler=RequestHandler)
    server.register_function(offchain_hello, "hello")
    server.register_function(offchain_text2multi, selector("text2multi(string)"))
    print("Serving ")
    print("PORT => {}".format(1234))
    server.serve_forever()

server_loop()  # Run until killed
