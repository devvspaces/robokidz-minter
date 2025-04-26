import {
  generateSigner,
  sol,
  publicKey,
  some,
  transactionBuilder,
} from "@metaplex-foundation/umi";
import { mintV1 } from "@metaplex-foundation/mpl-core-candy-machine";
import { creator1, getUmi } from "./helper";
import dotenv from "dotenv";
import { setComputeUnitLimit } from "@metaplex-foundation/mpl-toolbox";
dotenv.config();

const coreCollection = publicKey(process.env.COLLECTION_MINT_ADDRESS!);
const candyMachineId = publicKey(process.env.CANDY_MACHINE_ADDRESS!);

async function main() {
  const umi = await getUmi();
  const asset = generateSigner(umi);
  await transactionBuilder()
    .add(setComputeUnitLimit(umi, { units: 300_000 }))
    .add(
      mintV1(umi, {
        candyMachine: candyMachineId,
        asset,
        collection: coreCollection,
        group: some("public"),
        mintArgs: {
          solPayment: some({ destination: creator1, lamports: sol(1) }),
          allocation: some({ id: 1 }),
        },
      })
    )
    .sendAndConfirm(umi);

  console.log("Minted asset:", asset.publicKey);
}

main().catch(console.error);
