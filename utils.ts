import { promises as fs } from "fs";
import dotenv from "dotenv";
import { PinataSDK } from "pinata-web3";
import { publicKey } from "@metaplex-foundation/umi";
dotenv.config();

export const DEVNET = "https://api.devnet.solana.com"
export const LOCAL = "http://127.0.0.1:8899"
export const MAINNET = "https://api.mainnet-beta.solana.com"
export let NETWORK = LOCAL

export const creator1 = publicKey("FetH969xkHRhF5jh7UW3jAN8BovSLhpckwWg28o3RMp4");
export const creator2 = publicKey("3B4hiwYxEMKc9qSX8tZxbjGSMotiFzpqjADjr5CNvsFv");

switch (process.env.NETWORK) {
  case "devnet":
    NETWORK = DEVNET
    break
  case "local":
    NETWORK = LOCAL
    break
  case "mainnet":
    NETWORK = MAINNET
    break
  default:
    NETWORK = LOCAL
}

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway: process.env.PINATA_CLOUD!,
});

export async function uploadFile(path: string, name: string) {
  const blob = new Blob([await fs.readFile(path)]);
  const file = new File([blob], name, {
    type: "image/png",
  });
  const upload = await pinata.upload.file(file);
  return `https://${process.env.PINATA_CLOUD!}/ipfs/${upload.IpfsHash}`;
}

export async function uploadJson(data: object) {
  const upload = await pinata.upload.json(data);
  return `https://${process.env.PINATA_CLOUD!}/ipfs/${upload.IpfsHash}`;
}