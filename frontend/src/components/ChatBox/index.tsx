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
import { CUSTOM_CONTRACT } from "@/config/snap";

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

  const { selectedAccount, chain } = state;
  const validPrompt = inputMessage && inputMessage.length !== 0;

  const successMessage = [
    <>
      Transaction Completed,
      <a
        href={`https://testnet.bobascan.com/address/${state?.selectedAccount?.address}/internalTx`}
        target="_blank"
      >
        View on BobaScan
      </a>
    </>,
  ];

  const handleSubmit = async (ethValue: string | undefined) => {
    try {
      if (!state.selectedAccount || !validPrompt) {
        console.log('No account connected')
        return;
      }

      const funcSelector = FunctionFragment.getSelector("do_it", ["string"]);
      const encodedParams = abiCoder.encode(["string"], [inputMessage]);
      const txData = hexlify(concat([funcSelector, encodedParams]));

      const transactionDetails = {
        payload: {
          to: CUSTOM_CONTRACT,
          value: ethValue ? parseUnits(ethValue, "ether").toString() : "0",
          data: txData,
          overrides: {
            maxFeePerGasReq: "47868C00",
            maxPriorityFeePerGasReq: "3938700",
            callGasLimitReq: "100000",
            preVerificationGasReqMultiplier: 3,
          }
        },
        account: state.selectedAccount.id,
        scope: `eip155:${chain}`
      };

      console.log('tx details: ', transactionDetails)

      const txResponse = await window.ethereum?.request({
        method: "wallet_invokeSnap",
        params: {
          snapId: defaultSnapOrigin,
          request: {
            method: "eth_sendUserOpBoba",
            params: [transactionDetails],
            id: state.selectedAccount.id,
          },
        },
      });

      console.log('Response: ', JSON.stringify(txResponse));

      const response = JSON.stringify(txResponse);

      if (response.includes("result")) {
        setMessages((prevMessages) => [...prevMessages, successMessage]);
      }
    } catch (error: any) {
      console.error("received error: ", JSON.stringify(error))
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
      if (!selectedAccount) {
        return;
      }

      const funcSelector = FunctionFragment.getSelector("approve", [
        "address",
        "uint256",
      ]);

      const encodedParams = abiCoder.encode(
        ["address", "uint256"],
        [CUSTOM_CONTRACT, ethers.MaxUint256]
      );

      const txData = hexlify(concat([funcSelector, encodedParams]));

      const transactionDetails = {
        payload: {
          to: "0x4200000000000000000000000000000000000023",
          value: "0",
          data: txData,
        },
        account: selectedAccount.id,
        scope: `eip155:${state.chain}`,
      };

      const txResponse = await window.ethereum?.request({
        method: "wallet_invokeSnap",
        params: {
          snapId: defaultSnapOrigin,
          request: {
            method: "eth_sendUserOpBoba",
            params: [transactionDetails],
            id: selectedAccount?.id,
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
      console.log("Amount:", amount);
      console.log("Currencies :", currencies);

      const needBobaApprove = currencies.includes("boba");
      const needExplicitValue = currencies.includes("eth");

      if (needBobaApprove) {
        askForApprove();
      }

      if (needExplicitValue) {
        console.log("Sending ETH Value: ", amount.toString())
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
          <h2>{CUSTOM_CONTRACT}</h2>
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
