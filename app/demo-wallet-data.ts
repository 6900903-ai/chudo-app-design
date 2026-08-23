import { formatMinorUnits } from "./money.ts";

export type ChainId =
  | "CHAIN_CHUDO"
  | "CHAIN_BITCOIN"
  | "CHAIN_ETHEREUM"
  | "CHAIN_SOLANA";

export type AssetId =
  | "CHUDO_NATIVE"
  | "BTC_NATIVE"
  | "ETH_NATIVE"
  | "USDT_ETHEREUM"
  | "SOL_NATIVE";

export type DemoWalletAsset = {
  readonly assetId: AssetId;
  readonly chainId: ChainId;
  readonly symbol: string;
  readonly displayName: string;
  readonly networkLabel: string;
  readonly kind: "NATIVE" | "ERC20_DEMO";
  readonly balanceMinor: string;
  readonly availableMinor: string;
  readonly decimals: number;
  readonly referenceValueMinor: string;
  readonly referenceCurrency: "EUR";
  readonly referenceRateMinor: string;
  readonly change: string;
  readonly glyph: string;
  readonly tone: "chudo" | "bitcoin" | "ethereum" | "usdt" | "solana";
  readonly slug: string;
  readonly demoReceiveIdentifier: string;
  readonly isReal: false;
};

export const demoWalletAssets = [
  {
    assetId: "CHUDO_NATIVE",
    chainId: "CHAIN_CHUDO",
    symbol: "CHUDO",
    displayName: "CHUDO",
    networkLabel: "CHUDO",
    kind: "NATIVE",
    balanceMinor: "1284062",
    availableMinor: "1259062",
    decimals: 2,
    referenceValueMinor: "1284062",
    referenceCurrency: "EUR",
    referenceRateMinor: "118",
    change: "+4,8% demo",
    glyph: "C",
    tone: "chudo",
    slug: "chudo",
    demoReceiveIdentifier: "demo_chudo_address_not_for_funds",
    isReal: false,
  },
  {
    assetId: "BTC_NATIVE",
    chainId: "CHAIN_BITCOIN",
    symbol: "BTC",
    displayName: "Bitcoin",
    networkLabel: "Bitcoin",
    kind: "NATIVE",
    balanceMinor: "1284000",
    availableMinor: "1184000",
    decimals: 8,
    referenceValueMinor: "94000",
    referenceCurrency: "EUR",
    referenceRateMinor: "7320000",
    change: "+1,2% demo",
    glyph: "₿",
    tone: "bitcoin",
    slug: "btc",
    demoReceiveIdentifier: "demo_btc_receive_identifier_not_for_funds",
    isReal: false,
  },
  {
    assetId: "ETH_NATIVE",
    chainId: "CHAIN_ETHEREUM",
    symbol: "ETH",
    displayName: "Ethereum",
    networkLabel: "Ethereum",
    kind: "NATIVE",
    balanceMinor: "84000000",
    availableMinor: "81000000",
    decimals: 8,
    referenceValueMinor: "275000",
    referenceCurrency: "EUR",
    referenceRateMinor: "327400",
    change: "−0,4% demo",
    glyph: "Ξ",
    tone: "ethereum",
    slug: "eth",
    demoReceiveIdentifier: "demo_evm_account_not_for_funds",
    isReal: false,
  },
  {
    assetId: "USDT_ETHEREUM",
    chainId: "CHAIN_ETHEREUM",
    symbol: "USDT",
    displayName: "USDT",
    networkLabel: "Ethereum",
    kind: "ERC20_DEMO",
    balanceMinor: "125000",
    availableMinor: "120000",
    decimals: 2,
    referenceValueMinor: "115000",
    referenceCurrency: "EUR",
    referenceRateMinor: "92",
    change: "+0,1% demo",
    glyph: "T",
    tone: "usdt",
    slug: "usdt-ethereum",
    demoReceiveIdentifier: "demo_evm_account_not_for_funds",
    isReal: false,
  },
  {
    assetId: "SOL_NATIVE",
    chainId: "CHAIN_SOLANA",
    symbol: "SOL",
    displayName: "Solana",
    networkLabel: "Solana",
    kind: "NATIVE",
    balanceMinor: "184200",
    availableMinor: "180000",
    decimals: 4,
    referenceValueMinor: "27630",
    referenceCurrency: "EUR",
    referenceRateMinor: "15000",
    change: "+2,7% demo",
    glyph: "◎",
    tone: "solana",
    slug: "sol",
    demoReceiveIdentifier: "demo_solana_account_not_for_funds",
    isReal: false,
  },
] as const satisfies readonly DemoWalletAsset[];

export const demoWalletAssetOrder = [
  "CHUDO_NATIVE",
  "BTC_NATIVE",
  "ETH_NATIVE",
  "USDT_ETHEREUM",
  "SOL_NATIVE",
  "ADD",
] as const;

export const demoWalletDecimalScaleNote =
  "Demo display scales: CHUDO=2, BTC=8, ETH=8, USDT · Ethereum=2, SOL=4. Production: CHUDO=8, BTC=8, EUR=2, USDT=asset/network-defined.";

export function getDemoWalletAsset(assetId: AssetId): DemoWalletAsset {
  return demoWalletAssets.find(asset => asset.assetId === assetId)!;
}

export function getDemoWalletAssetBySlug(slug: string): DemoWalletAsset | undefined {
  return demoWalletAssets.find(asset => asset.slug === slug);
}

export function formatDemoAssetBalance(asset: DemoWalletAsset, minor = asset.balanceMinor): string {
  return formatMinorUnits(minor, asset.decimals, true);
}

export function convertDemoAssetMinor(amountMinor: bigint, from: DemoWalletAsset, to: DemoWalletAsset): bigint {
  const fromScale = BigInt(`1${"0".repeat(from.decimals)}`);
  const toScale = BigInt(`1${"0".repeat(to.decimals)}`);
  return amountMinor * BigInt(from.referenceRateMinor) * toScale /
    (fromScale * BigInt(to.referenceRateMinor));
}

export function isObviouslyNonPayableIdentifier(value: string): boolean {
  return value.startsWith("demo_") && value.endsWith("_not_for_funds");
}
