import { useRef, useState, useContext } from "react";
import {
  Chat,
  ChatHead,
  Messages as StyledMessages,
  MessageBox,
  ChatContainer,
  Bg,
} from "./styles";

import MessageInput from "./MessageInput";
import Messages from "./Messages";
import MessageSubmitButton from "./MessageSubmitButton";

import { defaultSnapOrigin } from "@/config";
import { MetaMaskContext } from "@/hooks/MetamaskContext";
import { concat, FunctionFragment, parseUnits } from "ethers";
import { hexlify, ethers } from "ethers";
import { ADD_SUB_CONTRACT } from "@/config/snap";

import { AbiCoder } from "ethers";

const defaultMessage = [
  <>
    Welcome to Mustache, your AI-powered and HybridCompute-enabled crypto
    assistant.
  </>,
];

export const ChatBox = () => {
  const [state] = useContext(MetaMaskContext);

  const [messages, setMessages] = useState<any[]>(defaultMessage);
  const [inputMessage, setInputMessage] = useState<string>("");
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  const abiCoder = new AbiCoder();

  const { selectedAcount, chain } = state;
  const validPrompt = inputMessage && inputMessage.length !== 0;

  const sucessMessage = [
    <>
      Transaction Completed,
      <a
        href={`https://testnet.bobascan.com/address/${state?.selectedAcount?.address}/internalTx`}
        target="_blank"
      >
        View on BobaScan
      </a>
    </>,
  ];

  const handleSubmit = async (ethValue: string | undefined) => {
    try {
      if (!state.selectedAcount || !validPrompt) {
        console.log('Not connected')
        return;
      }

      const funcSelector = FunctionFragment.getSelector("do_it", ["string"]);
      const encodedParams = abiCoder.encode(["string"], [inputMessage]);
      const txData = hexlify(concat([funcSelector, encodedParams]));

      const transactionDetails = {
        payload: {
          to: ADD_SUB_CONTRACT,
          value: ethValue ? parseUnits(ethValue, "ether").toString() : "0",
          data: txData,
          initCode: "",
        },
        account: state.selectedAcount.id,
        scope: `eip155:${chain}`,
      };

      const txResponse = await window.ethereum?.request({
        method: "wallet_invokeSnap",
        params: {
          snapId: defaultSnapOrigin,
          request: {
            method: "eth_sendUserOpBoba",
            params: [transactionDetails],
            id: state.selectedAcount.id,
          },
        },
      });

      const response = JSON.stringify(txResponse);

      if (response.includes("result")) {
        setMessages((prevMessages) => [...prevMessages, sucessMessage]);
      }
    } catch (error: any) {
      setMessages((prevMessages) => [
        ...prevMessages,
        JSON.stringify(error.message),
      ]);
    }
  };

  const handdleApprove = async () => {
    if (!state) return;
    try {
      console.log('no acc: ');
      if (!selectedAcount) {
        return;
      }

      const funcSelector = FunctionFragment.getSelector("approve", [
        "address",
        "uint256",
      ]);

      const encodedParams = abiCoder.encode(
        ["address", "uint256"],
        [ADD_SUB_CONTRACT, ethers.MaxUint256]
      );

      const txData = hexlify(concat([funcSelector, encodedParams]));
      //read contract to check allowance method to check if address is already approved. {owner: address, spender:ADD_SUB_CONTRACT} 0x4200000000000000000000000000000000000023

      const transactionDetails = {
        payload: {
          to: "0x4200000000000000000000000000000000000023",
          value: "0",
          data: txData,
        },
        account: selectedAcount.id,
        scope: `eip155:${state.chain}`,
      };

      const txResponse = await window.ethereum?.request({
        method: "wallet_invokeSnap",
        params: {
          snapId: defaultSnapOrigin,
          request: {
            method: "eth_sendUserOpBoba",
            params: [transactionDetails],
            id: selectedAcount?.id,
          },
        },
      });
      console.log(`txReponse`, txResponse);

      setMessages((prevMessages) => [...prevMessages, txResponse]);
    } catch (error: any) {
      setMessages((prevMessages) => [...prevMessages, error.message]);
    }
  };

  const needBobaApproveMessage = (
    <>
      Excellent! To perform this operation, you must{" "}
      <button onClick={handdleApprove}>Approve Translator</button>
    </>
  );

  const checkNeedApprove = () => {
    const addressOrEnsRegex = /(0x[a-fA-F0-9]{16}|[a-zA-Z0-9-]+\.eth)/;
    const amountRegex = /\b\d+(\.\d+)?\b/g;
    const currencyRegex = /\b(boba|eth|usd)\b/gi;

    const askForApprove = () => {
      setMessages((prevMessages) => [...prevMessages, needBobaApproveMessage]);
    };

    const filterData = (str: any) => {
      const addressOrEns = str.match(addressOrEnsRegex)[0] || "";
      const modifiedStr = str.replace(addressOrEns, "").trim() || "";
      const amount = modifiedStr.match(amountRegex)[0] || 0;
      const currencies = modifiedStr.match(currencyRegex) || [];

      console.log("Address/ENS:", addressOrEns);
      console.log("Amount:", typeof amount);
      console.log("Currencies :", currencies);

      const needBobaApprove = currencies.includes("boba");
      const needConvertRates = currencies.includes("usd");
      const needExplicitValue = currencies.includes("eth");

      console.log("need approve traslator", needBobaApprove);
      console.log("need needConvertRates ", needConvertRates);
      console.log("needExplicitValue", needExplicitValue);

      if (needBobaApprove) {
        askForApprove();
      }

      if (needExplicitValue) {
        handleSubmit(amount.toString());
      }
      if (needBobaApprove) {
        handleSubmit(undefined);
      }
    };

    filterData(inputMessage.toLowerCase());
  };

  const handleSendMessage = () => {
    checkNeedApprove();
    if (inputMessage.trim() === "") return;
    setMessages((prevMessages) => [...prevMessages, inputMessage]);
    setInputMessage("");
    scrollToBottom();
    console.log('done')
  };

  const scrollToBottom = () => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <ChatContainer>
      <Chat>
        <ChatHead>
          <h1>Mustache Chat</h1>
          <h2>{ADD_SUB_CONTRACT}</h2>
          <figure className="avatar">
            <img src="https://images.unsplash.com/photo-1594819047050-99defca82545?q=80&w=1988&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
          </figure>
        </ChatHead>
        <StyledMessages>
          <Messages messages={messages} />
        </StyledMessages>
        <MessageBox>
          <MessageInput
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            handleSendMessage={handleSendMessage}
          />
          <MessageSubmitButton handleSendMessage={handleSendMessage} />
        </MessageBox>
      </Chat>
      <Bg />
    </ChatContainer>
  );
};
