import {
  generateSigner,
  keypairIdentity,
  percentAmount,
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
  mplTokenMetadata,
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

  const uri = "https://scarlet-quick-muskox-732.mypinata.cloud/ipfs/bafkreiemd5cd244uaaik5uc2kbzvr7yjq2xoawqk66v6kotxicll7l3vke"

  // generate mint keypair
  const collectionMint = generateSigner(umi);

  // create and mint NFT
  await createNft(umi, {
    mint: collectionMint,
    name: "Robokidz Collection",
    symbol: "ROBO",
    uri,
    authority: umi.identity,
    sellerFeeBasisPoints: percentAmount(5, 2),
    isCollection: true,
    isMutable: true,
    collectionDetails: {
      __kind: 'V1',
      size: 0,
    },
  }).sendAndConfirm(umi, { send: { commitment: "finalized" } });

  console.log(`Collection NFT address is:`, collectionMint.publicKey);
  console.log("✅ Finished successfully!");
}

main().catch(console.error);
