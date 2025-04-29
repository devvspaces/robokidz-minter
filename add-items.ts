import { keypairIdentity, publicKey } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  mplCandyMachine,
  fetchCandyMachine,
  addConfigLines,
} from "@metaplex-foundation/mpl-candy-machine";
import * as fs from "fs";
import * as path from "path";
import { getKeypairFromFile } from "@solana-developers/helpers";
import dotenv from "dotenv";
import { NETWORK } from "./utils";
dotenv.config();

async function main() {
  // Load and parse the uploads.json file
  const uploadsFilePath = path.join(__dirname, "uploads.json");
  const uploadsData = JSON.parse(fs.readFileSync(uploadsFilePath, "utf-8"));
  const uris: string[] = Object.values(uploadsData);

  // Use the RPC endpoint of your choice.
  const umi = createUmi(NETWORK).use(mplCandyMachine());

  const user = await getKeypairFromFile(process.env.KEYPAIR_PATH!);
  const signer = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
  umi.use(keypairIdentity(signer));

  const candyMachineAddress = publicKey(process.env.CANDY_ID!);
  const candyMachine = await fetchCandyMachine(umi, candyMachineAddress);

  const BATCH_SIZE = 10; // Number of config lines to add in each batch
  const START_INDEX = 50; // Start from the current loaded index
  // const START_INDEX = candyMachine.itemsLoaded; // Start from the current loaded index
  const END_INDEX = START_INDEX + uris.length; // End index for the new items

  for (let i = START_INDEX; i < END_INDEX; i += BATCH_SIZE) {
    const batchUris = uris.slice(i, i + BATCH_SIZE);
    const { blockhash, lastValidBlockHeight } = await umi.rpc.getLatestBlockhash({
      commitment: "finalized"
    });
    await addConfigLines(umi, {
      candyMachine: candyMachine.publicKey,
      index: i,
      configLines: batchUris.map((uri, index) => ({
        name: (i + index).toString(),
        uri,
      })),
    })
    .setBlockhash(blockhash)
    .sendAndConfirm(umi);
    console.log(
      `Added config lines from ${i} to ${Math.min(i + BATCH_SIZE, END_INDEX)}`
    );
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 1 second before the next batch
  }
  console.log("Config lines added successfully!");
}

main().catch(console.error);
