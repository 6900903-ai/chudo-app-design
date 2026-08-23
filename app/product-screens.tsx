"use client";

import { useMemo, useState } from "react";
import { demoData } from "./demo-data";
import {
  convertDemoAssetMinor,
  demoWalletAssetOrder,
  demoWalletAssets,
  demoWalletDecimalScaleNote,
  formatDemoAssetBalance,
  getDemoWalletAsset,
  getDemoWalletAssetBySlug,
  type AssetId,
  type DemoWalletAsset,
} from "./demo-wallet-data";
import { formatMinorUnits, parseMinorUnits, sanitizeDecimalInput } from "./money";
import type { ScreenTarget } from "./screen-catalog";
import { protectUserAmount } from "./ui-contracts";

type NavigateRoute = (route: string, replace?: boolean) => void;

function AssetGlyph({ asset, large = false }: { asset: DemoWalletAsset; large?: boolean }) {
  return <span className={`v3-asset-glyph ${asset.tone} ${large ? "large" : ""}`} aria-hidden="true">{asset.glyph}</span>;
}

function ProductHeading({ eyebrow, title, note }: { eyebrow: string; title: string; note?: string }) {
  return <header className="v3-product-heading"><div><span>{eyebrow}</span><h1>{title}</h1>{note && <p>{note}</p>}</div><em>PUBLIC DEMO</em></header>;
}

function AssetRail({
  selectedAssetId,
  hidden,
  onSelect,
  onAdd,
}: {
  selectedAssetId: AssetId;
  hidden: boolean;
  onSelect: (assetId: AssetId) => void;
  onAdd: () => void;
}) {
  return <div className="v3-asset-rail" aria-label="Активы демо-кошелька">
    {demoWalletAssets.map(asset => <button
      key={asset.assetId}
      className={`v3-asset-card ${asset.tone} ${selectedAssetId === asset.assetId ? "selected" : ""}`}
      aria-pressed={selectedAssetId === asset.assetId}
      data-asset-id={asset.assetId}
      onClick={() => onSelect(asset.assetId)}
    >
      <span className="v3-asset-card-top"><AssetGlyph asset={asset}/><span><strong>{asset.displayName}</strong><small>{asset.networkLabel}</small></span><i>{asset.change}</i></span>
      <strong className="v3-asset-balance" data-private-amount>{protectUserAmount(hidden, `${formatDemoAssetBalance(asset)} ${asset.symbol}`)}</strong>
      <span className="v3-reference-value" data-private-amount>{protectUserAmount(hidden, `≈ €${formatMinorUnits(asset.referenceValueMinor)}`)}</span>
      <small>SIMULATED · {asset.isReal ? "REAL" : "NOT REAL"}</small>
    </button>)}
    <button className="v3-asset-card add" data-asset-id="ADD" onClick={onAdd}>
      <span className="v3-add-glyph">+</span>
      <strong>Добавить актив</strong>
      <span>Управлять локальной видимостью</span>
      <small>КЛЮЧИ НЕ СОЗДАЮТСЯ</small>
    </button>
  </div>;
}

function WalletActions({ asset, navigateRoute }: { asset: DemoWalletAsset; navigateRoute: NavigateRoute }) {
  return <div className="v3-wallet-actions" aria-label={`Действия с ${asset.symbol}`}>
    <button onClick={() => navigateRoute(`/wallet/${asset.slug}/receive`)}><span>↓</span><strong>Получить</strong><small>{asset.networkLabel}</small></button>
    <button onClick={() => navigateRoute(`/wallet/${asset.slug}/send`)}><span>↑</span><strong>Отправить</strong><small>{asset.symbol}</small></button>
    <button className="exchange" onClick={() => navigateRoute("/market/swap")}><span>⇄</span><strong>Обменять</strong><small>Simulated swap</small></button>
  </div>;
}

export function ProductHomeScreen({
  selectedAssetId,
  hidden,
  setHidden,
  onSelectAsset,
  navigateRoute,
  startCall,
}: {
  selectedAssetId: AssetId;
  hidden: boolean;
  setHidden: (hidden: boolean) => void;
  onSelectAsset: (assetId: AssetId) => void;
  navigateRoute: NavigateRoute;
  startCall: (kind: "audio" | "video", contact: string) => void;
}) {
  const asset = getDemoWalletAsset(selectedAssetId);
  return <div className="page v3-home" data-screen-id="02.01">
    <ProductHeading eyebrow="СВЯЗЬ + ДЕНЬГИ" title={`Добрый день, ${demoData.profile.shortName}`} note="Выберите актив — действия и сеть изменятся вместе с контекстом."/>
    <section className="v3-wallet-hero">
      <div className="v3-section-title"><div><span>МУЛЬТИЧЕЙН-КОШЕЛЁК</span><h2>Мои demo-активы</h2></div><button className="v3-privacy-button" onClick={() => setHidden(!hidden)} aria-label={hidden ? "Показать личные суммы" : "Скрыть личные суммы"}>{hidden ? "Показать" : "Скрыть"}</button></div>
      <AssetRail selectedAssetId={selectedAssetId} hidden={hidden} onSelect={onSelectAsset} onAdd={() => navigateRoute("/wallet/add-asset")}/>
      <div className="v3-selected-context"><span><AssetGlyph asset={asset}/><span><small>ВЫБРАНО</small><strong>{asset.displayName} · {asset.networkLabel}</strong></span></span><em>Chain: {asset.chainId.replace("CHAIN_", "")}</em></div>
      <WalletActions asset={asset} navigateRoute={navigateRoute}/>
    </section>
    <div className="v3-home-grid">
      <section className="v3-panel v3-activity-card"><div className="v3-section-title"><div><span>СЕГОДНЯ</span><h2>Связь</h2></div><button onClick={() => navigateRoute("/chats")}>Все чаты</button></div><button className="v3-contact-row" onClick={() => navigateRoute("/chats/yuri")}><b>ЮВ</b><span><strong>Юрий Волков</strong><small>Перевод получил, спасибо!</small></span><time>10:44</time></button><div className="v3-call-shortcuts"><button onClick={() => startCall("audio", "Юрий Волков")}>☎ <strong>Аудиозвонок</strong></button><button onClick={() => startCall("video", "Юрий Волков")}>▣ <strong>Видеозвонок</strong></button></div></section>
      <section className="v3-panel v3-operations"><div className="v3-section-title"><div><span>ЛОКАЛЬНАЯ ИСТОРИЯ</span><h2>Последние операции</h2></div><button onClick={() => navigateRoute("/wallet/transactions")}>Все</button></div>{demoData.transactions.slice(0, 3).map(item => <div key={item.id}><b>{item.initials}</b><span><strong>{item.person}</strong><small>{item.kind} · {item.time}</small></span><em data-private-amount>{protectUserAmount(hidden, `${BigInt(item.amountMinor) > 0n ? "+" : ""}${formatMinorUnits(item.amountMinor)} CHUDO`)}</em></div>)}</section>
      <section className="v3-panel v3-home-security"><span className="v3-shield">✓</span><div><small>СТАТУС ПУБЛИЧНОГО DEMO</small><h2>Production-сервисы не подключены</h2><p>Ключи, подпись, blockchain, settlement и media backend отсутствуют.</p></div><button onClick={() => navigateRoute("/security")}>Открыть Защиту</button></section>
      <section className="v3-panel v3-market-peek"><div className="v3-section-title"><div><span>SIMULATED PRICES</span><h2>Рынок CHUDO</h2></div><button onClick={() => navigateRoute("/market/swap")}>Обменять</button></div>{demoData.marketPairs.map(pair => <button key={pair.id} onClick={() => navigateRoute(`/market/${pair.id}`)}><span><strong>{pair.base} / {pair.quote}</strong><small>{pair.volume}</small></span><em>{formatMinorUnits(pair.priceMinor, pair.quoteDecimals, pair.quote === "BTC")}</em><i className={pair.changeTone}>{pair.change}</i></button>)}</section>
    </div>
  </div>;
}

export function ProductWalletScreen({
  selectedAssetId,
  hidden,
  setHidden,
  onSelectAsset,
  navigateRoute,
}: {
  selectedAssetId: AssetId;
  hidden: boolean;
  setHidden: (hidden: boolean) => void;
  onSelectAsset: (assetId: AssetId) => void;
  navigateRoute: NavigateRoute;
}) {
  const asset = getDemoWalletAsset(selectedAssetId);
  return <div className="page v3-wallet" data-screen-id="04.01">
    <ProductHeading eyebrow="MULTICHAIN · LOCAL FIXTURES" title="Кошелёк" note="Chain и Asset разделены. Ни один аккаунт или ключ не создан."/>
    <section className="v3-wallet-summary">
      <div><AssetGlyph asset={asset} large/><span><small>ВЫБРАННЫЙ АКТИВ</small><h2>{asset.displayName}</h2><p>{asset.symbol} · {asset.networkLabel}</p></span></div>
      <strong data-private-amount>{protectUserAmount(hidden, `${formatDemoAssetBalance(asset)} ${asset.symbol}`)}</strong>
      <span data-private-amount>{protectUserAmount(hidden, `≈ €${formatMinorUnits(asset.referenceValueMinor)}`)} · SIMULATED</span>
      <button className="v3-privacy-button light" onClick={() => setHidden(!hidden)} aria-label={hidden ? "Показать личные суммы" : "Скрыть личные суммы"}>{hidden ? "Показать суммы" : "Скрыть суммы"}</button>
      <WalletActions asset={asset} navigateRoute={navigateRoute}/>
    </section>
    <section className="v3-wallet-assets v3-panel"><div className="v3-section-title"><div><span>ASSET REGISTRY · DEMO</span><h2>Активы и сети</h2></div><button onClick={() => navigateRoute("/wallet/add-asset")}>+ Добавить актив</button></div>{demoWalletAssets.map(item => <button key={item.assetId} className={selectedAssetId === item.assetId ? "selected" : ""} onClick={() => { onSelectAsset(item.assetId); navigateRoute(`/wallet/${item.slug}`); }}><AssetGlyph asset={item}/><span><strong>{item.displayName}</strong><small>{item.kind === "ERC20_DEMO" ? "Token · Demo" : "Нативный актив"} · {item.networkLabel}</small></span><span><strong data-private-amount>{protectUserAmount(hidden, `${formatDemoAssetBalance(item)} ${item.symbol}`)}</strong><small data-private-amount>{protectUserAmount(hidden, `≈ €${formatMinorUnits(item.referenceValueMinor)}`)}</small></span><i>›</i></button>)}</section>
    <p className="v3-scale-note">{demoWalletDecimalScaleNote}</p>
  </div>;
}

function DemoQr({ asset }: { asset: DemoWalletAsset }) {
  const cells = new Set([0, 1, 2, 5, 6, 7, 8, 10, 14, 16, 18, 21, 22, 23, 26, 30, 32, 35, 36, 38, 40, 42, 44, 46, 47, 48]);
  return <div className="v3-demo-qr" aria-label={`QR demo для ${asset.symbol}`}>{Array.from({ length: 49 }, (_, index) => <i className={cells.has(index) ? "on" : ""} key={index}/>)}</div>;
}

