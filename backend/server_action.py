from web3 import Web3
from eth_abi import abi as ethabi
import re
import os
from openai import OpenAI
import logging
from hybrid_compute_sdk import HybridComputeSDK
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
API_KEY = os.environ.get('OPENAI_APIKEY')
assert (len(API_KEY) > 1)

# Initialize OpenAI
client = OpenAI(api_key=API_KEY)

# Initialize logging and sdk
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
sdk = HybridComputeSDK()

def response_simple_transfer(target, amount):
    # Target is expected to be a valid address including checksum
    calldata = Web3.to_bytes(hexstr="0x")
    return(target, amount, calldata)

def response_token_transfer(sender, recipient, raw_amount, token_addr):
    # ERC20 transfer. Requires pre-calculation of Amount based on appropriate decimals
    # Requires pre-approval, assumes that addresses are valid
    params = ethabi.encode(['address','address','uint256'], [sender, recipient, raw_amount])
    calldata = Web3.to_bytes(hexstr="0x23b872dd") + params # transferFrom(address,address,uint256)
    return(token_addr, 0, calldata)

# response formats supported:
# transfer 0.01 eth to bob.eth -> ('transfer', '0x123', 'bob.eth', '0.01', 'ETH', 'no', '', '')
# transfer 10 usd worth of eth to alice.eth -> ('transfer', '0x123', 'alice.eth', '10', 'ETH', 'yes', 'USD', '')
# swap 100 boba for eth on oolongswap -> ('swap', '0x123', 'oolongswap', '100', 'boba', 'no', '', 'eth')
# if it is rainy in california, send 0.1 eth to bob.eth -> ('weather', 'California', 'rainy') + ('transfer', '0x123', 'bob.eth', '0.1', 'ETH', 'no')
def ai_call(textInput):
    response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "system", "content": "You are an assitant that returns a tuple with the following information based on the input = [type = transfer/swap, sender, recipient, amount, token symbol(crypto), isFiat = yes/no, fiat currency, swapTo token if swap]"},
        {"role": "system", "content": "assume if sender is not specified it is 0x123"},
        {"role": "system", "content": "if its a swap request, srecipient must be the exchange mentioned"},
        {"role": "system", "content": "In case the input looks like a weather/time info request, only return a tuple with: [weather (or) time, location, weather/time attribute]"},
        {"role": "system", "content": "return strings (single quotes) for each item of the tuple and only return a tuple for your answer"},
        {"role": "user", "content": textInput}
    ]
    )

    print(response.choices[0].message.content)
    tuple_str = response.choices[0].message.content
    tuple_list = tuple_str.strip("()").split(", ")
    tuple_items = tuple(item.strip("'") for item in tuple_list)
    print(tuple_items)

    # if condition request is detected return tuples are of the form ('weather', 'California', 'raining')
    if tuple_items[0] in ('weather', 'time'):
        # TODO: Do a weather API call to check condition since OpenAI cannot access internet rn
        return True
    else:
        return tuple_items

# This version changes the response encoding to allow a list of (target,value,calldata) tuples
# so that e.g. the AI could direct the system to perform an ETH/USDC swap followed by a transfer.
# Eventually the original "text2call" can be removed to reduce code duplication, since it is identical
# to a 1-element "multi" list (apart from some extra encoding overhead).

def offchain_text2multi(ver, sk, src_addr, src_nonce, oo_nonce, payload, *args):
    print("  -> offchain_text2multi handler called with ver={} subkey={} src_addr={} src_nonce={} oo_nonce={} payload={} extra_args={}".format(
        ver, sk, src_addr, src_nonce, oo_nonce, payload, args))
    err_code = 0
    resp = Web3.to_bytes(text="unknown error")
    req = None

    try:
        print("starting..")
        req = sdk.parse_req(sk, src_addr, src_nonce, oo_nonce, payload)
        dec = ethabi.decode(['string'], req['reqBytes'])

        condition_text = ""
        condition_result = True
        # 'transfer 0.01 eth to bob.eth'
        req_text = 'send 0.0001 eth to bob.eth'
        target = Web3.to_checksum_address("0x0000000000000000000000000000000000000000")
        calldata = Web3.to_bytes(hexstr="0x")
        value = 0


        if re.search(',', req_text):
            condition_text, req_text = req_text.split(',')
            # Check AI for condition parsing
            condition_result = ai_call(condition_text)

        print("User {} wants the contract to '{}' with optional condition '{}'={} ".format(
            src_addr, req_text, condition_text, condition_result))

        # Some hard-coded examples; replace with an API call once the "AI" is able to generate this data
        alice = Web3.to_checksum_address("0xcd2E72aEBe2A203b84f46DEEC948E6465dB51c75")
        bob   = Web3.to_checksum_address("0x7c68798466a7c9E048Fcb6eb1Ac3A876Ba98d8Ee")
        boba_token = Web3.to_checksum_address("0x4200000000000000000000000000000000000023")

        return_tuples = []

        ai_ret = ('transfer', '0x123', 'alice.eth', '0.0001', 'ETH', 'no', None, None)
        ai_ret = ai_call(req_text)

        print('is', ai_ret)

        # hardcoded, can be replaced with ens resolver
        target_addr = ai_ret[2]
        if ai_ret[2] == 'alice.eth':
            target_addr = alice
        elif ai_ret[2] == 'bob.eth':
            target_addr = bob

        # order -> typeReq, sender, to, value, token, isFiat, fiat, swapToToken
        if ai_ret[0] == 'transfer':
            print("having a transfer here")
            from_addr = ai_ret[1]
            if condition_result == True:
                if ai_ret[5] == 'no': #isFiat?
                    if ai_ret[4].lower() == 'eth':
                        return_tuples.append(response_simple_transfer(target_addr, Web3.to_wei(ai_ret[3],'ether')))
                    elif ai_ret[4].lower() == 'boba':
                        if ai_ret[1] == '0x123':
                            from_addr = src_addr
                        return_tuples.append(response_token_transfer(from_addr, target_addr, Web3.to_wei(ai_ret[3],'ether'), boba_token))
                elif ai_ret[5] == 'yes': #isFiat?
                    # simple usd conversion
                    if ai_ret[4].lower() == 'eth':
                        converted_value = float(ai_ret[3]) * 0.00029
                        converted_value_str = "{:.10f}".format(converted_value)
                        # TODO: sender needs to be feeded in along with the instruction string from the translator contract
                        return_tuples.append(response_simple_transfer(target_addr, Web3.to_wei(converted_value_str,'ether')))
                    elif ai_ret[4].lower() == 'boba':
                        converted_value = float(ai_ret[3]) * 4
                        converted_value_str = "{:.10f}".format(converted_value)
                        if ai_ret[1] == '0x123':
                            from_addr = src_addr
                        return_tuples.append(response_token_transfer(from_addr, target_addr, Web3.to_wei(converted_value_str[3],'ether'), boba_token))
            else:
                return_tuples.append((src_addr, 0, Web3.to_bytes(hexstr="0x")))
        # Swap condition goes here
        # elif ai_ret[0] == 'swap':
        else:
            print ("Unable to process request, returning error")
            err_code = 1
            resp = Web3.to_bytes(text="I did not understand that request")

        if err_code == 0:
            enc_tuples = []
            for i in range(len(return_tuples)):
                print (return_tuples[i])
                enc_tuples.append (ethabi.encode(['address', 'uint256', 'bytes'], return_tuples[i]))
            resp = ethabi.encode(['bytes[]'], [enc_tuples])
    except Exception as e:
        print("DECODE FAILED", e)

    return sdk.gen_response(req, err_code, resp)
