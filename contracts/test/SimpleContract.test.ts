import { expect } from "chai";
import {SimpleContract} from "../typechain-types";
import { Wallet, JsonRpcProvider, ZeroAddress } from "ethers";
import { setupTests, sendUserOperation } from "./setup";
import { ethers } from "hardhat";

describe("SimpleContract", () => {
  let simpleContract: SimpleContract;
  let owner: Wallet;
  let user: Wallet;
  let provider: JsonRpcProvider;
  let bundlerRpc: string;
  let chainId: string;

  before(async () => {
    ({ simpleContract, owner, user, provider, bundlerRpc } = await setupTests());
    chainId = (await provider.getNetwork()).chainId.toString();
  });

  describe("Constructor", () => {
    it("should set the correct translator address", async () => {
      const translatorAddress = await simpleContract.translator();
      expect(translatorAddress).to.not.equal(ZeroAddress);
    });
  });

  describe("pickNumber function", () => {
    it("should allow a player to pick a number", async () => {
      await simpleContract.connect(user).pickNumber("5");
      const player = await simpleContract.playerMap(user.address);
      expect(player.pickedNumber).to.equal("5");
      expect(player.playerAddr).to.equal(user.address);
    });
  });

  describe("pickWinningNumber function", () => {
    it("should set a winning number", async () => {
      const txHash = await sendUserOperation(chainId, bundlerRpc, owner, "pickWinningNumber");
      await provider.waitForTransaction(txHash);

      const winningNumber = await simpleContract.winningNumber();
      expect(winningNumber).to.be.a("string");
      expect(["4", "6", "8", "9", "10"]).to.include(winningNumber);
    });
  });

  describe("transferPrize function", () => {
    it("should transfer prize if player picked the winning number", async () => {
      // Pick a winning number and set it for the player
      await simpleContract.pickWinningNumber();
      const winningNumber = await simpleContract.winningNumber();
      await simpleContract.connect(user).pickNumber(winningNumber);
    });
  });
});