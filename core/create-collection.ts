import { generateSigner, publicKey, some } from "@metaplex-foundation/umi";
import {
  addPlugin,
  createCollection,
  ruleSet,
} from "@metaplex-foundation/mpl-core";
import { getUmi, creator1, creator2, BASE_URI, sleep } from "./helper";

const URI = `${BASE_URI}bafkreiemd5cd244uaaik5uc2kbzvr7yjq2xoawqk66v6kotxicll7l3vke`;

async function main() {
  const umi = await getUmi();
  const collectionSigner = generateSigner(umi);

  await createCollection(umi, {
    collection: collectionSigner,
    name: "RoboKidz Collection",
    uri: URI,
  }).sendAndConfirm(umi);

  console.log("Collection created:", collectionSigner.publicKey);

  // await sleep(5000);

  // await addPlugin(umi, {
  //   asset: collectionSigner.publicKey,
  //   plugin: {
  //     type: "VerifiedCreators",
  //     signatures: [
  //       {
  //         address: umi.identity.publicKey,
  //         verified: true,
  //       },
  //       {
  //         address: creator1,
  //         verified: false,
  //       },
  //       {
  //         address: creator2,
  //         verified: false,
  //       },
  //     ],
  //   },
  // }).sendAndConfirm(umi);
}

main().catch(console.error);
