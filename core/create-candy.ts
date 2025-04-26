import {
  generateSigner,
  none,
  publicKey,
  some,
} from "@metaplex-foundation/umi";
import { create, updateCandyMachine } from "@metaplex-foundation/mpl-core-candy-machine";
import { creator1, creator2, getUmi, sleep } from "./helper";
import dotenv from "dotenv";
dotenv.config();

const collectionMintAddress = process.env.COLLECTION_MINT_ADDRESS!;

async function main() {
  const umi = await getUmi();
  const candyMachine = generateSigner(umi);
  const createIx = await create(umi, {
    candyMachine,
    collection: publicKey(collectionMintAddress),
    collectionUpdateAuthority: umi.identity,
    itemsAvailable: 1000,
    authority: umi.identity.publicKey,
  });

  await createIx.sendAndConfirm(umi);

  console.log("Candy machine created:", candyMachine.publicKey);

  await sleep(5000);

  await updateCandyMachine(umi, {
    candyMachine: candyMachine.publicKey,
    data: {
      itemsAvailable: 5000,
      isMutable: true,
      configLineSettings: some({
        prefixName: "RoboKidz #$ID+1$",
        nameLength: 0,
        prefixUri: "https://scarlet-quick-muskox-732.mypinata.cloud/ipfs/",
        uriLength: 112,
        isSequential: false,
      }),
      hiddenSettings: none(),
      maxEditionSupply: 0,
    },
  }).sendAndConfirm(umi);
}

main().catch(console.error);