function WalletAssetDetail({ asset, hidden, navigateRoute }: { asset: DemoWalletAsset; hidden: boolean; navigateRoute: NavigateRoute }) {
  return <div className="v3-detail-layout">
    <section className={`v3-asset-detail-hero ${asset.tone}`}><div><AssetGlyph asset={asset} large/><span><small>{asset.assetId}</small><h2>{asset.displayName}</h2><p>{asset.networkLabel}</p></span></div><strong data-private-amount>{protectUserAmount(hidden, `${formatDemoAssetBalance(asset)} ${asset.symbol}`)}</strong><span data-private-amount>{protectUserAmount(hidden, `≈ €${formatMinorUnits(asset.referenceValueMinor)}`)} · SIMULATED</span><WalletActions asset={asset} navigateRoute={navigateRoute}/></section>
    <section className="v3-panel v3-network-facts"><h2>Актив и сеть</h2><dl><div><dt>AssetId</dt><dd>{asset.assetId}</dd></div><div><dt>ChainId</dt><dd>{asset.chainId}</dd></div><div><dt>Сеть</dt><dd>{asset.networkLabel}</dd></div><div><dt>Тип</dt><dd>{asset.kind === "ERC20_DEMO" ? "Token · Demo" : "Native · Demo"}</dd></div><div><dt>Реальный аккаунт</dt><dd>Нет</dd></div></dl>{asset.assetId === "USDT_ETHEREUM" && <p className="v3-warning">Всегда проверяйте сеть получателя.</p>}</section>
    <section className="v3-panel v3-identifier-preview"><div><h2>Demo-идентификатор получения</h2><span>DEMO ONLY · NOT FOR FUNDS</span></div><code>{asset.demoReceiveIdentifier}</code><div><DemoQr asset={asset}/><p>Графика кодирует только демонстрационную строку и не является production-адресом.</p></div><button onClick={() => navigateRoute(`/wallet/${asset.slug}/receive`)}>Открыть Получить</button></section>
    <section className="v3-panel v3-asset-operations"><h2>Последние demo-операции</h2>{demoData.transactions.slice(0, 3).map(item => <div key={item.id}><b>{item.initials}</b><span><strong>{item.kind}</strong><small>{item.time}</small></span><em data-private-amount>{protectUserAmount(hidden, `${formatMinorUnits(item.amountMinor)} CHUDO`)}</em></div>)}</section>
  </div>;
}

function ReceiveProductScreen({ asset, notify, qrPrimary = false }: { asset: DemoWalletAsset; notify: (message: string) => void; qrPrimary?: boolean }) {
  async function copyIdentifier() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(asset.demoReceiveIdentifier);
      notify("Демонстрационный идентификатор скопирован");
    } catch {
      notify("Не удалось скопировать demo-идентификатор. Буфер обмена недоступен.");
    }
  }
  return <section className={`v3-panel v3-receive-screen ${qrPrimary ? "qr-primary" : ""}`} data-wallet-state={qrPrimary ? "receive-qr" : "receive"}><div className="v3-receive-asset"><AssetGlyph asset={asset} large/><span><small>{qrPrimary ? "QR DISPLAY · DEMO" : "АКТИВ"}</small><h2>{qrPrimary ? `Demo QR для ${asset.symbol}` : asset.displayName}</h2><p>Сеть: {asset.networkLabel}</p></span></div><div className="v3-receive-body"><DemoQr asset={asset}/><div><span className="v3-danger-label">DEMO ONLY · NOT FOR FUNDS</span><h3>{qrPrimary ? "QR — основной элемент" : "Demo-идентификатор"}</h3><code>{asset.demoReceiveIdentifier}</code><p>{qrPrimary ? "QR кодирует только фиксированную demo-строку и не является платёжным адресом." : "Не отправляйте реальные средства. Публичное demo не создаёт адрес и не подключает сеть."}</p><button className="v3-primary" onClick={copyIdentifier}>Копировать demo-идентификатор</button></div></div></section>;
}

function SendProductScreen({ route, asset, hidden, navigateRoute }: { route: string; asset: DemoWalletAsset; hidden: boolean; navigateRoute: NavigateRoute }) {
  const [recipient, setRecipient] = useState("demo_recipient_not_for_funds");
  const [amount, setAmount] = useState(asset.assetId === "BTC_NATIVE" ? "0.00100000" : asset.decimals === 2 ? "40.00" : "0.1000");
  const amountMinor = parseMinorUnits(amount, asset.decimals);
  const available = BigInt(asset.availableMinor);
  const error = amountMinor === null ? `Введите корректную сумму, не более ${asset.decimals} знаков после разделителя.` : amountMinor <= 0n ? "Сумма должна быть больше нуля." : amountMinor > available ? hidden ? "Недостаточно demo-баланса. Доступная сумма скрыта." : `Недостаточно demo-баланса. Доступно ${formatDemoAssetBalance(asset, asset.availableMinor)} ${asset.symbol}.` : "";
  const stage = route.endsWith("/receipt") ? "receipt" : route.endsWith("/confirmation") ? "confirmation" : route.endsWith("/review") ? "review" : "form";
  const base = route.match(/^\/wallet\/([^/]+)\/send/)?.[1] ? `/wallet/${asset.slug}/send` : "/wallet/send";
  const protectedAmount = protectUserAmount(hidden, `${amount.replace(".", ",")} ${asset.symbol}`);
  if (stage === "receipt") return <section className="v3-panel v3-simulated-receipt"><span>✓</span><em>SIMULATED</em><h2>Не отправлено в сеть</h2><p>РЕАЛЬНЫЕ СРЕДСТВА НЕ ПЕРЕМЕЩАЛИСЬ</p><dl><div><dt>Актив</dt><dd>{asset.symbol}</dd></div><div><dt>Сеть</dt><dd>{asset.networkLabel}</dd></div><div><dt>Сумма</dt><dd data-private-amount>{protectedAmount}</dd></div><div><dt>Подпись</dt><dd>Не создавалась</dd></div><div><dt>Broadcast</dt><dd>Отсутствует</dd></div></dl><button className="v3-primary" onClick={() => navigateRoute(`/wallet/${asset.slug}`)}>Готово</button></section>;
  if (stage === "review" || stage === "confirmation") return <section className="v3-panel v3-send-review"><span className="v3-danger-label">REAL OPERATION = NO</span><h2>{stage === "review" ? "Проверьте точные данные" : "Demo-подтверждение"}</h2><strong data-private-amount>{protectedAmount}</strong><dl><div><dt>Актив</dt><dd>{asset.displayName}</dd></div><div><dt>Network</dt><dd>{asset.networkLabel}</dd></div><div><dt>Recipient</dt><dd>{recipient}</dd></div><div><dt>Amount</dt><dd data-private-amount>{protectedAmount}</dd></div><div><dt>Network fee</dt><dd>Simulated / not broadcast</dd></div><div><dt>Total</dt><dd data-private-amount>{protectedAmount}</dd></div></dl><p>Builder, validator, signer и broadcast не подключены. Подтверждение не создаёт транзакцию.</p><button className="v3-primary" onClick={() => navigateRoute(`${base}/${stage === "review" ? "confirmation" : "receipt"}`)}>{stage === "review" ? "Продолжить demo-проверку" : "Подтвердить без подписи"}</button><button className="v3-secondary" onClick={() => navigateRoute(base)}>Изменить</button></section>;
  return <section className="v3-panel v3-send-form"><div className="v3-receive-asset"><AssetGlyph asset={asset}/><span><small>ОТПРАВИТЬ · DEMO</small><h2>{asset.displayName}</h2><p>{asset.networkLabel}</p></span></div><label><span>Demo-получатель</span><input value={recipient} onChange={event => setRecipient(event.target.value)}/></label><label><span>Сумма</span><div><input inputMode="decimal" value={amount} aria-invalid={Boolean(error)} onChange={event => setAmount(sanitizeDecimalInput(event.target.value, asset.decimals))}/><strong>{asset.symbol}</strong></div></label><p className="v3-available" data-private-amount>Доступно: {protectUserAmount(hidden, `${formatDemoAssetBalance(asset, asset.availableMinor)} ${asset.symbol}`)}</p>{error && <p className="v3-form-error" role="alert">{error}</p>}<button className="v3-primary" disabled={Boolean(error) || recipient.trim() === ""} onClick={() => navigateRoute(`${base}/review`)}>Проверить перевод</button><p className="v3-form-note">Точная арифметика BigInt. Адрес не валидируется сетью, подпись и broadcast отсутствуют.</p></section>;
}

function AddAssetScreen() {
  const [visible, setVisible] = useState<Record<string, boolean>>(() => Object.fromEntries(demoWalletAssets.map(asset => [asset.assetId, true])));
  return <section className="v3-panel v3-add-assets"><div><span className="v3-add-glyph">+</span><div><h2>Добавить актив</h2><p>Управление видимостью действует только в этом локальном demo-экране.</p></div></div>{demoWalletAssets.map(asset => <div key={asset.assetId}><AssetGlyph asset={asset}/><span><strong>{asset.displayName}</strong><small>{asset.networkLabel} · {asset.assetId}</small></span><button role="switch" aria-label={`Показывать ${asset.displayName}`} aria-checked={visible[asset.assetId]} className={visible[asset.assetId] ? "on" : ""} onClick={() => setVisible(value => ({ ...value, [asset.assetId]: !value[asset.assetId] }))}><i/></button></div>)}<p>В production-версии поддерживаемый аккаунт будет подключён локально через Wallet Core. В публичном demo ключи не создаются.</p></section>;
}

function WalletBalanceSummary({ asset, hidden, navigateRoute }: { asset: DemoWalletAsset; hidden: boolean; navigateRoute: NavigateRoute }) {
  return <div className="v3-semantic-layout wallet-balance"><section className={`v3-asset-detail-hero ${asset.tone}`} data-wallet-state="balance"><div><AssetGlyph asset={asset} large/><span><small>СВОДКА DEMO-БАЛАНСА</small><h2>{asset.displayName}</h2><p>{asset.networkLabel}</p></span></div><strong data-private-amount>{protectUserAmount(hidden, `${formatDemoAssetBalance(asset)} ${asset.symbol}`)}</strong><span data-private-amount>{protectUserAmount(hidden, `≈ €${formatMinorUnits(asset.referenceValueMinor)}`)} · SIMULATED</span><WalletActions asset={asset} navigateRoute={navigateRoute}/></section><section className="v3-panel v3-key-values"><small>ТОЧНЫЕ ЛОКАЛЬНЫЕ ФИКСТУРЫ</small><h2>Структура баланса</h2><dl><div><dt>Доступно</dt><dd data-private-amount>{protectUserAmount(hidden, `${formatDemoAssetBalance(asset, asset.availableMinor)} ${asset.symbol}`)}</dd></div><div><dt>Оценка</dt><dd data-private-amount>{protectUserAmount(hidden, `€${formatMinorUnits(asset.referenceValueMinor)}`)}</dd></div><div><dt>Источник</dt><dd>Локальная demo-фикстура</dd></div><div><dt>Сеть</dt><dd>Не подключена</dd></div></dl></section></div>;
}

