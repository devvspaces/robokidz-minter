import {
  keypairIdentity,
  publicKey,
} from "@metaplex-foundation/umi";
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
dotenv.config();

async function main() {
  // Load and parse the uploads.json file
  const uploadsFilePath = path.join(__dirname, "uploads.json");
  const uploadsData = JSON.parse(fs.readFileSync(uploadsFilePath, "utf-8"));
  const uris: string[] = Object.values(uploadsData);

  // Use the RPC endpoint of your choice.
  const umi = createUmi("http://127.0.0.1:8899").use(mplCandyMachine());

  const user = await getKeypairFromFile(process.env.KEYPAIR_PATH!);
  const signer = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
  umi.use(keypairIdentity(signer));

  const candyMachineAddress = publicKey("6cp2xXCTuxX13RBAtD5oAn4SJuoWbFDHd1bUe8kp1bXQ");
  const candyMachine = await fetchCandyMachine(umi, candyMachineAddress);

  const BATCH_SIZE = 5; // Number of config lines to add in each batch
  const START_INDEX = candyMachine.itemsLoaded; // Start from the current loaded index
  const END_INDEX = START_INDEX + uris.length; // End index for the new items
  
  for (let i = START_INDEX; i < END_INDEX; i += BATCH_SIZE) {
    const batchUris = uris.slice(i, i + BATCH_SIZE);
    await addConfigLines(umi, {
      candyMachine: candyMachine.publicKey,
      index: i,
      configLines: batchUris.map((uri, index) => ({
        name: (i + index).toString(),
        uri,
      })),
    }).sendAndConfirm(umi);
    console.log(`Added config lines from ${i} to ${Math.min(i + BATCH_SIZE, END_INDEX)}`);
  }
  console.log("Config lines added successfully!");
}

main().catch(console.error);

