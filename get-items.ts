import {
  createSignerFromKeypair,
  generateSigner,
  none,
  percentAmount,
  some,
  PublicKey,
  signerIdentity,
  keypairIdentity,
  publicKey,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  mplCandyMachine,
  fetchCandyMachine,
  addConfigLines,
} from "@metaplex-foundation/mpl-candy-machine";
import { PublicKey as PubKey } from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";
import { getKeypairFromFile } from "@solana-developers/helpers";
import dotenv from "dotenv";
import {
  fetchAllDigitalAssetByOwner,
  fetchDigitalAsset,
} from "@metaplex-foundation/mpl-token-metadata";
dotenv.config();

async function main() {
  // Use the RPC endpoint of your choice.
  const umi = createUmi("http://127.0.0.1:8899").use(mplCandyMachine());

  const user = await getKeypairFromFile(process.env.KEYPAIR_PATH!);
  const signer = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
  umi.use(keypairIdentity(signer));

  const candyMachineAddress = publicKey(
    "88J7aDMTUjpDydVj79sqoqBxqjTxyi2JyZcDK4M77ebr"
  );
  const candyMachine = await fetchCandyMachine(umi, candyMachineAddress);
  console.log("Candy itemsLoaded:", candyMachine.itemsLoaded);
  console.log("Candy itemsRedeemed:", candyMachine.itemsRedeemed);
  console.log("Candy itemsRedeemed:", candyMachine.authority);

  const collectionAddress = publicKey(
    "AGHogP7Endbh1SJJGejpeBQ1NzQWTjSNzigLGRiDifUj"
  );
  const allAssets = await fetchAllDigitalAssetByOwner(
    umi,
    umi.identity.publicKey
  );
  // Filter for NFTs that belong to the specific collection
  const collectionNFTs = allAssets.filter((asset) => {
    // console.log(asset.metadata);
    return true;
  });
  // console.log("Asset:", collectionNFTs);
}

main().catch(console.error);
