# CHUDO Wallet Production UI Contract

Status: UI integration boundary only. This public demo does not implement wallet authority.

## Security boundary

CHUDO identity is not a wallet root secret. The public demo creates no wallet root, seed phrase, mnemonic, private key, production address, signature, signed transaction, broadcast, settlement, or blockchain connection. All balances, identifiers, quotes, fees, histories, and receipts are deterministic local fixtures.

The future production design keeps these authorities separate:

1. `WalletRoot` and `KeyVault` own monetary key material.
2. `AccountManager` requests chain accounts through a versioned derivation contract.
3. `ChainRegistry` describes network behavior.
4. `AssetRegistry` describes native assets and tokens.
5. `AddressManager` applies chain-specific address rules.
6. `TransactionBuilder` creates an exact transaction intent.
7. `TransactionValidator` validates the exact asset, chain, recipient, amount, fee, and transaction data.
8. `SecureSigner` performs one protected signing operation for one exact approved intent.
9. `BroadcastService` receives only signed transaction data and never a private key.

`TransactionBuilder != SecureSigner != BroadcastService`.

Any future change to amount, recipient, chain, asset, fee, or transaction data must invalidate prior authorization. One system authorization may approve one exact signing operation only.

## Chain and asset registry

`ChainId` and `AssetId` are separate authorities. A symbol alone must never select a chain.

Demo chains:

- `CHAIN_CHUDO`
- `CHAIN_BITCOIN`
- `CHAIN_ETHEREUM`
- `CHAIN_SOLANA`

Demo assets:

- `CHUDO_NATIVE` → `CHAIN_CHUDO`
- `BTC_NATIVE` → `CHAIN_BITCOIN`
- `ETH_NATIVE` → `CHAIN_ETHEREUM`
- `USDT_ETHEREUM` → `CHAIN_ETHEREUM`
- `SOL_NATIVE` → `CHAIN_SOLANA`

Future `USDT · Ethereum` and `USDT · Solana` must have different `AssetId` values even though both display `USDT`.

Every UI asset record must provide an explicit `assetId`, `chainId`, display symbol, display name, network label, exact balance string/minor units, display decimals, reference value, change, icon token, receive identifier, and real/demo truth flag.

## Transaction lifecycle shown by the UI

The production handoff is designed for:

`SELECT ASSET + CHAIN → ADDRESS VALIDATION → TransactionBuilder → TransactionValidator → EXACT REVIEW → SYSTEM DEVICE AUTH → SecureSigner → SIGNED TRANSACTION → BroadcastService`

The current demo stops before authority. Review and receipt screens must state that no signature, broadcast, settlement, or movement of real funds occurred.

## Decimal policy

Demo display scales are deterministic fixtures and are not protocol authority:

- CHUDO: 2 display decimals
- BTC wallet: 8 display decimals
- ETH: 8 display decimals
- USDT · Ethereum: 2 display decimals
- SOL: 4 display decimals
- Market pair quote scales are pair-specific

Production note: `CHUDO=8`, `BTC=8`, `EUR=2`, `USDT=asset/network-defined`.

All payment and exchange calculations use exact decimal parsing and `bigint` minor units. Malformed input, negative input, scientific notation, multiple separators, and excess precision must fail closed.

## Receive identifiers

The public demo uses obvious non-payable strings only:

- `demo_chudo_address_not_for_funds`
- `demo_btc_receive_identifier_not_for_funds`
- `demo_evm_account_not_for_funds`
- `demo_solana_account_not_for_funds`

They are not production addresses. QR-style graphics may encode only these demo strings. Copy feedback is shown only after the clipboard operation succeeds.
