import { publicKey } from "@metaplex-foundation/umi";
import {
  addConfigLines,
  fetchCandyMachine,
} from "@metaplex-foundation/mpl-core-candy-machine";
import { getUmi } from "./helper";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";
dotenv.config();

const candyMachineAddress = publicKey(process.env.CANDY_MACHINE_ADDRESS!);

async function main() {
  const umi = await getUmi();
  // Load and parse the uploads.json file
  const uploadsFilePath = path.join(__dirname, "../uploads.json");
  const uploadsData = JSON.parse(fs.readFileSync(uploadsFilePath, "utf-8"));
  const uris: string[] = Object.values(uploadsData);

  // Fetch the candy machine
  const candyMachine = await fetchCandyMachine(umi, candyMachineAddress);

  // Batch insert items
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
    console.log(
      `Added config lines from ${i} to ${Math.min(i + BATCH_SIZE, END_INDEX)}`
    );
  }
  console.log("Config lines added successfully!");
}

main().catch(console.error);
