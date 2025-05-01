import {
  generateSigner,
  keypairIdentity,
  percentAmount,
  publicKey,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  airdropIfRequired,
  getExplorerLink,
  getKeypairFromFile,
} from "@solana-developers/helpers";
import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  createNft,
  fetchMetadataFromSeeds,
  mplTokenMetadata,
  updateV1,
} from "@metaplex-foundation/mpl-token-metadata";
import dotenv from "dotenv";
import { NETWORK, uploadFile, uploadJson } from "./utils";
dotenv.config();

async function main() {
  // create a new connection to Solana's devnet cluster
  const connection = new Connection(NETWORK, {
    commitment: "confirmed",
    wsEndpoint: NETWORK.replace("http", "ws"),
  });

  // load keypair from local file system
  // assumes that the keypair is already generated using `solana-keygen new`
  const user = await getKeypairFromFile(process.env.KEYPAIR_PATH!);

  console.log("Loaded user:", user.publicKey.toBase58());

  const umi = createUmi(connection);

  // convert to umi compatible keypair
  const umiKeypair = umi.eddsa.createKeypairFromSecretKey(user.secretKey);

  // assigns a signer to our umi instance, and loads the MPL metadata program and Irys uploader plugins.
  umi.use(keypairIdentity(umiKeypair)).use(mplTokenMetadata());

  const uri = "https://scarlet-quick-muskox-732.mypinata.cloud/ipfs/bafkreidwxii77mmwulkrk2oatspfblgbhbcvlh633ksmkwldfepqkbxmga"

  // generate mint keypair
  const collectionMint = publicKey(process.env.COLLECTION_ID!);

  // update the collection metadata
  const initialMetadata = await fetchMetadataFromSeeds(umi, { mint: collectionMint })
  await updateV1(umi, {
    mint: collectionMint,
    authority: umi.identity,
    data: {
      ...initialMetadata,
      name: "RoboKidz",
      uri,
    },
  }).sendAndConfirm(umi)

  console.log("✅ Updated successfully!");
}

main().catch(console.error);