function WalletAssetsList({ selectedAssetId, hidden, navigateRoute }: { selectedAssetId: AssetId; hidden: boolean; navigateRoute: NavigateRoute }) {
  return <section className="v3-panel v3-data-list" data-wallet-state="assets"><header><div><small>ASSET REGISTRY · DEMO</small><h2>Все активы и сети</h2></div><em>{demoWalletAssets.length} активов</em></header>{demoWalletAssets.map(asset => <button key={asset.assetId} aria-current={asset.assetId === selectedAssetId ? "true" : undefined} onClick={() => navigateRoute(`/wallet/${asset.slug}`)}><AssetGlyph asset={asset}/><span><strong>{asset.displayName}</strong><small>{asset.symbol} · {asset.networkLabel} · {asset.assetId}</small></span><em data-private-amount>{protectUserAmount(hidden, formatDemoAssetBalance(asset))}</em></button>)}<p>Asset и chain показаны раздельно. Ключи и аккаунты не создаются.</p></section>;
}

function WalletChartScreen({ asset, hidden }: { asset: DemoWalletAsset; hidden: boolean }) {
  const [period, setPeriod] = useState<"1Ч" | "1Д" | "1Н" | "1М">("1Д");
  const bars: Record<typeof period, readonly number[]> = { "1Ч": [32, 44, 39, 57, 52, 66, 62], "1Д": [24, 41, 35, 58, 49, 72, 81], "1Н": [20, 28, 45, 38, 61, 75, 69], "1М": [16, 25, 34, 48, 43, 66, 88] };
  return <section className="v3-panel v3-performance-card" data-wallet-state="chart"><span>CHUDO · ДИНАМИКА DEMO-БАЛАНСА · {period}</span><strong data-private-amount>{protectUserAmount(hidden, `${formatDemoAssetBalance(asset)} ${asset.symbol}`)}</strong><em>Фиксированная визуализация</em><div>{bars[period].map((height, index) => <i style={{ height: `${height}%` }} key={index}/>)}</div><nav aria-label="Период графика CHUDO">{(["1Ч", "1Д", "1Н", "1М"] as const).map(item => <button key={item} className={period === item ? "active" : ""} aria-pressed={period === item} onClick={() => setPeriod(item)}>{item}</button>)}</nav><p>График не является публичной рыночной ценой и построен из локальных значений.</p></section>;
}

function WalletTransactionHistory({ hidden, navigateRoute }: { hidden: boolean; navigateRoute: NavigateRoute }) {
  return <section className="v3-panel v3-transaction-detail" data-wallet-state="transactions"><h2>История demo-операций</h2>{demoData.transactions.map((item, index) => <button key={item.id} onClick={() => index === 0 && navigateRoute("/wallet/transaction/tx-received-128")} aria-label={`${item.kind}: ${item.person}`}><b>{item.initials}</b><span><strong>{item.person}</strong><small>{item.kind} · {item.time}</small></span><em data-private-amount>{protectUserAmount(hidden, `${BigInt(item.amountMinor) > 0n ? "+" : ""}${formatMinorUnits(item.amountMinor)} CHUDO`)}</em></button>)}<p>Все записи фиксированы локально. Сеть и реальный баланс не запрашиваются.</p></section>;
}

function WalletTransactionDetail({ hidden }: { hidden: boolean }) {
  const item = demoData.transactions[0];
  return <section className="v3-panel v3-key-values" data-wallet-state="transaction-detail"><small>TX-RECEIVED-128 · LOCAL FIXTURE</small><h2>Получено от Юрия Волкова</h2><dl><div><dt>Сумма</dt><dd data-private-amount>{protectUserAmount(hidden, `+${formatMinorUnits(item.amountMinor)} CHUDO`)}</dd></div><div><dt>Время</dt><dd>{item.time}</dd></div><div><dt>Статус</dt><dd>Demo-запись · не подтверждена сетью</dd></div><div><dt>Transaction hash</dt><dd>Отсутствует</dd></div><div><dt>Подпись</dt><dd>Не создавалась</dd></div></dl><p>Экран показывает ровно одну локальную запись, а не общую историю.</p></section>;
}

function WalletSendValidation({ asset, hidden }: { asset: DemoWalletAsset; hidden: boolean }) {
  return <section className="v3-panel v3-send-validation" data-wallet-state="send-validation"><span className="v3-danger-label">VALIDATION · REJECTED</span><h2>Сумма требует исправления</h2><div className="v3-invalid-input" aria-label="Отклонённая сумма" data-private-amount>{protectUserAmount(hidden, `12abc34 ${asset.symbol}`)}</div><p role="alert">Используйте только цифры и один десятичный разделитель. Вставленное значение не было преобразовано или переосмыслено.</p><dl><div><dt>{asset.symbol}</dt><dd>до {asset.decimals} десятичных знаков</dd></div><div><dt>Арифметика</dt><dd>Только BigInt</dd></div><div><dt>Production scale</dt><dd>CHUDO=8, BTC=8, EUR=2, USDT=asset/network-defined</dd></div></dl></section>;
}

function WalletRecipientSelector({ navigateRoute }: { navigateRoute: NavigateRoute }) {
  return <section className="v3-panel v3-recipient-list" data-wallet-state="recipient"><h2>Выберите demo-получателя</h2>{["Юрий Волков", "Александр", "Мария"].map(name => <button key={name} onClick={() => navigateRoute("/wallet/send")}><b>{name[0]}</b><span><strong>{name}</strong><small>Локальный demo-контакт</small></span><i>›</i></button>)}<p>Выбор не обращается к адресной книге или backend.</p></section>;
}

export function WalletRouteScreen({
  target,
  route,
  selectedAssetId,
  hidden,
  navigateRoute,
  notify,
}: {
  target?: ScreenTarget;
  route: string;
  selectedAssetId: AssetId;
  hidden: boolean;
  navigateRoute: NavigateRoute;
  notify: (message: string) => void;
}) {
  const slug = route.match(/^\/wallet\/([^/]+)/)?.[1];
  const asset = (slug && getDemoWalletAssetBySlug(slug)) || getDemoWalletAsset(selectedAssetId);
  const screenId = target?.screenId ?? `wallet-${asset.slug}-${route.split("/").at(-1)}`;
  const canonicalTitles: Record<string, string> = { "/wallet/balance": "Баланс", "/wallet/assets": "Активы", "/wallet/chudo": "CHUDO", "/wallet/chudo/chart": "График CHUDO", "/wallet/transactions": "История операций", "/wallet/transaction/tx-received-128": "Операция · 128 CHUDO", "/wallet/send": "Отправить CHUDO", "/wallet/send/validation": "Проверка суммы", "/wallet/send/review": "Проверка перевода", "/wallet/send/confirmation": "Подтверждение перевода", "/wallet/send/receipt": "Квитанция demo", "/wallet/receive": "Получить CHUDO", "/wallet/receive/qr": "QR для получения", "/wallet/scan": "Сканировать QR", "/wallet/send/recipient": "Demo-получатель", "/wallet/add-asset": "Добавить актив" };
  const title = canonicalTitles[route] ?? (route.includes("/receive") ? `Получить ${asset.symbol}` : route.includes("/send") ? `Отправить ${asset.symbol}` : target?.chudoName ?? asset.displayName);
  let content;
  switch (route) {
    case "/wallet/balance": content = <WalletBalanceSummary asset={asset} hidden={hidden} navigateRoute={navigateRoute}/>; break;
    case "/wallet/assets": content = <WalletAssetsList selectedAssetId={selectedAssetId} hidden={hidden} navigateRoute={navigateRoute}/>; break;
    case "/wallet/chudo": content = <WalletAssetDetail asset={getDemoWalletAsset("CHUDO_NATIVE")} hidden={hidden} navigateRoute={navigateRoute}/>; break;
    case "/wallet/chudo/chart": content = <WalletChartScreen asset={getDemoWalletAsset("CHUDO_NATIVE")} hidden={hidden}/>; break;
    case "/wallet/transactions": content = <WalletTransactionHistory hidden={hidden} navigateRoute={navigateRoute}/>; break;
    case "/wallet/transaction/tx-received-128": content = <WalletTransactionDetail hidden={hidden}/>; break;
    case "/wallet/send/recipient": content = <WalletRecipientSelector navigateRoute={navigateRoute}/>; break;
    case "/wallet/send/validation": content = <WalletSendValidation asset={asset} hidden={hidden}/>; break;
    case "/wallet/send":
    case "/wallet/send/review":
    case "/wallet/send/confirmation":
    case "/wallet/send/receipt": content = <SendProductScreen route={route} asset={asset} hidden={hidden} navigateRoute={navigateRoute}/>; break;
    case "/wallet/receive": content = <ReceiveProductScreen asset={asset} notify={notify}/>; break;
    case "/wallet/receive/qr": content = <ReceiveProductScreen asset={asset} notify={notify} qrPrimary/>; break;
    case "/wallet/scan": content = <section className="v3-panel v3-scanner-state" data-wallet-state="scan"><span>⌗</span><h2>QR-сканер · demo</h2><p>Камера не включается и разрешение браузера не запрашивается.</p><button onClick={() => notify("Demo-сканирование не использует камеру")}>Проверить безопасный сценарий</button></section>; break;
    case "/wallet/add-asset": content = <AddAssetScreen/>; break;
    default:
      content = route.endsWith("/receive") ? <ReceiveProductScreen asset={asset} notify={notify}/> : route.includes("/send") ? <SendProductScreen route={route} asset={asset} hidden={hidden} navigateRoute={navigateRoute}/> : <WalletAssetDetail asset={asset} hidden={hidden} navigateRoute={navigateRoute}/>;
  }
  return <div className="page v3-wallet-route" data-screen-id={screenId}><ProductHeading eyebrow={`${asset.symbol} · ${asset.networkLabel}`} title={title} note="Локальный сценарий без ключей, адресов, подписи и broadcast."/>
    {content}</div>;
}

