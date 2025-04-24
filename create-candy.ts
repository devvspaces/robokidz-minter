import {
  percentAmount,
  some,
  publicKey,
  keypairIdentity,
  generateSigner,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  mplCandyMachine,
  create,
  createCandyMachineV2,
} from "@metaplex-foundation/mpl-candy-machine";
import { createNft, TokenStandard } from "@metaplex-foundation/mpl-token-metadata";
import dotenv from "dotenv";
import { getKeypairFromFile } from "@solana-developers/helpers";
dotenv.config();

async function main() {
  // Use the RPC endpoint of your choice.
  const umi = createUmi("http://127.0.0.1:8899").use(mplCandyMachine());

  const user = await getKeypairFromFile(process.env.KEYPAIR_PATH!);
  const signer = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
  umi.use(keypairIdentity(signer));

  const treasuryA = publicKey("FetH969xkHRhF5jh7UW3jAN8BovSLhpckwWg28o3RMp4");
  const treasuryB = publicKey("3B4hiwYxEMKc9qSX8tZxbjGSMotiFzpqjADjr5CNvsFv");

  const collectionMint = generateSigner(umi);
  await createNft(umi, {
    mint: collectionMint,
    symbol: "ROBO",
    authority: umi.identity,
    name: "Robokidz Collection",
    uri: "https://scarlet-quick-muskox-732.mypinata.cloud/ipfs/bafkreiemd5cd244uaaik5uc2kbzvr7yjq2xoawqk66v6kotxicll7l3vke",
    sellerFeeBasisPoints: percentAmount(5, 2),
    isCollection: true,
    isMutable: true,
  }).sendAndConfirm(umi, { send: { commitment: "finalized" } });

  // Ensure we wait for the collection NFT to be fully confirmed
  await new Promise(resolve => setTimeout(resolve, 2000));
  console.log("Collection NFT:", collectionMint.publicKey);

  const candyMachine = generateSigner(umi);
  await (
    await createCandyMachineV2(umi, {
      symbol: "ROBO",
      candyMachine,
      authority: signer.publicKey,
      collectionMint: collectionMint.publicKey,
      collectionUpdateAuthority: umi.identity,
      tokenStandard: TokenStandard.NonFungible,
      sellerFeeBasisPoints: percentAmount(5, 2),
      itemsAvailable: 5000,
      creators: [
        { address: treasuryA, percentageShare: 50, verified: false },
        { address: treasuryB, percentageShare: 50, verified: false },
      ],
      configLineSettings: some({
        prefixName: "RoboKidz #$ID+1$",
        nameLength: 0,
        prefixUri: "https://scarlet-quick-muskox-732.mypinata.cloud/ipfs/",
        uriLength: 112,
        isSequential: false,
      }),
    })
  ).sendAndConfirm(umi);
  console.log(`Candy Machine: ${candyMachine.publicKey}`);
}

main().catch(console.error);

// Collection NFT: 9NHRW9muZfzFYsvR1E2P62rCqAPRpCSgtEBZbzv7YV35
// Candy Machine: 2Ctj6wn5VbnWM827axAS3PUzLJQLNzpwb2iQ7qNnqvMg

// Collection NFT: AGHogP7Endbh1SJJGejpeBQ1NzQWTjSNzigLGRiDifUj
// Candy Machine: 88J7aDMTUjpDydVj79sqoqBxqjTxyi2JyZcDK4M77ebr

// Collection NFT: 36oJCcv9byXodmpKTyVokuC5UCk1fwCh4mBRcjVBM8Da
// Candy Machine: cCSrAX2vZcox4qaTYLU7Lp3o8xptjUBFiy82sAZbhe4

// Collection NFT: Hosr2piBhXRk7PfqtmM6bSZy8mFarVEPnSFsDnSjGumo
// Candy Machine: 6cp2xXCTuxX13RBAtD5oAn4SJuoWbFDHd1bUe8kp1bXQ