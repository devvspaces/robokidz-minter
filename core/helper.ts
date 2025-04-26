import { keypairIdentity, publicKey } from "@metaplex-foundation/umi";
import { mplCore } from "@metaplex-foundation/mpl-core";
import { mplCandyMachine } from "@metaplex-foundation/mpl-core-candy-machine";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { getKeypairFromFile } from "@solana-developers/helpers";
import dotenv from "dotenv";
dotenv.config();

export const BASE_URI = process.env.BASE_URI!;

export const mainnet = "https://api.mainnet-beta.solana.com";
export const devnet = "https://api.devnet.solana.com";
export const localnet = "http://localhost:8899";

export let network = "";

switch (process.env.NETWORK) {
  case "mainnet":
    network = mainnet;
    break;
  case "devnet":
    network = devnet;
    break;
  default:
    network = localnet;
}

export async function getUmi() {
  const umi = createUmi(network).use(mplCandyMachine());
  const user = await getKeypairFromFile(process.env.KEYPAIR_PATH!);
  const keypair = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
  umi.use(keypairIdentity(keypair));
  return umi;
}

export const creator1 = publicKey(
  "FetH969xkHRhF5jh7UW3jAN8BovSLhpckwWg28o3RMp4"
);
export const creator2 = publicKey(
  "3B4hiwYxEMKc9qSX8tZxbjGSMotiFzpqjADjr5CNvsFv"
);

export const ELIGIBLE_COLLECTIONS = {
  a: "6XxjKYFbcndh2gDcsUrmZgVEsoDxXMnfsaGY6fpTJzNr", // DeGods
  b: "J1S9H3QjnRtBbbuD4HjPV6RpRhwuk4zKbxsnCHuTgh9w", // MadLads
  c: "4mKSoDDqApmF1DqXvVTSL6tu2zixrSSNjqMxUnwvVzy2", // y00ts
  d: "DUX8SZXLKigc84BBUcYjA7PuKe2SFwXFtQVgwmBsaXKm", // Retardio Cousins
  e: "3UEqFgyd9EGWAhqUA4dhKzRkHUYg8wF4MQdxzFuE21cB", // Autismo Step Cousins
  f: "9ysVw1NQqZF3sryWvv5WegVp1rmhFDqCvz83Z2ZhrTAm", // WebKidz
  g: "HSGmHrLYDNTnuLySPKyqetEXATH3whSeBx5fmsHSj6i1", // Special Money Friends
};

// Team wallet addresses for special allocation
export const TEAM_WALLETS = [
  "FetH969xkHRhF5jh7UW3jAN8BovSLhpckwWg28o3RMp4",
  "3B4hiwYxEMKc9qSX8tZxbjGSMotiFzpqjADjr5CNvsFv",
  "Fmi5hUfoPAjPjE3CZ89vRM7H4s7NGhusb2bz8pLjraS1",
  "35iTUvLy92wtKMFBREBVtowMWgP6ttra7LgMxGydajXG",
  "439py5QRnAJKArEranzApzHmJFRCDnNLvuUPby7a5Ymm",
  "HW4zpqW3gvjepxungntBquT1UWVNNE1ckYT1BuAhYRRB",
  "7ZGraAd4dkRe3WTFhGdgpawhWT7z9JRaxekYbo8TzRtZ",
  "53Wjg3u9BchinofGgbjnhtVmrkuaTk48ZqP2hnMMjuQR",
];

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