export function SwapScreen({ hidden, navigateRoute }: { hidden: boolean; navigateRoute: NavigateRoute }) {
  const [fromId, setFromId] = useState<AssetId>("CHUDO_NATIVE");
  const [toId, setToId] = useState<AssetId>("BTC_NATIVE");
  const [amount, setAmount] = useState("250.00");
  const [stage, setStage] = useState<"form" | "review" | "receipt">("form");
  const from = getDemoWalletAsset(fromId);
  const to = getDemoWalletAsset(toId);
  const amountMinor = parseMinorUnits(amount, from.decimals);
  const estimatedMinor = amountMinor === null ? null : convertDemoAssetMinor(amountMinor, from, to);
  const estimated = estimatedMinor === null ? "—" : `${formatDemoAssetBalance(to, estimatedMinor.toString())} ${to.symbol}`;
  const rateMinor = convertDemoAssetMinor(BigInt(`1${"0".repeat(from.decimals)}`), from, to);
  const rate = `1 ${from.symbol} = ${formatDemoAssetBalance(to, rateMinor.toString())} ${to.symbol}`;
  const error = amountMinor === null ? "Введите корректную точную сумму." : amountMinor <= 0n ? "Сумма должна быть больше нуля." : amountMinor > BigInt(from.availableMinor) ? "Недостаточно demo-баланса." : fromId === toId ? "Выберите разные активы." : "";
  function changeFrom(next: AssetId) { setFromId(next); if (next === toId) setToId(fromId); setAmount(""); setStage("form"); }
  function changeTo(next: AssetId) { setToId(next); if (next === fromId) setFromId(toId); setStage("form"); }
  function reverse() { setFromId(toId); setToId(fromId); setAmount(""); setStage("form"); }
  if (stage === "receipt") return <div className="page v3-swap-page" data-screen-id="05.14"><ProductHeading eyebrow="SWAP RECEIPT" title="Демо-обмен"/><section className="v3-panel v3-simulated-receipt"><span>✓</span><em>SIMULATED</em><h2>NO SETTLEMENT</h2><p>NO BROADCAST · NO REAL FUNDS MOVED</p><dl><div><dt>Отдаёте</dt><dd data-private-amount>{protectUserAmount(hidden, `${amount} ${from.symbol}`)}</dd></div><div><dt>Получаете</dt><dd data-private-amount>{protectUserAmount(hidden, estimated)}</dd></div><div><dt>Курс</dt><dd>{rate}</dd></div><div><dt>Protocol fee</dt><dd>Не определена · DEMO</dd></div></dl><button className="v3-primary" onClick={() => { setStage("form"); navigateRoute("/wallet"); }}>Вернуться в кошелёк</button></section></div>;
  return <div className="page v3-swap-page" data-screen-id="05.14"><ProductHeading eyebrow="EXCHANGE · SIMULATED" title={stage === "review" ? "Проверка обмена" : "Обменять активы"} note="Точный локальный расчёт BigInt. Ликвидность, settlement и network fee не подключены."/>{stage === "review" ? <section className="v3-panel v3-swap-review"><span className="v3-danger-label">REAL OPERATION = NO</span><div className="v3-swap-flow"><div><AssetGlyph asset={from}/><span><small>ОТДАЁТЕ</small><strong data-private-amount>{protectUserAmount(hidden, `${amount.replace(".", ",")} ${from.symbol}`)}</strong><em>{from.networkLabel}</em></span></div><b>↓</b><div><AssetGlyph asset={to}/><span><small>ПОЛУЧАЕТЕ</small><strong data-private-amount>{protectUserAmount(hidden, estimated)}</strong><em>{to.networkLabel}</em></span></div></div><dl><div><dt>Курс</dt><dd>{rate}</dd></div><div><dt>Комиссия протокола</dt><dd>Не определена · DEMO</dd></div><div><dt>Network fee</dt><dd>Simulated / not broadcast</dd></div><div><dt>Совместимость сетей</dt><dd>Расчёт quote, не cross-chain settlement</dd></div></dl><button className="v3-primary" onClick={() => setStage("receipt")}>Подтвердить demo без settlement</button><button className="v3-secondary" onClick={() => setStage("form")}>Изменить</button></section> : <div className="v3-swap-layout"><section className="v3-panel v3-swap-form"><div className="v3-swap-block"><label><span>ОТДАЁТЕ</span><select aria-label="Актив FROM" value={fromId} onChange={event => changeFrom(event.target.value as AssetId)}>{demoWalletAssets.map(asset => <option key={asset.assetId} value={asset.assetId}>{asset.symbol} · {asset.networkLabel}</option>)}</select></label><div className="v3-swap-amount"><input inputMode="decimal" value={amount} onChange={event => setAmount(sanitizeDecimalInput(event.target.value, from.decimals))} placeholder="0" aria-label="Сумма обмена"/><strong>{from.symbol}</strong></div><small data-private-amount>Доступно: {protectUserAmount(hidden, `${formatDemoAssetBalance(from, from.availableMinor)} ${from.symbol}`)}</small></div><button className="v3-reverse" aria-label="Поменять активы местами" onClick={reverse}>⇅</button><div className="v3-swap-block to"><label><span>ПОЛУЧАЕТЕ</span><select aria-label="Актив TO" value={toId} onChange={event => changeTo(event.target.value as AssetId)}>{demoWalletAssets.map(asset => <option key={asset.assetId} value={asset.assetId}>{asset.symbol} · {asset.networkLabel}</option>)}</select></label><strong className="v3-estimated" data-private-amount>{protectUserAmount(hidden, estimated)}</strong><small>Оценка по фиксированному simulated rate</small></div>{error && <p className="v3-form-error" role="alert">{error}</p>}<button className="v3-primary" disabled={Boolean(error)} onClick={() => setStage("review")}>Проверить обмен</button></section><aside className="v3-panel v3-swap-summary"><h2>Детали demo quote</h2><dl><div><dt>Курс</dt><dd>{rate}</dd></div><div><dt>Protocol fee</dt><dd>Не определена · DEMO</dd></div><div><dt>Network fee</dt><dd>Simulated / not broadcast</dd></div><div><dt>Estimated receive</dt><dd data-private-amount>{protectUserAmount(hidden, estimated)}</dd></div></dl><p>Сети {from.networkLabel} и {to.networkLabel} показаны как контекст активов. Cross-chain bridge не реализован.</p></aside></div>}</div>;
}

const familyEyebrow: Record<string, string> = {
  "02": "ГЛАВНАЯ · ЛОКАЛЬНЫЙ КОНТЕКСТ",
  "03": "CHUDO MESSENGER · DEMO",
  "05": "SIMULATED MARKET",
  "06": "SIMULATED PORTFOLIO",
  "07": "MINING UI · NO BACKEND",
  "08": "SECURITY STATUS · TRUTHFUL",
  "09": "LOCAL DOCUMENT CENTER",
  "10": "LOCAL PREFERENCES",
};

function SemanticFacts({ target }: { target: ScreenTarget }) {
  const copy: Record<string, readonly [string, string, string]> = {
    "02": ["Персональная зона", "Локальное состояние", "Сервис не подключён"],
    "03": ["Сообщения", "Фиксированные demo-данные", "E2E не заявляется"],
    "05": ["Рыночные данные", "Pair-specific fixtures", "Settlement отсутствует"],
    "06": ["Личные позиции", "Только simulated ownership", "Доходность не реальна"],
    "07": ["Mining runtime", "Фиксированный сценарий", "Pool endpoint отсутствует"],
    "08": ["Ключи", "Не создаются", "Secure storage не активен"],
    "09": ["Документ", "Локальный статический материал", "Загрузка отсутствует"],
    "10": ["Настройка", "Действует в текущем UI", "Backend-профиль отсутствует"],
  };
  const facts = copy[target.familyId] ?? ["Demo", "Локальный сценарий", "Backend отсутствует"];
  return <dl className="v3-semantic-facts"><div><dt>{facts[0]}</dt><dd>{facts[1]}</dd></div><div><dt>Production</dt><dd>{facts[2]}</dd></div><div><dt>Реальная операция</dt><dd>Нет</dd></div></dl>;
}

function HomeSemantic({ target, navigateRoute }: { target: ScreenTarget; navigateRoute: NavigateRoute }) {
  switch (target.semanticKey) {
    case "home-promo":
      return <section className="v3-panel v3-state-hero warning"><span className="v3-state-icon">!</span><small>ВАЖНОЕ DEMO-УВЕДОМЛЕНИЕ</small><h2>Публичный прототип работает без backend</h2><p>Баланс, сообщения, рыночные цены и статусы операций симулированы. Не отправляйте средства на demo-адреса.</p><button className="v3-primary" onClick={() => navigateRoute("/notifications")}>Открыть уведомления</button></section>;
    case "home-quick-actions":
      return <section className="v3-panel v3-route-actions"><h2>Быстрые действия</h2><p>Каждое действие открывает локальный сценарий без подписи, broadcast или реальных средств.</p><div><button onClick={() => navigateRoute("/wallet/send")}><strong>↑</strong><span>Отправить<small>Demo review</small></span></button><button onClick={() => navigateRoute("/wallet/receive")}><strong>↓</strong><span>Получить<small>Non-fund address</small></span></button><button onClick={() => navigateRoute("/market/swap")}><strong>⇄</strong><span>Обменять<small>Simulated quote</small></span></button><button onClick={() => navigateRoute("/wallet/scan")}><strong>⌗</strong><span>Сканировать<small>Без камеры</small></span></button></div></section>;
    case "home-favorites":
      return <section className="v3-panel v3-data-list"><header><div><small>ЛОКАЛЬНАЯ ПОДБОРКА</small><h2>Избранное</h2></div><em>2 элемента</em></header><button onClick={() => navigateRoute("/market/chudo-btc")}><b>★</b><span><strong>CHUDO / BTC</strong><small>Simulated market pair</small></span><em>Открыть</em></button><button onClick={() => navigateRoute("/chats/yuri")}><b>★</b><span><strong>Юрий Волков</strong><small>Demo conversation</small></span><em>Открыть</em></button></section>;
    case "home-favorites-empty":
      return <section className="v3-panel v3-empty-state" data-empty-state="favorites"><span>☆</span><small>ИЗБРАННОЕ · ПУСТО</small><h2>Здесь пока ничего нет</h2><p>Добавьте demo-пару из рынка. Выбор останется только в текущем интерфейсе и не синхронизируется.</p><button className="v3-primary" onClick={() => navigateRoute("/market")}>Выбрать на рынке</button></section>;
    case "home-notification-entry":
      return <section className="v3-panel v3-state-hero"><span className="v3-state-icon">3</span><small>ЦЕНТР УВЕДОМЛЕНИЙ</small><h2>Три локальных demo-сообщения</h2><p>Они созданы фикстурами интерфейса, не получены с сервера и не подтверждают активность аккаунта.</p><button className="v3-primary" onClick={() => navigateRoute("/notifications")}>Перейти в центр</button></section>;
  }
  return null;
}

