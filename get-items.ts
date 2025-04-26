import {
  keypairIdentity,
  publicKey,
  unwrapOption,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  mplCandyMachine,
  fetchCandyMachine,
} from "@metaplex-foundation/mpl-candy-machine";
import { getKeypairFromFile } from "@solana-developers/helpers";
import dotenv from "dotenv";
import { NETWORK } from "./utils";
import { fetchAllDigitalAssetByOwner } from "@metaplex-foundation/mpl-token-metadata";
dotenv.config();


async function main() {
  // Use the RPC endpoint of your choice.
  const umi = createUmi(NETWORK).use(mplCandyMachine());

  const user = await getKeypairFromFile(process.env.KEYPAIR_PATH!);
  const signer = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
  umi.use(keypairIdentity(signer));

  const candyMachine = await fetchCandyMachine(umi, publicKey(process.env.CANDY_ID!));
  console.log("Candy itemsLoaded:", candyMachine.itemsLoaded);
  console.log("Candy itemsRedeemed:", candyMachine.itemsRedeemed);
  console.log("Candy authority:", candyMachine.authority);
  console.log("Candy items:", candyMachine.items[0]);

  const allAssets = await fetchAllDigitalAssetByOwner(
    umi,
    umi.identity.publicKey
  );
  // Filter for NFTs that belong to the specific collection
  const collectionNFTs = allAssets.filter((asset) => {
    return process.env.COLLECTION_ID! === unwrapOption(asset.metadata.collection)?.key;
  });
  console.log("Assets:", collectionNFTs);
}

main().catch(console.error);
