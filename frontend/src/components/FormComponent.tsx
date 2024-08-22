import { useContext, useState } from "react";
import { Button } from "./ui/button";
import { defaultSnapOrigin } from "@/config";
import { MetaMaskContext } from "@/hooks/MetamaskContext";
import { concat, FunctionFragment, parseUnits } from "ethers";
import { AbiCoder } from "ethers";
import { hexlify, ethers } from "ethers";
import { CopyIcon } from "./CopyIcon";
import { ADD_SUB_CONTRACT } from "@/config/snap";
import { Buffer } from "buffer";

const FormComponent = () => {
  const [state] = useContext(MetaMaskContext);
  const [inputA, setinputA] = useState<any>("");
  const [inputB, setinputB] = useState<any>(0);
  const [testContract, setTestContract] = useState(ADD_SUB_CONTRACT);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  const abiCoder = new AbiCoder();

  const onReset = () => {
    setinputA("");
    setinputB(0);
  };

  const { selectedAcount, chain } = state;
  const allowedChain = Number(chain) !== 28882;
  const validPrompt = prompt && prompt.length !== 0;

  const onApprove = async () => {
    try {
      if (!selectedAcount || allowedChain || validPrompt) {
        return;
      }

      const funcSelector = FunctionFragment.getSelector("approve", [
        "address",
        "uint256",
      ]);

      const encodedParams = abiCoder.encode(
        ["address", "uint256"],
        [testContract, ethers.MaxUint256]
      );

      const txData = hexlify(concat([funcSelector, encodedParams]));
      //read contract to check allowance method to check if address is already approved. {owner: address, spender:ADD_SUB_CONTRACT} 0x4200000000000000000000000000000000000023

      const transactionDetails = {
        payload: {
          to: "0x4200000000000000000000000000000000000023",
          value: "0",
          data: txData,
          initCode: "",
        },
        account: selectedAcount.id,
        scope: `eip155:${state.chain}`,
      };

      console.log(transactionDetails);

      const txResponse = await window.ethereum?.request({
        method: "wallet_invokeSnap",
        params: {
          snapId: defaultSnapOrigin,
          request: {
            method: "eth_sendUserOpBoba", // operation to send the data to bundler
            params: [transactionDetails],
            id: selectedAcount?.id,
          },
        },
      });

      setResponse(txResponse);
    } catch (error: any) {
      console.log(`error`, error);
      setError(error.message);
    }
  };

  const onSubmit = async () => {
    try {
      if (!selectedAcount || allowedChain || validPrompt) {
        console.log(selectedAcount, allowedChain, validPrompt);
        return;
      }

      const txData = hexlify(Buffer.from(inputA, "utf8"));

      const transactionDetails = {
        payload: {
          to: testContract,
          value: parseUnits(inputB, "ether").toString(),
          data: txData,
          initCode: "",
        },
        account: selectedAcount.id,
        scope: `eip155:${chain}`,
      };

      const txResponse = await window.ethereum?.request({
        method: "wallet_invokeSnap",
        params: {
          snapId: defaultSnapOrigin,
          request: {
            method: "eth_sendUserOpBoba", // operation to send the data to bundler
            params: [transactionDetails],
            id: selectedAcount?.id,
          },
        },
      });

      setResponse(txResponse);
    } catch (error: any) {
      console.log(`error`, error);
      setError(error.message);
    }
  };

  return (
    <div className="flex flex-col w-8/12 rounded-md shadow-sm border m-auto my-2 p-5">
      <div className="flex gap-1 items-stretch justify-around w-full mb-4">
        <div className="flex flex-col justify-start items-start w-10/12">
          <label className="block text-sm font-medium leading-6 text-teal-900">
            Translator Contract Address
          </label>
          <div className="relative mt-2 rounded-md shadow-sm w-full">
            <input
              type="text"
              defaultValue={ADD_SUB_CONTRACT}
              value={testContract}
              onChange={(e) => setTestContract(e.target.value)}
              name="input A"
              id="input A"
              className="block w-full bg-teal-200 rounded-md border-0 py-1.5 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              placeholder="0x"
            />
          </div>
        </div>
      </div>
      <div className="flex gap-1 items-stretch justify-around w-full">
        <div className="flex flex-col justify-start items-start">
          <label className="block text-sm font-medium leading-6 text-gray-900">
            Input Prompt
          </label>
          <div className="relative mt-2 rounded-md shadow-sm">
            <input
              type="text"
              value={inputA}
              onChange={(e) => setinputA(e.target.value)}
              name="input A"
              id="input A"
              className="block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              placeholder="string input"
            />
          </div>
        </div>
        <div className="flex flex-col justify-start items-start">
          <label className="block text-sm font-medium leading-6 text-gray-900">
            ETH Value to send along
          </label>
          <div className="relative mt-2 rounded-md shadow-sm">
            <input
              type="text"
              value={inputB}
              onChange={(e) => setinputB(e.target.value)}
              name="input B"
              id="input B"
              className="block w-full rounded-md border-0 py-1.5 pl-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              placeholder="0"
            />
          </div>
        </div>
        <div className="flex items-end">
          <Button
            onClick={onSubmit}
            className="py-2 px-7 mx-4 rounded-md text-sm"
            variant="destructive"
          >
            Submit
          </Button>
          <Button
            onClick={onReset}
            className="py-2 px-7 mx-4 rounded-md text-sm"
            variant="secondary"
          >
            Reset
          </Button>
          <Button
            onClick={onApprove}
            className="py-2 px-7 mx-4 rounded-md text-sm"
            variant="secondary"
          >
            Approve Translator
          </Button>
        </div>
      </div>
      {error && (
        <div className="flex w-full flex-col my-2">
          <div className="w-full p-2 bg-red-600 rounded-md mb-2 flex ">
            <p className="text-md text-white"> Opps, something went wrong!</p>
          </div>
          <div
            className="flex flex-1 justify-between rounded-md bg-teal-100 p-4 w-full cursor-pointer"
            onClick={async () => {
              await navigator.clipboard.writeText(error);
            }}
          >
            <div className="text-roboto-mono text-left text-xs text-blue-800 break-all whitespace-pre-wrap">
              {JSON.stringify(error, null, 2)}
            </div>
            <div className="w-4 h-4 justify-end items-end">
              <CopyIcon />
            </div>
          </div>
        </div>
      )}
      {response && (
        <div className="flex w-full flex-col my-2">
          <div className="w-full p-2 bg-green-200 rounded-md mb-2 flex ">
            <p className="text-md text-blue-500"> Success!</p>
          </div>
          <div
            className="flex flex-1 justify-between rounded-md bg-teal-100 p-4 w-full cursor-pointer"
            onClick={async () => {
              await navigator.clipboard.writeText(response);
            }}
          >
            <div className="text-roboto-mono text-left text-xs text-blue-800 break-all whitespace-pre-wrap">
              {JSON.stringify(response, null, 2)}
            </div>
            <div className="w-4 h-4 justify-end items-end">
              <CopyIcon />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormComponent;