function PortfolioSemantic({ target, hidden, navigateRoute }: { target: ScreenTarget; hidden: boolean; navigateRoute: NavigateRoute }) {
  const periods = ["1Ч", "1Д", "1Н", "1М"] as const;
  const [period, setPeriod] = useState<(typeof periods)[number]>("1М");
  const metrics: Record<(typeof periods)[number], { value: string; change: string; bars: readonly number[] }> = {
    "1Ч": { value: "+€18,40", change: "+0,14%", bars: [20, 31, 28, 44, 41, 58, 64] },
    "1Д": { value: "+€184,20", change: "+1,45%", bars: [24, 38, 33, 51, 47, 69, 76] },
    "1Н": { value: "+€428,60", change: "+3,44%", bars: [18, 29, 42, 37, 55, 72, 81] },
    "1М": { value: "+€590,48", change: "+4,82%", bars: [16, 25, 34, 48, 43, 66, 88] },
  };
  const metric = metrics[period];
  if (target.semanticKey === "portfolio-watchlist-empty") return <section className="v3-panel v3-empty-state" data-empty-state="watchlist"><span>☆</span><small>WATCHLIST · ПУСТО</small><h2>Список наблюдения пуст</h2><p>Это отдельный список, не ваши demo-позиции. Добавление пары будет локальным и не создаст рыночную подписку.</p><button className="v3-primary" onClick={() => navigateRoute("/market")}>Добавить demo-пару</button></section>;
  if (target.semanticKey === "portfolio-watchlist") return <section className="v3-panel v3-data-list"><header><div><small>НЕ ЯВЛЯЕТСЯ ПОЗИЦИЕЙ</small><h2>Список наблюдения</h2></div><em>2 пары</em></header>{demoData.marketPairs.slice(0, 2).map(pair => <button key={pair.id} onClick={() => navigateRoute(`/market/${pair.id}`)}><b>★</b><span><strong>{pair.base} / {pair.quote}</strong><small>{pair.volume} · simulated</small></span><em>{formatMinorUnits(pair.priceMinor, pair.quoteDecimals, pair.quote === "BTC")}</em></button>)}</section>;
  if (target.semanticKey === "portfolio-chudo") return <div className="v3-semantic-layout portfolio"><section className="v3-panel v3-state-hero"><small>OWNED DEMO POSITION</small><h2>CHUDO</h2><strong className="v3-large-value" data-private-amount>{protectUserAmount(hidden, "12 840,62 CHUDO")}</strong><p>Фиксированная позиция для проверки интерфейса. Ownership, custody и доходность не подтверждаются сетью.</p><button className="v3-primary" onClick={() => navigateRoute("/wallet/chudo")}>Открыть актив</button></section><section className="v3-panel v3-key-values"><h2>Структура позиции</h2><dl><div><dt>Доступно</dt><dd data-private-amount>{protectUserAmount(hidden, "12 590,62 CHUDO")}</dd></div><div><dt>В demo-заявке</dt><dd data-private-amount>{protectUserAmount(hidden, "250,00 CHUDO")}</dd></div><div><dt>Источник</dt><dd>Локальная фикстура</dd></div></dl></section></div>;
  if (target.semanticKey === "portfolio-allocation") return <section className="v3-panel v3-owned-allocation"><h2>Распределение demo-активов</h2><p>Проценты относятся только к фиксированной модели портфеля.</p>{demoWalletAssets.slice(0, 4).map((asset, index) => <div key={asset.assetId}><AssetGlyph asset={asset}/><span><strong>{asset.symbol}</strong><small>{asset.networkLabel}</small></span><em>{["68%", "14%", "10%", "8%"][index]}</em></div>)}</section>;
  if (target.semanticKey === "portfolio-value") return <section className="v3-panel v3-state-hero"><small>ОЦЕНОЧНАЯ СТОИМОСТЬ · SIMULATED</small><h2>Стоимость портфеля</h2><strong className="v3-large-value" data-private-amount>{protectUserAmount(hidden, "€15 164,23")}</strong><p data-private-amount>{protectUserAmount(hidden, "+€590,48 за 1М · +4,82%")}</p><p>Пересчёт использует локальные demo-курсы и не является котировкой или выпиской.</p></section>;
  const showPeriods = target.semanticKey === "portfolio-performance-periods";
  return <div className="v3-semantic-layout portfolio"><section className="v3-panel v3-performance-card"><span>{showPeriods ? "ВЫБЕРИТЕ ПЕРИОД" : `ДИНАМИКА · ${period}`}</span><strong data-private-amount>{protectUserAmount(hidden, metric.value)}</strong><em data-private-amount>{protectUserAmount(hidden, metric.change)}</em><div>{metric.bars.map((height, index) => <i style={{ height: `${height}%` }} key={index}/>)}</div><nav aria-label="Период портфеля">{periods.map(item => <button key={item} aria-pressed={period === item} className={period === item ? "active" : ""} onClick={() => setPeriod(item)}>{item}</button>)}</nav></section><section className="v3-panel v3-owned-allocation"><h2>{target.semanticKey === "portfolio" ? "Demo-позиции" : "Контекст расчёта"}</h2><p>{target.semanticKey === "portfolio" ? "Owned demo allocation отделён от watchlist." : "Значения зависят от выбранного локального периода."}</p>{demoWalletAssets.slice(0, 3).map((asset, index) => <div key={asset.assetId}><AssetGlyph asset={asset}/><span><strong>{asset.symbol}</strong><small>{asset.networkLabel}</small></span><em>{["68%", "14%", "10%"][index]}</em></div>)}</section></div>;
}

function MiningSemantic({ target, hidden }: { target: ScreenTarget; hidden: boolean }) {
  if (target.semanticKey === "mining-no-miner") return <section className="v3-panel v3-empty-state" data-empty-state="miner"><span>◇</span><small>NO MINER · NO BACKEND</small><h2>Майнеры не подключены</h2><p>Здесь намеренно нет hashrate, workers или личной награды. Публичный прототип не ищет оборудование и не принимает credentials.</p><button className="v3-primary" disabled aria-disabled="true">Подключение недоступно в demo</button></section>;
  if (target.semanticKey === "mining-connect") return <section className="v3-panel v3-state-hero warning"><small>PRODUCTION FLOW UNAVAILABLE</small><h2>Подключить майнер</h2><p>Pool endpoint, worker token и credentials не создаются. Этот экран документирует границу будущего сценария.</p><ol className="v3-step-list"><li>Выбрать совместимое устройство</li><li>Получить production endpoint</li><li>Подтвердить worker в защищённой среде</li></ol><button className="v3-primary" disabled aria-disabled="true">Нет подключения в public demo</button></section>;
  if (target.semanticKey === "mining-workers") return <section className="v3-panel v3-data-list"><header><div><small>FIXED WORKER FIXTURES</small><h2>Воркеры</h2></div><em>{demoData.mining.workersList.length} demo</em></header>{demoData.mining.workersList.map(worker => <div className="v3-static-row" key={worker.name}><b>●</b><span><strong>{worker.name}</strong><small>{worker.status} · {worker.seen}</small></span><em>{worker.hashrate}</em></div>)}</section>;
  if (target.semanticKey === "mining-rewards") return <section className="v3-panel v3-timeline"><h2>История наград</h2><p>Фиксированные записи без payout и blockchain proof.</p>{demoData.mining.rewards.map(reward => <div key={reward.round}><i/><span><strong>{reward.round} · {reward.status}</strong><small>{reward.time}</small></span><em data-private-amount>{protectUserAmount(hidden, `${formatMinorUnits(reward.amountMinor)} CHUDO`)}</em></div>)}</section>;
  if (target.semanticKey === "mining-reward-demo-round-48291") {
    const reward = demoData.mining.rewards[0];
    return <section className="v3-panel v3-key-values" data-mining-state="reward-detail"><small>DEMO-ROUND-48291 · SINGLE RECORD</small><h2>Детали demo-награды</h2><dl><div><dt>Round</dt><dd>{reward.round}</dd></div><div><dt>Сумма</dt><dd data-private-amount>{protectUserAmount(hidden, `${formatMinorUnits(reward.amountMinor)} CHUDO`)}</dd></div><div><dt>Время</dt><dd>{reward.time}</dd></div><div><dt>Статус</dt><dd>{reward.status}</dd></div><div><dt>Payout proof</dt><dd>Отсутствует</dd></div></dl><p>Одна локальная запись; blockchain и pool backend не запрашиваются.</p></section>;
  }
  if (target.semanticKey === "mining-settings") return <section className="v3-panel v3-key-values"><h2>Настройки майнера</h2><p>Только представление будущих параметров; значения не отправляются.</p><dl><div><dt>Интенсивность</dt><dd>Demo · сбалансированная</dd></div><div><dt>Автозапуск</dt><dd>Не подключён</dd></div><div><dt>Payout address</dt><dd>Не запрашивается</dd></div></dl></section>;
  const miningCopy: Record<string, readonly [string, string, string]> = {
    "mining-miner-status": ["Статус майнера", demoData.mining.personalHashrate, "3 фиксированных worker-состояния"],
    "mining-pool-status": ["Статус пула", demoData.mining.poolHashrate, "Endpoint отсутствует"],
    "mining-round": ["Текущий demo-round", demoData.mining.round, demoData.mining.lastBlock],
    "mining-earnings": ["Начисления", `${formatMinorUnits(demoData.mining.pendingRewardMinor)} CHUDO`, "Simulated pending reward"],
  };
  const copy = miningCopy[target.semanticKey] ?? [target.chudoName, "Локальная фикстура", "NO MINING BACKEND"];
  return <section className="v3-panel v3-mining-state"><span>NO MINING BACKEND</span><h2>{copy[0]}</h2><div className="v3-mining-metrics"><div><small>Demo value</small><strong data-private-amount={target.semanticKey === "mining-earnings" || undefined}>{target.semanticKey === "mining-earnings" ? protectUserAmount(hidden, copy[1]) : copy[1]}</strong></div><div><small>Контекст</small><strong>{copy[2]}</strong></div><div><small>Реальный runtime</small><strong>Нет</strong></div></div><p>Показатели фиксированы. Подключение, credentials и payout не выполняются.</p></section>;
}

