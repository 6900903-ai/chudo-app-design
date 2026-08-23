const GROUP_SEPARATOR = " ";

export const DEMO_DECIMAL_SCALES = {
  CHUDO: 2,
  BTC: 6,
  EUR: 2,
  USDT: 2,
} as const;

export const PRODUCTION_DECIMAL_SCALE_NOTE = "Production note: CHUDO=8, BTC=8, EUR=2, USDT=asset/network-defined.";

export function parseMinorUnits(value: string, decimals = 2): bigint | null {
  const normalized = value.trim();
  if (!/^\d+(?:[.,]\d+)?$/.test(normalized)) {
    return null;
  }

  const [whole, fraction = ""] = normalized.replace(",", ".").split(".");
  if (fraction.length > decimals) {
    return null;
  }

  const paddedFraction = `${fraction}${"0".repeat(decimals - fraction.length)}`;
  const scale = BigInt(`1${"0".repeat(decimals)}`);
  return BigInt(whole) * scale + BigInt(paddedFraction || "0");
}

export function formatMinorUnits(value: bigint | string, decimals = 2, trimZeros = false): string {
  const amount = typeof value === "string" ? BigInt(value) : value;
  const negative = amount < BigInt(0);
  const absolute = negative ? -amount : amount;
  const scale = BigInt(`1${"0".repeat(decimals)}`);
  const whole = (absolute / scale).toString().replace(/\B(?=(\d{3})+(?!\d))/g, GROUP_SEPARATOR);
  const fraction = decimals === 0 ? "" : (absolute % scale).toString().padStart(decimals, "0");
  const visibleFraction = trimZeros ? fraction.replace(/0+$/, "") : fraction;
  return `${negative ? "−" : ""}${whole}${visibleFraction ? `,${visibleFraction}` : ""}`;
}

export function multiplyMinorUnits(amount: bigint, price: bigint, decimals = 2): bigint {
  const scale = BigInt(`1${"0".repeat(decimals)}`);
  const product = amount * price;
  const rounding = scale / BigInt(2);
  return product < BigInt(0) ? (product - rounding) / scale : (product + rounding) / scale;
}

export function sanitizeDecimalInput(value: string, decimals = 2): string {
  const trimmed = value.trim();
  if (trimmed === "") return "";

  const canonical = /^[.,]\d+$/.test(trimmed) ? `0${trimmed}` : trimmed;
  if (!/^\d+(?:[.,]\d*)?$/.test(canonical)) return value;

  const normalized = canonical.replace(",", ".");
  const fraction = normalized.split(".")[1] ?? "";
  return fraction.length > decimals ? value : normalized;
}
