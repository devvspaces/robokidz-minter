import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { keypairIdentity, publicKey, transactionBuilder } from "@metaplex-foundation/umi";
import { getKeypairFromFile } from "@solana-developers/helpers";
import { 
  fetchDigitalAsset, 
  verifyCollectionV1,
  findMetadataPda,
  mplTokenMetadata
} from "@metaplex-foundation/mpl-token-metadata";
import dotenv from "dotenv";
import { mplCandyMachine } from "@metaplex-foundation/mpl-candy-machine";
dotenv.config();

async function main() {
  // Use the RPC endpoint of your choice
  const umi = createUmi("http://127.0.0.1:8899")
  .use(mplCandyMachine())
  .use(mplTokenMetadata());;
  
  const user = await getKeypairFromFile(process.env.KEYPAIR_PATH!);
  const signer = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
  umi.use(keypairIdentity(signer));

  // The NFT mint address that you want to verify
  const nftMintAddress = publicKey("GCjdE3XzFd7qmFgBeGavYAStB5UFoWcPXLFj4Z7Fnn4E");
  
  // The collection mint address (the parent collection NFT)
  const collectionMintAddress = publicKey("9NHRW9muZfzFYsvR1E2P62rCqAPRpCSgtEBZbzv7YV35");
  
  try {
    // Fetch the NFT and collection digital assets to verify they exist
    const nftAsset = await fetchDigitalAsset(umi, nftMintAddress);
    
    console.log("NFT to verify:", nftAsset.metadata.name);
    
    // Verify the collection on the NFT
    await transactionBuilder()
      .add(
        verifyCollectionV1(umi, {
          metadata: findMetadataPda(umi, { mint: nftMintAddress }),
          collectionMint: collectionMintAddress,
          authority: umi.identity,
        })
      )
      .sendAndConfirm(umi);
    
    console.log("Collection verification successful!");
    
    // Fetch the updated NFT to confirm verification
    const updatedNftAsset = await fetchDigitalAsset(umi, nftMintAddress);
    console.log("Updated NFT Collection Status:");
    console.log("Collection Address:", updatedNftAsset.metadata.collection);
    console.log("Verified:", updatedNftAsset.metadata.collection);
    console.log("Verified:", updatedNftAsset.metadata);
    
  } catch (error) {
    console.error("Error verifying collection:", error);
    if (error instanceof Error && 'logs' in error) {
      console.log("Transaction logs:", (error as any).logs);
    }
  }
}

main().catch(console.error);