function SecuritySemantic({ target, notify }: { target: ScreenTarget; notify: (message: string) => void }) {
  if (target.semanticKey === "security-devices") return <section className="v3-panel v3-data-list"><header><div><small>LOCAL FIXTURES · NOT ACCOUNT DATA</small><h2>Устройства</h2></div><em>1 demo</em></header><button onClick={() => notify("Demo-устройство: локальный статус открыт")}><b>▣</b><span><strong>Этот браузер · demo</strong><small>Windows · Warsaw · текущая локальная сессия</small></span><em>Не подтверждено backend</em></button><div className="v3-honesty-note">Device attestation, remote revoke и trusted-device authority не подключены.</div></section>;
  if (target.semanticKey === "security-device-demo-phone") return <section className="v3-panel v3-key-values"><small>DEMO DEVICE DETAIL</small><h2>Этот браузер</h2><dl><div><dt>Платформа</dt><dd>Windows · fixture</dd></div><div><dt>Последняя активность</dt><dd>Текущая demo-сессия</dd></div><div><dt>Device trust</dt><dd>Не подтверждён</dd></div><div><dt>Remote revoke</dt><dd>Недоступен</dd></div></dl></section>;
  if (target.semanticKey === "security-sessions") return <section className="v3-panel v3-data-list"><header><div><small>NOT SERVER-AUTHENTICATED</small><h2>Сессии</h2></div><em>1 локальная</em></header><div className="v3-static-row"><b>●</b><span><strong>Текущая demo-сессия</strong><small>Этот браузер · фиксированный контекст</small></span><em>Без auth token</em></div><div className="v3-honesty-note">Список не доказывает, что других сессий нет.</div></section>;
  if (target.semanticKey === "security-session-current") return <section className="v3-panel v3-key-values" data-security-state="session-detail"><small>CURRENT · SINGLE LOCAL RECORD</small><h2>Текущая demo-сессия</h2><dl><div><dt>Клиент</dt><dd>Этот браузер · fixture</dd></div><div><dt>Регион</dt><dd>Warsaw · локальный текст</dd></div><div><dt>Auth token</dt><dd>Не создавался</dd></div><div><dt>Server verification</dt><dd>Отсутствует</dd></div></dl><p>Деталь не подтверждает identity или отсутствие других сессий.</p></section>;
  if (target.semanticKey === "security-backups-empty") return <section className="v3-panel v3-empty-state" data-empty-state="backups"><span>□</span><small>BACKUP · ПУСТО</small><h2>Резервных копий нет</h2><p>Публичный прототип не создаёт backup, seed phrase или key material.</p></section>;
  if (target.semanticKey === "security-backups" || target.semanticKey === "security-recovery" || target.semanticKey === "security-unavailable") return <section className="v3-panel v3-state-hero warning"><small>PRODUCTION SECURITY FEATURE UNAVAILABLE</small><h2>{target.chudoName}</h2><p>Ключи, recovery material, secure storage и network authority не создаются. Здесь нет скрытой активной функции.</p><button disabled aria-disabled="true">Недоступно в public demo</button></section>;
  if (target.semanticKey === "security-trusted-contacts") return <section className="v3-panel v3-data-list"><header><div><small>LOCAL CONTACTS · NO RECOVERY AUTHORITY</small><h2>Доверенные контакты</h2></div><em>1 demo</em></header><div className="v3-static-row"><b>ЮВ</b><span><strong>Юрий Волков</strong><small>Демонстрационный контакт</small></span><em>Не уполномочен</em></div><div className="v3-honesty-note">Контакты не могут восстановить аккаунт или подтвердить операцию.</div></section>;
  if (target.semanticKey === "security-trusted-contact-yuri") return <section className="v3-panel v3-key-values" data-security-state="trusted-contact-detail"><small>YURI · SINGLE LOCAL CONTACT</small><h2>Юрий Волков</h2><dl><div><dt>Источник</dt><dd>Локальная demo-фикстура</dd></div><div><dt>Recovery authority</dt><dd>Нет</dd></div><div><dt>Подтверждение операций</dt><dd>Недоступно</dd></div><div><dt>Backend identity</dt><dd>Не проверена</dd></div></dl><p>Контакт не может восстановить аккаунт, получить ключи или подтвердить перевод.</p></section>;
  if (target.semanticKey === "security-log") return <section className="v3-panel v3-timeline"><h2>Журнал статусов</h2><p>События созданы локальными UI-сценариями, не security backend.</p>{[["Demo открыт", "Сегодня · локально"], ["Privacy mode переключён", "UI-событие"], ["Security status просмотрен", "Без server audit"]].map(([event, time]) => <div key={event}><i/><span><strong>{event}</strong><small>{time}</small></span><em>DEMO</em></div>)}</section>;
  if (target.semanticKey === "security-confirmation") return <section className="v3-panel v3-state-hero warning"><small>CONFIRMATION UI · NO SIGNATURE</small><h2>Подтверждение действия</h2><p>Экран не запрашивает PIN, ключ или biometric credential и не авторизует реальную операцию.</p><button onClick={() => notify("Демо-действие подтверждено только в UI")}>Подтвердить локальный сценарий</button></section>;
  return <section className="v3-panel v3-key-values"><small>DEMO ACCESS SETTINGS</small><h2>PIN и доступ</h2><dl><div><dt>Demo PIN</dt><dd>Только UI-сессия</dd></div><div><dt>Biometrics</dt><dd>Не запрашиваются</dd></div><div><dt>Secure storage</dt><dd>Не подключён</dd></div></dl><button onClick={() => notify(`${target.chudoName}: проверено локально`)}>Проверить demo-статус</button></section>;
}

function DocumentSemantic({ target }: { target: ScreenTarget }) {
  if (target.semanticKey === "documents-empty") return <section className="v3-panel v3-empty-state" data-empty-state="documents"><span>□</span><small>DOCUMENT CENTER · ПУСТО</small><h2>Документов пока нет</h2><p>Это целевой empty state. Production-документы не генерируются и не загружаются.</p></section>;
  if (target.semanticKey === "documents-statements") return <section className="v3-panel v3-data-list"><header><div><small>LOCAL EXAMPLES · NOT BANK STATEMENTS</small><h2>Выписки</h2></div><em>1 пример</em></header><div className="v3-static-row"><b>PDF</b><span><strong>Август · demo</strong><small>Фиксированная структура · download отсутствует</small></span><em>Не подписана</em></div></section>;
  if (target.semanticKey === "documents-statement-august") return <article className="v3-panel v3-document-page"><header><span className="v3-danger-label">DEMO STATEMENT · NOT AN ACCOUNT RECORD</span><h2>Demo-выписка · август</h2><p>Локальный образец без номера счёта, подписи или банковского статуса.</p></header><section><h3>Период</h3><p>1–31 августа · демонстрационный диапазон.</p><h3>Итог</h3><p>Реальные начальный баланс, обороты и конечный баланс отсутствуют.</p><h3>Получение файла</h3><p>Генерация и скачивание PDF не подключены.</p></section></article>;
  if (target.semanticKey === "notifications-demo-notice") return <article className="v3-panel v3-document-page"><header><span className="v3-danger-label">LOCAL NOTIFICATION</span><h2>Публичное demo без backend</h2><p>Создано фикстурой интерфейса · не получено с сервера.</p></header><section><h3>Сообщение</h3><p>Рыночные данные, операции, звонки, защита и документы являются симуляцией.</p><h3>Действие</h3><p>Не отправляйте средства и не вводите production credentials.</p></section></article>;
  const legal = ["documents-terms", "documents-privacy", "documents-security", "documents-legal"].includes(target.semanticKey);
  const sections: Record<string, readonly [string, string, string, string]> = {
    "documents-privacy": ["Какие данные показаны", "Имя, суммы, устройства и события взяты из локальных demo-фикстур.", "Что не собирается", "Прототип не запрашивает seed phrase, ключи, контакты, камеру или микрофон."],
    "documents-terms": ["Назначение", "Интерфейс предназначен только для публичной демонстрации.", "Ограничения", "Это не предложение финансовой, платёжной или mining-услуги."],
    "documents-security": ["Модель безопасности", "Production security в этой сборке не реализована.", "Граница", "Нет key generation, secure storage, attestation или backend authority."],
    "documents-legal": ["Юридический статус", "Текст является UI-черновиком.", "Требование", "Перед публикацией нужен утверждённый владельцем юридический документ."],
    "documents-demo-overview": ["О CHUDO demo", "Локальная карта будущего продукта без реальных сервисов.", "Доступность", "Материал встроен в интерфейс и не скачивается."],
  };
  const copy = sections[target.semanticKey] ?? ["О материале", "Локальный демонстрационный текст.", "Production boundary", "Генерация, подпись и доставка не подключены."];
  return <article className="v3-panel v3-document-page"><header>{legal && <span className="v3-danger-label">DEMO DRAFT · NOT A FINAL LEGAL DOCUMENT</span>}<h2>{target.chudoName}</h2><p>{target.referenceName}</p></header><section><h3>{copy[0]}</h3><p>{copy[1]}</p><h3>{copy[2]}</h3><p>{copy[3]}</p><h3>Статус публикации</h3><p>{legal ? "Требует отдельной юридической проверки и решения владельца." : "Фиксированный локальный материал без server source."}</p></section></article>;
}

function SettingsSemantic({ target, navigateRoute, exitDemo }: { target: ScreenTarget; navigateRoute: NavigateRoute; exitDemo: () => void }) {
  const [choice, setChoice] = useState(target.route.includes("language") ? "Русский" : target.route.includes("appearance") ? "Системная" : "Включено локально");
  if (target.route === "/settings/exit") return <section className="v3-panel v3-exit-demo"><span>↗</span><h2>Выйти из demo</h2><p>Завершит активный demo-звонок, закроет слои и очистит временные суммы отправки/обмена.</p><button className="v3-primary" onClick={exitDemo}>Сбросить demo и выйти</button><button className="v3-secondary" onClick={() => navigateRoute("/settings")}>Отмена</button></section>;
  if (target.semanticKey === "support-faq") return <section className="v3-panel v3-faq"><small>LOCAL HELP</small><h2>Помощь и FAQ</h2><details open><summary>Можно ли отправить реальные средства?</summary><p>Нет. Все суммы, адреса, заявки и квитанции симулированы.</p></details><details><summary>Работают ли звонки и сообщения?</summary><p>Нет. Media и messaging backend не подключены.</p></details><details><summary>Где хранятся ключи?</summary><p>Ключи не создаются и не хранятся.</p></details></section>;
  if (target.semanticKey === "support") return <section className="v3-panel v3-state-hero"><small>SUPPORT CHANNEL · NOT CONNECTED</small><h2>Поддержка</h2><p>Форма, email, чат оператора и ticket backend отсутствуют. Для публичного demo доступен только этот локальный справочный экран.</p><button disabled aria-disabled="true">Обращения пока недоступны</button></section>;
  if (target.semanticKey === "settings-version") return <section className="v3-panel v3-key-values"><small>PUBLIC DEMO BUILD</small><h2>Версия приложения</h2><dl><div><dt>Продукт</dt><dd>CHUDO Public Demo V3</dd></div><div><dt>Режим</dt><dd>SIMULATED</dd></div><div><dt>Backend</dt><dd>Не подключён</dd></div><div><dt>Release channel</dt><dd>Coordinator review</dd></div></dl></section>;
  if (target.semanticKey === "settings-limits") return <section className="v3-panel v3-key-values"><small>DEMO LIMITS · NOT PRODUCT TERMS</small><h2>Лимиты</h2><dl><div><dt>Переводы</dt><dd>Реальные операции: 0</dd></div><div><dt>Swap / trade</dt><dd>Только simulated quote</dd></div><div><dt>Calls</dt><dd>Только UI-состояния</dd></div></dl></section>;
  if (target.semanticKey === "profile") return <section className="v3-panel v3-state-hero"><small>LOCAL DEMO PROFILE</small><h2>{demoData.profile.name}</h2><p>Имя и инициалы являются фиксированными фикстурами. Аккаунт, identity backend и синхронизация отсутствуют.</p><button onClick={() => navigateRoute("/settings")}>Открыть настройки</button></section>;
  if (target.semanticKey === "settings-about" || target.semanticKey === "settings-licenses") return <article className="v3-panel v3-document-page"><header><h2>{target.chudoName}</h2><p>{target.semanticKey === "settings-about" ? "CHUDO объединяет интерфейсы связи, кошелька и защиты в публичном продуктном прототипе." : "Список production-лицензий ещё не утверждён владельцем."}</p></header><section><h3>Статус</h3><p>PUBLIC DEMO / SIMULATED. Реальные backend services не подключены.</p><h3>{target.semanticKey === "settings-about" ? "Версия" : "Публикация"}</h3><p>{target.semanticKey === "settings-about" ? "V3 · coordinator review." : "Нужна отдельная проверка зависимостей и утверждение лицензий перед production."}</p></section></article>;
  const selectable = target.semanticKey === "settings-language" || target.semanticKey === "settings-appearance" || target.semanticKey === "settings-notifications";
  if (!selectable) return <section className="v3-panel v3-state-hero"><small>LOCAL PREFERENCE</small><h2>{target.chudoName}</h2><p>{target.referenceName}. Изменения не синхронизируются с аккаунтом.</p></section>;
  const options = target.semanticKey === "settings-language" ? ["Русский", "English · demo", "Deutsch · demo"] : target.semanticKey === "settings-appearance" ? ["Светлая", "Тёмная · preview", "Системная"] : ["Включено локально", "Выключено", "Не сохранять"];
  return <section className="v3-panel v3-settings-detail"><div><span>⚙</span><div><h2>{target.chudoName}</h2><p>{target.referenceName}</p></div></div><fieldset><legend>Локальный выбор</legend>{options.map(option => <label key={option}><input type="radio" name={`setting-${target.screenId}`} checked={choice === option} onChange={() => setChoice(option)}/><span><strong>{option}</strong><small>Действует только в текущем demo UI</small></span></label>)}</fieldset><p>Настройка не синхронизируется с аккаунтом и не заявляет persistence.</p></section>;
}

