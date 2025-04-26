import {
  generateSigner,
  some,
  transactionBuilder,
  publicKey,
  keypairIdentity,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  fetchCandyMachine,
  mintV2,
  mplCandyMachine,
  safeFetchCandyGuard,
} from "@metaplex-foundation/mpl-candy-machine";
import { setComputeUnitLimit } from "@metaplex-foundation/mpl-toolbox";
import { getKeypairFromFile } from "@solana-developers/helpers";
import dotenv from "dotenv";
import {
  fetchMetadataFromSeeds,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { Connection, SendTransactionError } from "@solana/web3.js";
import { creator1, NETWORK } from "./utils";

dotenv.config();

async function main() {
  // Use the RPC endpoint of your choice.
  const umi = createUmi(NETWORK)
    .use(mplCandyMachine())
    .use(mplTokenMetadata())

  const user = await getKeypairFromFile(process.env.KEYPAIR_PATH!);
  const signer = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
  umi.use(keypairIdentity(signer));

  const candyMachineAddress = publicKey(process.env.CANDY_ID!);
  const candyMachine = await fetchCandyMachine(umi, candyMachineAddress);
  const candyGuard = await safeFetchCandyGuard(umi, candyMachine.mintAuthority);

  const data2 = await fetchMetadataFromSeeds(umi, {
    mint: candyMachine.collectionMint,
  });

  // Mint from the Candy Machine.
  const nftMint = generateSigner(umi);
  try {
    await transactionBuilder()
      .add(setComputeUnitLimit(umi, { units: 800_000 }))
      .add(
        mintV2(umi, {
          candyMachine: candyMachine.publicKey,
          candyGuard: candyGuard?.publicKey,
          nftMint,
          tokenStandard: candyMachine.tokenStandard,
          collectionMint: candyMachine.collectionMint,
          collectionUpdateAuthority: data2.updateAuthority,
          group: some('public'),
          mintArgs: {
            solPayment: some({ destination: creator1 }),
            allocation: some({ id: 1 }),
          },
        })
      )
      .sendAndConfirm(umi, {
        confirm: { commitment: "finalized" },
      });
  } catch (error) {
    if (error instanceof SendTransactionError) {
      const connection = new Connection(
        "https://api.devnet.solana.com",
        { commitment: "finalized" }
      );
      console.error("Full transaction logs:", await error.getLogs(connection));
    }
    throw error;
  }

  console.log("NFT Minted:", nftMint.publicKey);
}

main().catch(console.error);
