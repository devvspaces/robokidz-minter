import {
  createSignerFromKeypair,
  percentAmount,
  some,
  sol,
  publicKey,
  signerIdentity,
  keypairIdentity,
  generateSigner,
  none,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  fetchCandyGuard,
  fetchCandyMachine,
  getMerkleRoot,
  mplCandyMachine,
  route,
  updateCandyGuard,
} from "@metaplex-foundation/mpl-candy-machine";
import * as fs from "fs";
import * as path from "path";
import { TokenStandard } from "@metaplex-foundation/mpl-token-metadata";
import { create } from "@metaplex-foundation/mpl-candy-machine";
import dotenv from "dotenv";
import { getKeypairFromFile } from "@solana-developers/helpers";
dotenv.config();

// Define collections that are eligible for whitelist
const ELIGIBLE_COLLECTIONS = {
  a: "6XxjKYFbcndh2gDcsUrmZgVEsoDxXMnfsaGY6fpTJzNr", // DeGods
  b: "J1S9H3QjnRtBbbuD4HjPV6RpRhwuk4zKbxsnCHuTgh9w", // MadLads
  c: "4mKSoDDqApmF1DqXvVTSL6tu2zixrSSNjqMxUnwvVzy2", // y00ts
  d: "DUX8SZXLKigc84BBUcYjA7PuKe2SFwXFtQVgwmBsaXKm", // Retardio Cousins
  e: "3UEqFgyd9EGWAhqUA4dhKzRkHUYg8wF4MQdxzFuE21cB", // Autismo Step Cousins
  f: "9ysVw1NQqZF3sryWvv5WegVp1rmhFDqCvz83Z2ZhrTAm", // WebKidz
  g: "HSGmHrLYDNTnuLySPKyqetEXATH3whSeBx5fmsHSj6i1", // Special Money Friends
};

// Team wallet addresses for special allocation
const TEAM_WALLETS = [
  "FetH969xkHRhF5jh7UW3jAN8BovSLhpckwWg28o3RMp4",
  "3B4hiwYxEMKc9qSX8tZxbjGSMotiFzpqjADjr5CNvsFv",
  "Fmi5hUfoPAjPjE3CZ89vRM7H4s7NGhusb2bz8pLjraS1",
  "35iTUvLy92wtKMFBREBVtowMWgP6ttra7LgMxGydajXG",
  "439py5QRnAJKArEranzApzHmJFRCDnNLvuUPby7a5Ymm",
  "HW4zpqW3gvjepxungntBquT1UWVNNE1ckYT1BuAhYRRB",
  "7ZGraAd4dkRe3WTFhGdgpawhWT7z9JRaxekYbo8TzRtZ",
  "53Wjg3u9BchinofGgbjnhtVmrkuaTk48ZqP2hnMMjuQR",
];

async function main() {
  // Use the RPC endpoint of your choice.
  const umi = createUmi("http://127.0.0.1:8899").use(mplCandyMachine());

  const user = await getKeypairFromFile(process.env.KEYPAIR_PATH!);
  const signer = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
  umi.use(keypairIdentity(signer));

  const treasuryA = publicKey("FetH969xkHRhF5jh7UW3jAN8BovSLhpckwWg28o3RMp4");
  const treasuryB = publicKey("3B4hiwYxEMKc9qSX8tZxbjGSMotiFzpqjADjr5CNvsFv");

  const whitelistGroups = Object.entries(ELIGIBLE_COLLECTIONS).map(
    ([label, address]) => ({
      label: `wl-${label}`,
      guards: {
        solPayment: some({
          lamports: sol(0.5),
          destination: signer.publicKey,
        }),
        allocation: some({
          id: 3,
          limit: 2000,
        }),
        nftGate: some({
          requiredCollection: publicKey(address),
        }),
      },
    })
  );

  const candyMachineAddress = "88J7aDMTUjpDydVj79sqoqBxqjTxyi2JyZcDK4M77ebr"
  const candyMachine = await fetchCandyMachine(umi, publicKey(candyMachineAddress));
  const candyGuard = await fetchCandyGuard(umi, candyMachine.mintAuthority);
  
  const res = await updateCandyGuard(umi, {
    candyGuard: candyGuard.publicKey,
    groups: [
      ...whitelistGroups,
      {
        label: "team",
        guards: {
          solPayment: some({
            lamports: sol(0),
            destination: treasuryA,
          }),
          allocation: some({
            id: 2,
            limit: 500,
          }),
          allowList: some({ merkleRoot: getMerkleRoot(TEAM_WALLETS) }),
        },
      },
      {
        label: "public",
        guards: {
          solPayment: some({
            lamports: sol(1),
            destination: treasuryA,
          }),
          allocation: some({
            id: 1,
            limit: 2500,
          }),
          allowList: none(),
        },
      },
    ],
    guards: {
      botTax: none(),
    },
  }).sendAndConfirm(umi);
  console.log(`Candy Guard updated with address: ${res.signature.toString()}`);

  route(umi, {
    candyMachine: candyMachine.publicKey,
    candyGuard: candyGuard.publicKey,
    guard: 'allocation',
    routeArgs: {
      id: 1,
      candyGuardAuthority: umi.identity,
    },
    group: some('public'),
  }).sendAndConfirm(umi);
  console.log(`Route created for public mint`);

  route(umi, {
    candyMachine: candyMachine.publicKey,
    candyGuard: candyGuard.publicKey,
    guard: 'allocation',
    routeArgs: {
      id: 2,
      candyGuardAuthority: umi.identity,
    },
    group: some('team'),
  }).sendAndConfirm(umi);
  console.log(`Route created for team mint`);

  route(umi, {
    candyMachine: candyMachine.publicKey,
    candyGuard: candyGuard.publicKey,
    guard: 'allocation',
    routeArgs: {
      id: 3,
      candyGuardAuthority: umi.identity,
    },
    group: some('wl-a'),
  }).sendAndConfirm(umi);
  console.log(`Route created for whitelist mint`);
}

main().catch(console.error);
