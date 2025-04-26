import { publicKey } from "@metaplex-foundation/umi";
import { deleteCandyMachine } from "@metaplex-foundation/mpl-core-candy-machine";
import { umi } from "./helper";
import dotenv from "dotenv";
dotenv.config();

const candyMachineId = publicKey(process.env.CANDY_MACHINE_ADDRESS!);

async function main() {
  await deleteCandyMachine(umi, {
    candyMachine: publicKey(candyMachineId),
  }).sendAndConfirm(umi);
  console.log("Deleted candy machine:", candyMachineId);
}

main().catch(console.error);
