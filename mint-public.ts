import {
  createSignerFromKeypair,
  generateSigner,
  some,
  PublicKey,
  transactionBuilder,
  publicKey,
  signerIdentity,
  keypairIdentity,
  sol,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  fetchCandyMachine,
  mintV2,
  MPL_TOKEN_AUTH_RULES_PROGRAM_ID,
  mplCandyMachine,
  safeFetchCandyGuard,
  updateCandyMachine,
} from "@metaplex-foundation/mpl-candy-machine";
import { setComputeUnitLimit } from "@metaplex-foundation/mpl-toolbox";
import { getKeypairFromFile } from "@solana-developers/helpers";
import dotenv from "dotenv";
import {
  findMetadataPda,
  mplTokenMetadata,
  TokenStandard,
  verifyCollectionV1,
} from "@metaplex-foundation/mpl-token-metadata";
import { mplTokenAuthRules } from "@metaplex-foundation/mpl-token-auth-rules";
dotenv.config();

async function main() {
  // Use the RPC endpoint of your choice.
  const umi = createUmi("http://127.0.0.1:8899")
    .use(mplCandyMachine())
    .use(mplTokenMetadata())

  const user = await getKeypairFromFile(process.env.KEYPAIR_PATH!);
  const signer = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
  umi.use(keypairIdentity(signer));
  const treasuryA = publicKey("FetH969xkHRhF5jh7UW3jAN8BovSLhpckwWg28o3RMp4");

  const candyMachineAddress = publicKey(
    "6cp2xXCTuxX13RBAtD5oAn4SJuoWbFDHd1bUe8kp1bXQ"
  );
  const candyMachine = await fetchCandyMachine(umi, candyMachineAddress);
  // const candyGuard = await safeFetchCandyGuard(umi, candyMachine.mintAuthority);

  console.log("Candy Machine:", candyMachine.publicKey);
  // console.log("Candy Guard:", candyGuard?.publicKey);
  console.log("Candy Collection Mint:", candyMachine.collectionMint);

  // Mint from the Candy Machine.
  const nftMint = generateSigner(umi);
  await transactionBuilder()
    .add(setComputeUnitLimit(umi, { units: 800_000 }))
    .add(
      mintV2(umi, {
        candyMachine: candyMachine.publicKey,
        // candyGuard: candyGuard?.publicKey,
        nftMint,
        tokenStandard: TokenStandard.NonFungible,
        collectionMint: candyMachine.collectionMint,
        collectionUpdateAuthority: candyMachine.authority,
        // group: some('public'),
        // mintArgs: {
        //   solPayment: some({ destination: treasuryA, lamports: sol(1) }),
        //   allocation: some({ id: 1 }),
        // },
      })
    )
    .sendAndConfirm(umi, {
      confirm: { commitment: "finalized" },
    });

  console.log("NFT Minted:", nftMint.publicKey);

  const account = await umi.rpc.getAccount(nftMint.publicKey, {
    commitment: "finalized",
  });
  console.log("Mint account owner:", account.publicKey);

  const account2 = await umi.rpc.getAccount(candyMachine.collectionMint, {
    commitment: "finalized",
  });
  console.log("Mint account owner:", account2.publicKey);

  // const metadata = findMetadataPda(umi, {
  //   mint: nftMint.publicKey,
  // });

  // const collectionAddress = publicKey(
  //   "9NHRW9muZfzFYsvR1E2P62rCqAPRpCSgtEBZbzv7YV35"
  // );
  // await verifyCollectionV1(umi, {
  //   metadata,
  //   collectionMint: collectionAddress,
  //   authority: umi.identity,
  // }).sendAndConfirm(umi);
  // console.log("NFT Verified");
}

main().catch(console.error);