function ChatSemantic({ target, hidden, navigateRoute }: { target: ScreenTarget; hidden: boolean; navigateRoute: NavigateRoute }) {
  let body;
  if (target.semanticKey === "chats-yuri-attachments") body = <div className="v3-attachment-sheet" data-chat-state="attachment-sheet"><small>ДОБАВИТЬ ВЛОЖЕНИЕ · LOCAL DEMO</small><h3>Выберите действие</h3><button onClick={() => navigateRoute("/chats/yuri/attachment-preview")}><b>▧</b><span><strong>Фото</strong><small>Фиксированный preview без галереи</small></span></button><button onClick={() => navigateRoute("/chats/yuri/attachment-preview")}><b>DOC</b><span><strong>Файл</strong><small>Локальный пример · загрузка отсутствует</small></span></button><button onClick={() => navigateRoute("/chats/yuri/payment")}><b>₡</b><span><strong>Demo payment</strong><small>Без транзакции и settlement</small></span></button><button className="v3-secondary" onClick={() => navigateRoute("/chats/yuri")}>Закрыть и вернуться</button></div>;
  else if (target.semanticKey === "chats-yuri-attachment-preview") body = <div className="v3-attachment-preview" data-chat-state="attachment-preview"><span>DOC</span><strong>CHUDO-demo-overview.pdf</strong><small>Локальный preview · 248 KB · не загружен</small><div className="v3-file-preview"><b>PUBLIC DEMO</b><p>Предпросмотр демонстрационного файла. Реальный файл не читается и не передаётся.</p></div><button onClick={() => navigateRoute("/chats/yuri/attachments")}>Изменить вложение</button><button className="v3-secondary" onClick={() => navigateRoute("/chats/yuri")}>Убрать и вернуться</button></div>;
  else if (target.semanticKey === "chats-yuri-payment") body = <div className="v3-payment-card" data-chat-state="payment"><small>ПЛАТЁЖНОЕ СООБЩЕНИЕ · DEMO</small><strong data-private-amount>{protectUserAmount(hidden, "128,00 CHUDO")}</strong><p>Без транзакции, подписи и settlement.</p><button onClick={() => navigateRoute("/wallet/send/review")}>Открыть demo-review</button></div>;
  else body = <div className="v3-chat-bubbles" data-chat-state="conversation"><p>Проверим видимость звонков?</p><p>Да — аудио и видео теперь в шапке.</p></div>;
  return <div className="v3-semantic-layout chat"><section className="v3-panel v3-chat-state"><header><b>ЮВ</b><span><h2>{target.chudoName}</h2><p>Юрий Волков · demo conversation</p></span><div><button aria-label="Аудиозвонок" onClick={() => navigateRoute("/calls/audio")}>☎</button><button aria-label="Видеозвонок" onClick={() => navigateRoute("/calls/video")}>▣</button></div></header>{body}<footer><button aria-label="Добавить вложение" onClick={() => navigateRoute("/chats/yuri/attachments")}>+</button><input aria-label="Сообщение" placeholder="Сообщение"/><button>Отправить</button></footer></section></div>;
}

