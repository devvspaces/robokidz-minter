import { publicKey } from "@metaplex-foundation/umi";
import {
  fetchAsset,
  fetchCollection,
  updatePlugin,
} from "@metaplex-foundation/mpl-core";
import { getUmi } from "./helper";
import dotenv from "dotenv";
dotenv.config();

const assetId = publicKey(process.env.COLLECTION_MINT_ADDRESS!)

async function main() {
  const umi = await getUmi();
  const asset = await fetchCollection(umi, assetId);

  const publicKeyToVerify = umi.identity.publicKey;

  if (!asset.verifiedCreators) {
    throw new Error("No verified creators found");
  }

  // The creator that you want to verify
  const updatedCreators = asset.verifiedCreators.signatures.map((creator) => {
    if (creator.address === publicKeyToVerify) {
      return { ...creator, verified: true };
    }
    return creator;
  });

  await updatePlugin(umi, {
    asset: asset.publicKey,
    plugin: {
      type: "VerifiedCreators",
      signatures: updatedCreators,
    },
    authority: umi.identity,
  }).sendAndConfirm(umi);
}

main().catch(console.error);
