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
import { uploadFile, uploadJson } from "./utils";
dotenv.config();

async function main() {
  // create a new connection to Solana's devnet cluster
  const connection = new Connection("https://api.devnet.solana.com", {
    commitment: "confirmed",
  });

  // load keypair from local file system
  // assumes that the keypair is already generated using `solana-keygen new`
  const user = await getKeypairFromFile(process.env.KEYPAIR_PATH!);

  await airdropIfRequired(
    connection,
    user.publicKey,
    1 * LAMPORTS_PER_SOL,
    0.1 * LAMPORTS_PER_SOL
  );

  console.log("Loaded user:", user.publicKey.toBase58());

  const umi = createUmi(connection);

  // convert to umi compatible keypair
  const umiKeypair = umi.eddsa.createKeypairFromSecretKey(user.secretKey);

  // assigns a signer to our umi instance, and loads the MPL metadata program and Irys uploader plugins.
  umi.use(keypairIdentity(umiKeypair)).use(mplTokenMetadata());

  const image = await uploadFile("./logo.png", "collection.png");
  const metadata = {
    name: "RoboKidz Collection",
    symbol: "ROBO",
    description:
      "RoboKidz is a community of 5,000 rebels on the Solana blockchain, hacking reality and building together for max gains.",
    image: image,
    external_url: "https://www.robokidz.io/",
    properties: {
      files: [
        {
          uri: image,
          type: "image/png",
        },
      ],
      category: "image",
    },
  };
  const uri = await uploadJson(metadata);
  console.log("Uploaded metadata:", uri);

  return;
  // const uri = "https://explorer.solana.com/address/4ge958fwdBhbQBZGVpY4EnmTfyp5WCH4W5HqZf3uUxFs?cluster=devnet"

  // generate mint keypair
  const collectionMint = generateSigner(umi);

  // create and mint NFT
  await createNft(umi, {
    mint: collectionMint,
    name: "Robokidz Collection",
    symbol: "RBDZ",
    uri,
    authority: umi.identity,
    sellerFeeBasisPoints: percentAmount(5, 2),
    isCollection: true,
    isMutable: true,
  }).sendAndConfirm(umi, { send: { commitment: "finalized" } });

  let explorerLink = getExplorerLink(
    "address",
    collectionMint.publicKey,
    "devnet"
  );
  console.log(`Collection NFT:  ${explorerLink}`);
  console.log(`Collection NFT address is:`, collectionMint.publicKey);
  console.log("✅ Finished successfully!");
}

main().catch(console.error);

// 6gsDuqYNrTxUNCgMFsdyxaiMpfNiWDv87wW4DXdRKz1w