function MarketSemantic({ target, hidden, navigateRoute }: { target: ScreenTarget; hidden: boolean; navigateRoute: NavigateRoute }) {
  const pair = demoData.marketPairs[0];
  const [query, setQuery] = useState("CHUDO");
  const [filter, setFilter] = useState<"all" | "eur" | "crypto">("eur");
  const [period, setPeriod] = useState<"1Ч" | "1Д" | "1Н" | "1М">("1Д");
  const [tradeAmount, setTradeAmount] = useState("250.00");
  const price = (value: string) => `${formatMinorUnits(value, pair.quoteDecimals)} ${pair.quote}`;
  const amount = (value: string) => `${formatMinorUnits(value)} CHUDO`;
  const filteredPairs = demoData.marketPairs.filter(item => {
    const matchesQuery = `${item.base}/${item.quote}`.toLocaleLowerCase("ru").includes(query.trim().toLocaleLowerCase("ru"));
    const matchesFilter = target.semanticKey === "market-search" || filter === "all" || (filter === "eur" ? item.quote === "EUR" : item.quote !== "EUR");
    return matchesQuery && matchesFilter;
  });
  const chartBars: Record<typeof period, readonly number[]> = { "1Ч": [32, 44, 39, 57, 52, 66, 62], "1Д": [24, 41, 35, 58, 49, 72, 81], "1Н": [20, 28, 45, 38, 61, 75, 69], "1М": [16, 25, 34, 48, 43, 66, 88] };
  const tradeAmountMinor = parseMinorUnits(tradeAmount, 8);
  const tradeError = tradeAmountMinor === null ? "Введите число с точностью не более 8 знаков." : tradeAmountMinor <= 0n ? "Количество должно быть больше нуля." : "";
  const tradeTotalMinor = tradeAmountMinor === null ? null : tradeAmountMinor * BigInt(pair.priceMinor) / 100000000n;
  if (target.semanticKey === "market-chudo-eur-order-book") return <section className="v3-panel v3-order-book-semantic"><header><div><small>CHUDO / EUR · PAIR-SPECIFIC FIXTURE</small><h2>Книга заявок</h2></div><em>SIMULATED</em></header><div className="v3-book-head"><span>Цена · EUR</span><span>Количество · CHUDO</span><span>Глубина</span></div><div className="v3-book-side asks">{pair.detail.orderBook.asks.map(level => <div key={`ask-${level.priceMinor}`}><strong>{price(level.priceMinor)}</strong><span>{amount(level.amountMinor)}</span><i style={{ width: `${level.depth}%` }}/></div>)}</div><div className="v3-book-mid"><small>Simulated mid</small><strong>{price(pair.priceMinor)}</strong></div><div className="v3-book-side bids">{pair.detail.orderBook.bids.map(level => <div key={`bid-${level.priceMinor}`}><strong>{price(level.priceMinor)}</strong><span>{amount(level.amountMinor)}</span><i style={{ width: `${level.depth}%` }}/></div>)}</div><p>Заявки не находятся в matching engine и не могут быть исполнены.</p></section>;
  if (target.semanticKey === "market-chudo-eur-trades") return <section className="v3-panel v3-data-list"><header><div><small>CHUDO / EUR · FIXED TRADES</small><h2>Последние сделки</h2></div><em>SIMULATED</em></header>{pair.detail.recentTrades.map((trade, index) => <div className="v3-static-row" key={`${trade.time}-${index}`}><b>{trade.side === "buy" ? "↑" : "↓"}</b><span><strong>{price(trade.priceMinor)}</strong><small>{trade.time} · {trade.side === "buy" ? "покупка" : "продажа"}</small></span><em>{amount(trade.amountMinor)}</em></div>)}</section>;
  if (target.semanticKey === "market-search") return <section className="v3-panel v3-data-list v3-market-discovery" data-market-state="search"><header><div><small>ПОИСК · LOCAL MARKET DISCOVERY</small><h2>Найти торговую пару</h2></div><em>{filteredPairs.length} найдено</em></header><label className="v3-primary-search"><span>Поиск по паре</span><input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="Например, CHUDO/BTC"/></label>{filteredPairs.map(item => <button key={item.id} onClick={() => navigateRoute(`/market/${item.id}`)}><b>{item.quote}</b><span><strong>{item.base} / {item.quote}</strong><small>{item.volume}</small></span><em>{formatMinorUnits(item.priceMinor, item.quoteDecimals, item.quote === "BTC")}</em></button>)}{filteredPairs.length === 0 && <p role="status">По вашему запросу локальных demo-пар нет.</p>}</section>;
  if (target.semanticKey === "market-filters") {
    const filtered = demoData.marketPairs.filter(item => filter === "all" || (filter === "eur" ? item.quote === "EUR" : item.quote !== "EUR"));
    return <section className="v3-panel v3-data-list v3-market-discovery" data-market-state="filters"><header><div><small>ФИЛЬТРЫ · LOCAL MARKET DISCOVERY</small><h2>Фильтры рынка</h2></div><em>{filtered.length} пары</em></header><div className="v3-primary-filters" role="group" aria-label="Фильтр demo-пар">{([['all', 'Все'], ['eur', 'EUR'], ['crypto', 'Крипто']] as const).map(([id, label]) => <button key={id} aria-pressed={filter === id} className={filter === id ? "active" : ""} onClick={() => setFilter(id)}>{label}</button>)}</div>{filtered.map(item => <button key={item.id} onClick={() => navigateRoute(`/market/${item.id}`)}><b>{item.quote}</b><span><strong>{item.base} / {item.quote}</strong><small>{item.volume}</small></span><em>{formatMinorUnits(item.priceMinor, item.quoteDecimals, item.quote === "BTC")}</em></button>)}</section>;
  }
  if (target.semanticKey === "market-chudo-eur-detail") return <section className="v3-panel v3-key-values" data-market-state="pair-detail"><small>CHUDO / EUR · PAIR DETAIL</small><h2>{price(pair.priceMinor)}</h2><dl><div><dt>Изменение 24ч</dt><dd>{pair.change}</dd></div><div><dt>Максимум</dt><dd>{price(pair.highMinor)}</dd></div><div><dt>Минимум</dt><dd>{price(pair.lowMinor)}</dd></div><div><dt>Demo-объём</dt><dd>{pair.volume}</dd></div><div><dt>Quote precision</dt><dd>{pair.quoteDecimals} знака</dd></div></dl><div className="v3-inline-actions"><button onClick={() => navigateRoute("/market/chudo-eur/chart")}>Открыть график</button><button onClick={() => navigateRoute("/market/chudo-eur/order-book")}>Книга заявок</button></div><p>Все значения относятся только к pair-specific локальной фикстуре.</p></section>;
  if (target.semanticKey === "market-chudo-eur-chart" || target.semanticKey === "market-chudo-eur-periods") return <section className={`v3-panel v3-performance-card ${target.semanticKey.endsWith("periods") ? "periods-primary" : ""}`} data-market-state={target.semanticKey.endsWith("periods") ? "periods" : "chart"}><span>CHUDO / EUR · {target.semanticKey.endsWith("periods") ? `ВЫБРАН ПЕРИОД ${period}` : `SIMULATED CHART · ${period}`}</span><strong>{price(pair.priceMinor)}</strong><em>{pair.change}</em><div>{chartBars[period].map((height, index) => <i style={{ height: `${height}%` }} key={index}/>)}</div><nav aria-label="Период графика">{(["1Ч", "1Д", "1Н", "1М"] as const).map(item => <button key={item} className={period === item ? "active" : ""} aria-pressed={period === item} onClick={() => setPeriod(item)}>{item}</button>)}</nav><p>{target.semanticKey.endsWith("periods") ? "Выбор периода меняет локальные столбцы и подпись — это первичное действие экрана." : "График построен из локальных path fixtures, не market feed."}</p></section>;
  if (target.semanticKey === "market-orders") return <section className="v3-panel v3-data-list"><header><div><small>OPEN ORDER · SIMULATED</small><h2>Открытые заявки</h2></div><em>1 demo</em></header>{pair.detail.openOrders.map(order => <button key={order.id} onClick={() => navigateRoute("/market/order/demo-eur-01")}><b>{order.side}</b><span><strong data-private-amount>{protectUserAmount(hidden, amount(order.amountMinor))}</strong><small>{price(order.priceMinor)} · CHUDO / EUR</small></span><em data-private-amount>{protectUserAmount(hidden, `${formatMinorUnits(order.totalMinor)} EUR`)}</em></button>)}</section>;
  if (target.semanticKey === "market-order-demo-eur-01" || target.semanticKey === "market-order-demo-eur-01-cancel") return <section className="v3-panel v3-key-values" data-market-state={target.semanticKey.endsWith("cancel") ? "order-cancel" : "order-detail"}><small>DEMO ORDER · CHUDO / EUR</small><h2>{target.semanticKey.endsWith("cancel") ? "Отмена заявки" : "Заявка demo-eur-01"}</h2><dl><div><dt>Side</dt><dd>SELL</dd></div><div><dt>Количество</dt><dd data-private-amount>{protectUserAmount(hidden, "250,00 CHUDO")}</dd></div><div><dt>Лимит</dt><dd>1,18 EUR</dd></div><div><dt>Статус</dt><dd>{target.semanticKey.endsWith("cancel") ? "Готова к локальной отмене" : "Открыта только в UI"}</dd></div></dl>{target.semanticKey.endsWith("cancel") ? <button className="v3-primary" onClick={() => navigateRoute("/market/orders")}>Отменить только в demo</button> : <button className="v3-secondary" onClick={() => navigateRoute("/market/order/demo-eur-01/cancel")}>Открыть отмену</button>}</section>;
  if (target.semanticKey === "market-history") return <section className="v3-panel v3-data-list" data-market-state="history"><header><div><small>LOCAL HISTORY · NO EXECUTION PROOF</small><h2>История demo-сделок</h2></div><em>1 demo</em></header><button onClick={() => navigateRoute("/market/history/demo-trade-01")}><b>SELL</b><span><strong data-private-amount>{protectUserAmount(hidden, "250,00 CHUDO · 1,18 EUR")}</strong><small>16 августа · fixture</small></span><em>Не исполнено</em></button></section>;
  if (target.semanticKey === "market-history-demo-trade-01") return <section className="v3-panel v3-key-values" data-market-state="history-detail"><small>DEMO-TRADE-01 · SINGLE RECORD</small><h2>Детали demo-сделки</h2><dl><div><dt>Пара</dt><dd>CHUDO / EUR</dd></div><div><dt>Side</dt><dd>SELL</dd></div><div><dt>Количество</dt><dd data-private-amount>{protectUserAmount(hidden, "250,00 CHUDO")}</dd></div><div><dt>Цена</dt><dd>1,18 EUR</dd></div><div><dt>Итог</dt><dd data-private-amount>{protectUserAmount(hidden, "295,00 EUR")}</dd></div><div><dt>Статус</dt><dd>Не исполнено · fixture</dd></div></dl><p>Matching engine и execution proof отсутствуют.</p></section>;
  if (target.semanticKey === "market-chudo-eur-buy" || target.semanticKey === "market-chudo-eur-sell") {
    const side = target.semanticKey.endsWith("buy") ? "BUY" : "SELL";
    return <section className={`v3-panel v3-trade-form ${side.toLocaleLowerCase()}`} data-market-state={`${side.toLocaleLowerCase()}-form`}><span className="v3-danger-label">SIMULATED · NO SETTLEMENT</span><h2>{side === "BUY" ? "Купить CHUDO" : "Продать CHUDO"}</h2><p>Пара CHUDO / EUR · фиксированная demo-цена {price(pair.priceMinor)}</p><label><span>Количество CHUDO</span><input type={hidden ? "password" : "text"} data-private-amount inputMode="decimal" value={tradeAmount} onChange={event => setTradeAmount(sanitizeDecimalInput(event.target.value, 8))}/></label><dl><div><dt>Side</dt><dd>{side}</dd></div><div><dt>Demo total</dt><dd data-private-amount>{protectUserAmount(hidden, tradeTotalMinor === null ? "—" : `${formatMinorUnits(tradeTotalMinor, 2)} EUR`)}</dd></div><div><dt>Precision</dt><dd>CHUDO=8 · EUR=2</dd></div></dl>{tradeError && <p role="alert" className="v3-form-error">{tradeError}</p>}<button className="v3-primary" disabled={Boolean(tradeError)} onClick={() => navigateRoute("/market/chudo-eur/review")}>Проверить demo-заявку</button></section>;
  }
  if (target.semanticKey === "market-chudo-eur-review") return <section className="v3-panel v3-market-state" data-market-state="review"><span>REVIEW · SIMULATED</span><h2>Проверьте demo-заявку</h2><div className="v3-trade-state"><div><small>Пара</small><strong>CHUDO / EUR</strong></div><div><small>Количество</small><strong data-private-amount>{protectUserAmount(hidden, "250,00 CHUDO")}</strong></div><div><small>Demo total</small><strong data-private-amount>{protectUserAmount(hidden, "295,00 EUR")}</strong></div><div><small>Исполнение</small><strong>Не запрашивалось</strong></div></div><p>Это проверка данных до отдельного UI-подтверждения.</p><button className="v3-primary" onClick={() => navigateRoute("/market/chudo-eur/confirmation")}>Продолжить к подтверждению</button></section>;
  if (target.semanticKey === "market-chudo-eur-confirmation") return <section className="v3-panel v3-market-state" data-market-state="confirmation"><span>CONFIRMATION · NO SIGNATURE</span><h2>Подтвердить только в UI</h2><div className="v3-trade-state"><div><small>Заявка</small><strong data-private-amount>{protectUserAmount(hidden, "250,00 CHUDO")}</strong></div><div><small>Итог</small><strong data-private-amount>{protectUserAmount(hidden, "295,00 EUR")}</strong></div><div><small>Matching engine</small><strong>Не подключён</strong></div><div><small>Settlement</small><strong>Отсутствует</strong></div></div><p>Кнопка не подписывает и не отправляет заявку.</p><button className="v3-primary" onClick={() => navigateRoute("/market/chudo-eur/receipt")}>Подтвердить без отправки</button></section>;
  if (target.semanticKey === "market-chudo-eur-receipt") return <section className="v3-panel v3-simulated-receipt" data-market-state="receipt"><span>✓</span><em>SIMULATED</em><h2>Заявка не исполнена</h2><p>NO MATCHING · NO SETTLEMENT · NO REAL FUNDS</p><dl><div><dt>Пара</dt><dd>CHUDO / EUR</dd></div><div><dt>Количество</dt><dd data-private-amount>{protectUserAmount(hidden, "250,00 CHUDO")}</dd></div><div><dt>Demo total</dt><dd data-private-amount>{protectUserAmount(hidden, "295,00 EUR")}</dd></div><div><dt>Execution proof</dt><dd>Отсутствует</dd></div></dl><button className="v3-primary" onClick={() => navigateRoute("/market")}>Готово</button></section>;
  return <section className="v3-panel v3-market-state"><span>SIMULATED · NO SETTLEMENT</span><h2>{target.chudoName}</h2><p>Экран использует только локальную pair-specific фикстуру. Matching engine, custody и реальное исполнение отсутствуют.</p><button onClick={() => navigateRoute("/market/chudo-eur")}>Открыть пару</button></section>;
}

export const semanticComponentKeys = [
  "HomeSemantic",
  "ChatSemantic",
  "MarketSemantic",
  "PortfolioSemantic",
  "MiningSemantic",
  "SecuritySemantic",
  "DocumentSemantic",
  "SettingsSemantic",
] as const;

export function isSemanticComponentKey(value: string | undefined): boolean {
  return semanticComponentKeys.some(componentKey => componentKey === value);
}

export function SemanticRouteScreen({
  target,
  hidden,
  navigateRoute,
  notify,
  exitDemo,
}: {
  target: ScreenTarget;
  hidden: boolean;
  navigateRoute: NavigateRoute;
  notify: (message: string) => void;
  exitDemo: () => void;
}) {
  const content = useMemo(() => ({ title: target.chudoName, subtitle: target.referenceName }), [target]);
  const renderer = target.componentKey === "HomeSemantic" ? <HomeSemantic target={target} navigateRoute={navigateRoute}/>
    : target.componentKey === "ChatSemantic" ? <ChatSemantic target={target} hidden={hidden} navigateRoute={navigateRoute}/>
      : target.componentKey === "MarketSemantic" ? <MarketSemantic target={target} hidden={hidden} navigateRoute={navigateRoute}/>
        : target.componentKey === "PortfolioSemantic" ? <PortfolioSemantic target={target} hidden={hidden} navigateRoute={navigateRoute}/>
          : target.componentKey === "MiningSemantic" ? <MiningSemantic target={target} hidden={hidden}/>
            : target.componentKey === "SecuritySemantic" ? <SecuritySemantic target={target} notify={notify}/>
              : target.componentKey === "DocumentSemantic" ? <DocumentSemantic target={target}/>
                : target.componentKey === "SettingsSemantic" ? <SettingsSemantic target={target} navigateRoute={navigateRoute} exitDemo={exitDemo}/>
                  : null;
  if (!renderer) throw new Error(`No semantic renderer for ${target.screenId}: ${target.componentKey}`);
  return <div className={`page v3-semantic-page family-${target.familyId}`} data-screen-id={target.screenId} data-component-key={target.componentKey} data-semantic-key={target.semanticKey}><ProductHeading eyebrow={familyEyebrow[target.familyId] ?? "CHUDO PUBLIC DEMO"} title={content.title} note={content.subtitle}/>
    {renderer}
    <SemanticFacts target={target}/>
  </div>;
}

export function InternalScreenMap({ targets }: { targets: readonly ScreenTarget[] }) {
  return <div className="page v3-internal-map"><ProductHeading eyebrow="INTERNAL · ENV-GATED" title="Screen implementation map" note="Visible only when NEXT_PUBLIC_DEMO_MAP=true."/><section className="v3-panel">{targets.map(target => <div key={target.screenId}><code>{target.screenId}</code><strong>{target.chudoName}</strong><span>{target.implementationKind} · {target.componentKey}</span><code>{target.semanticKey} · #{target.route}</code></div>)}</section></div>;
}

export const walletRuntimeRoutes = [
  "/wallet/add-asset",
  ...demoWalletAssets.flatMap(asset => [
    `/wallet/${asset.slug}`,
    `/wallet/${asset.slug}/receive`,
    `/wallet/${asset.slug}/send`,
    `/wallet/${asset.slug}/send/review`,
    `/wallet/${asset.slug}/send/confirmation`,
    `/wallet/${asset.slug}/send/receipt`,
  ]),
] as const;

export { demoWalletAssetOrder };
