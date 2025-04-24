import { promises as fs } from "fs";
import "dotenv/config";
import { PinataSDK } from "pinata-web3";

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