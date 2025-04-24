import {
  createNft,
  TokenStandard,
} from "@metaplex-foundation/mpl-token-metadata";
import { create, mplCandyMachine } from "@metaplex-foundation/mpl-candy-machine";
import { generateSigner, keypairIdentity, percentAmount, some } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { getKeypairFromFile } from "@solana-developers/helpers";

async function main() {
  // Use the RPC endpoint of your choice.
  const umi = createUmi("http://127.0.0.1:8899").use(mplCandyMachine());

  const user = await getKeypairFromFile(process.env.KEYPAIR_PATH!);
  const signer = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
  umi.use(keypairIdentity(signer));

  // Create the Collection NFT.
  const collectionMint = generateSigner(umi);
  await createNft(umi, {
    mint: collectionMint,
    authority: umi.identity,
    name: "My Collection NFT",
    uri: "https://example.com/path/to/some/json/metadata.json",
    sellerFeeBasisPoints: percentAmount(9.99, 2), // 9.99%
    isCollection: true,
  }).sendAndConfirm(umi);

  // Ensure we wait for the collection NFT to be fully confirmed
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Create the Candy Machine.
  const candyMachine = generateSigner(umi);
  try {
    const res = await (await create(umi, {
      candyMachine,
      collectionMint: collectionMint.publicKey,
      collectionUpdateAuthority: umi.identity,
      tokenStandard: TokenStandard.NonFungible,
      sellerFeeBasisPoints: percentAmount(9.99, 2), // 9.99%
      itemsAvailable: 5000,
      creators: [
        {
          address: umi.identity.publicKey,
          verified: true,
          percentageShare: 100,
        },
      ],
      configLineSettings: some({
        prefixName: "",
        nameLength: 32,
        prefixUri: "",
        uriLength: 200,
        isSequential: false,
      }),
    })).sendAndConfirm(umi);
    console.log(`Candy Machine created with address: ${candyMachine.publicKey}`);
  } catch (error) {
    console.error("Error creating candy machine:", error);
    // Log more details about the error
    if (error.logs) {
      console.log("Transaction logs:", error.logs);
    }
  }
}

main().catch(console.error);
