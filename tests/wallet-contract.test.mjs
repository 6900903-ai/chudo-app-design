import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  convertDemoAssetMinor,
  demoWalletAssetOrder,
  demoWalletAssets,
  getDemoWalletAsset,
  isObviouslyNonPayableIdentifier,
} from "../app/demo-wallet-data.ts";

test("multichain carousel preserves the approved exact asset order", () => {
  assert.deepEqual(demoWalletAssetOrder, [
    "CHUDO_NATIVE",
    "BTC_NATIVE",
    "ETH_NATIVE",
    "USDT_ETHEREUM",
    "SOL_NATIVE",
    "ADD",
  ]);
  assert.deepEqual(demoWalletAssets.map(asset => asset.assetId), demoWalletAssetOrder.slice(0, -1));
});

test("ChainId and AssetId are explicit separate authorities", () => {
  for (const asset of demoWalletAssets) {
    assert.match(asset.assetId, /_NATIVE$|^USDT_ETHEREUM$/);
    assert.match(asset.chainId, /^CHAIN_/);
    assert.notEqual(asset.assetId, asset.chainId);
    assert.equal(asset.isReal, false);
  }
  const usdt = getDemoWalletAsset("USDT_ETHEREUM");
  assert.equal(usdt.chainId, "CHAIN_ETHEREUM");
  assert.equal(usdt.networkLabel, "Ethereum");
  assert.equal(usdt.kind, "ERC20_DEMO");
});

test("demo receive identifiers are obviously non-payable and contain no secrets", () => {
  const serialized = JSON.stringify(demoWalletAssets).toLowerCase();
  for (const forbidden of ["privatekey", "private_key", "seed phrase", "mnemonic", "bip39", "0xabcdef", "bc1q"]) {
    assert.equal(serialized.includes(forbidden), false, forbidden);
  }
  for (const asset of demoWalletAssets) {
    assert.equal(isObviouslyNonPayableIdentifier(asset.demoReceiveIdentifier), true, asset.assetId);
    assert.equal(/^0x[a-f0-9]{40}$/i.test(asset.demoReceiveIdentifier), false);
    assert.equal(/^bc1[a-z0-9]{20,}$/i.test(asset.demoReceiveIdentifier), false);
    assert.equal(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(asset.demoReceiveIdentifier), false);
  }
});

test("asset selection drives contextual receive/send/exchange actions", async () => {
  const source = await readFile(new URL("../app/product-screens.tsx", import.meta.url), "utf8");
  for (const required of [
    "selectedAssetId === asset.assetId",
    "onSelect(asset.assetId)",
    "`/wallet/${asset.slug}/receive`",
    "`/wallet/${asset.slug}/send`",
    'navigateRoute("/market/swap")',
    "Получить",
    "Отправить",
    "Обменять",
  ]) assert.ok(source.includes(required), required);
});

test("swap conversion is exact BigInt arithmetic", () => {
  const chudo = getDemoWalletAsset("CHUDO_NATIVE");
  const btc = getDemoWalletAsset("BTC_NATIVE");
  const estimated = convertDemoAssetMinor(25000n, chudo, btc);
  assert.equal(typeof estimated, "bigint");
  assert.equal(estimated, 403005n);
});
