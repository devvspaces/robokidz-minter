import { none, publicKey, sol, some } from "@metaplex-foundation/umi";
import {
  addConfigLines,
  fetchCandyGuard,
  fetchCandyMachine,
  getMerkleRoot,
  route,
  safeFetchCandyGuard,
  updateCandyGuard,
} from "@metaplex-foundation/mpl-core-candy-machine";
import { creator1, ELIGIBLE_COLLECTIONS, TEAM_WALLETS, getUmi } from "./helper";
import dotenv from "dotenv";
dotenv.config();

const candyMachineAddress = publicKey(process.env.CANDY_MACHINE_ADDRESS!);

async function main() {
  const umi = await getUmi();
  // Fetch the candy machine
  const candyMachine = await fetchCandyMachine(umi, candyMachineAddress);
  const candyGuardId = await safeFetchCandyGuard(
    umi,
    candyMachine.mintAuthority
  );
  if (!candyGuardId) {
    console.error("Candy Guard not found");
    return;
  }
  const candyGuard = await fetchCandyGuard(umi, candyGuardId.publicKey);

  const whitelistGroups = Object.entries(ELIGIBLE_COLLECTIONS).map(
    ([label, address]) => ({
      label: `wl-${label}`,
      guards: {
        solPayment: some({
          lamports: sol(0.5),
          destination: creator1,
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

  await updateCandyGuard(umi, {
    candyGuard: candyGuard.publicKey,
    guards: {
      ...candyGuard.guards,
      botTax: null,
    },
    groups: [
      ...whitelistGroups,
      {
        label: "public",
        guards: {
          solPayment: some({
            lamports: sol(1),
            destination: creator1,
          }),
          allocation: some({
            id: 1,
            limit: 2500,
          }),
          allowList: null,
        },
      },
      {
        label: "team",
        guards: {
          solPayment: null,
          allocation: some({
            id: 2,
            limit: 500,
          }),
          allowList: some({ merkleRoot: getMerkleRoot(TEAM_WALLETS) }),
        },
      },
    ],
  }).sendAndConfirm(umi);

  route(umi, {
    candyMachine: candyMachine.publicKey,
    candyGuard: candyGuard.publicKey,
    guard: "allocation",
    routeArgs: {
      id: 1,
      candyGuardAuthority: umi.identity,
    },
    group: some("public"),
  }).sendAndConfirm(umi);
  console.log(`Route created for public mint`);

  route(umi, {
    candyMachine: candyMachine.publicKey,
    candyGuard: candyGuard.publicKey,
    guard: "allocation",
    routeArgs: {
      id: 2,
      candyGuardAuthority: umi.identity,
    },
    group: some("team"),
  }).sendAndConfirm(umi);
  console.log(`Route created for team mint`);

  route(umi, {
    candyMachine: candyMachine.publicKey,
    candyGuard: candyGuard.publicKey,
    guard: "allocation",
    routeArgs: {
      id: 3,
      candyGuardAuthority: umi.identity,
    },
    group: some("wl-a"),
  }).sendAndConfirm(umi);
  console.log(`Route created for whitelist mint`);
}

main().catch(console.error);
