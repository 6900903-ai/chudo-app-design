"use client";

/* eslint-disable @next/next/no-img-element -- shared static asset URLs must also work in the standalone GitHub Pages Vite build */

import { useEffect, useRef, useState } from "react";
import { createCallStateMachine, demoData, type CallState, type ChartPeriod, type Chat, type MarketPair } from "./demo-data";
import { fallbackRouteForUnknown, isKnownScreenRoute, normalizeHash, rootRouteByView, routeToView, toHashRoute } from "./hash-routing";
import { DEMO_DECIMAL_SCALES, formatMinorUnits, multiplyMinorUnits, parseMinorUnits, PRODUCTION_DECIMAL_SCALE_NOTE, sanitizeDecimalInput } from "./money";
import { getFamilyTargets, getScreenTarget, screenCatalog } from "./screen-catalog";
import { centralChudoActions, clipboardNotice, filterDemoChats, getContainedFocusIndex, mobileNavigationContract, protectUserAmount, replaceOwnedTimeout, secondaryMobileDestinations, type CentralAction, type ChatFilter, type DemoView } from "./ui-contracts";
import type { AssetId } from "./demo-wallet-data";
import { InternalScreenMap, ProductHomeScreen, ProductWalletScreen, SemanticRouteScreen, SwapScreen, WalletRouteScreen, isSemanticComponentKey } from "./product-screens";

type View = DemoView;
type Overlay = null | "actions" | "send" | "receive" | "scan" | "more" | "miner";
type CallKind = "audio" | "video";
type TradeSide = "buy" | "sell";
type MarketFilter = "all" | "eur" | "crypto";
type ActiveCall = { kind: CallKind; contact: string; initialState?: CallState | "incoming"; initiallyMinimized?: boolean; screenId?: string; componentKey?: string; semanticKey?: string };

const PUBLIC_DEBUG_UI = process.env.NEXT_PUBLIC_DEMO_MAP === "true";

const DEMO_ADDRESS = "demo_chudo_address_not_for_funds";
const chartPeriods: ReadonlyArray<{ id: ChartPeriod; label: string }> = [
  { id: "1h", label: "1Ч" },
  { id: "1d", label: "1Д" },
  { id: "1w", label: "1Н" },
  { id: "1m", label: "1М" },
];

const navItems: Array<{ id: View; label: string; icon: string; mobile: boolean }> = [
  { id: "home", label: "Главная", icon: "home", mobile: true },
  { id: "chats", label: "Чаты", icon: "chat", mobile: true },
  { id: "calls", label: "Звонки", icon: "phone", mobile: true },
  { id: "wallet", label: "Кошелёк", icon: "wallet", mobile: true },
  { id: "market", label: "Рынок", icon: "market", mobile: true },
  { id: "portfolio", label: "Портфель", icon: "trend", mobile: false },
  { id: "mining", label: "Майнинг", icon: "miner", mobile: false },
  { id: "security", label: "Защита", icon: "shield", mobile: false },
  { id: "documents", label: "Документы", icon: "document", mobile: false },
  { id: "settings", label: "Настройки / Помощь", icon: "settings", mobile: false },
];

const callStateCopy: Record<CallState, string> = {
  calling: "Вызываем контакт",
  ringing: "Идёт вызов",
  connecting: "Соединяем",
  connected: "Демо-соединение",
  reconnecting: "Восстанавливаем связь",
  ended: "Звонок завершён",
  failed: "Соединение не удалось",
};

function assetPath(name: string) {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/${name}`;
}

function formatPairPrice(pair: MarketPair, value = pair.priceMinor) {
  return formatMinorUnits(value, pair.quoteDecimals, pair.quote === "BTC");
}

const FOCUSABLE_SELECTOR = "button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex='-1'])";

function containTabFocus(event: KeyboardEvent, container: HTMLElement | null) {
  if (event.key !== "Tab" || !container) return;
  const focusable = [...container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter(element => !element.hasAttribute("inert") && element.getAttribute("aria-hidden") !== "true");
  const currentIndex = focusable.indexOf(document.activeElement as HTMLElement);
  const nextIndex = getContainedFocusIndex(currentIndex, focusable.length, event.shiftKey);
  if (nextIndex === null) return;
  event.preventDefault();
  focusable[nextIndex]?.focus();
}

function ChudoLogo({ square = false, className = "chudo-logo" }: { square?: boolean; className?: string }) {
  return <img className={className} src={assetPath(square ? "chudo-app-icon.webp" : "chudo-logo.webp")} alt="CHUDO" />;
}

function Icon({ name, size = 22 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    home: <><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5M9 20v-6h6v6"/></>,
    wallet: <><path d="M4 6.5h14a2 2 0 0 1 2 2V18H5a2 2 0 0 1-2-2V6.5A2.5 2.5 0 0 1 5.5 4H17"/><path d="M16 11h4v4h-4a2 2 0 0 1 0-4Z"/></>,
    market: <><path d="M4 19V11M10 19V5M16 19v-8M22 19V3"/><path d="M2 19h20"/></>,
    chat: <path d="M20 11.5a8 8 0 0 1-8.5 8 9.5 9.5 0 0 1-4-.9L3 20l1.5-4A8 8 0 1 1 20 11.5Z"/>,
    phone: <path d="M7.2 3.5 4.5 5.2c-.8.5-1.1 1.5-.7 2.4 2.4 6 6.7 10.3 12.7 12.7.9.4 1.9.1 2.4-.7l1.7-2.7-4.6-3-1.7 2.1c-2.7-1.3-5-3.6-6.3-6.3l2.1-1.7-2.9-4.5Z"/>,
    video: <><rect x="3" y="6" width="13" height="12" rx="3"/><path d="m16 10 5-3v10l-5-3"/></>,
    shield: <><path d="M12 3 5 6v5c0 4.6 2.8 8 7 10 4.2-2 7-5.4 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></>,
    miner: <><path d="m6 4 12 12M14 4l3 3-9 9-3-3 9-9Z"/><path d="m4 17 3 3M17 17l3 3"/></>,
    bell: <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>,
    eye: <><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></>,
    send: <><path d="M12 19V5M7 10l5-5 5 5"/><path d="M5 20h14"/></>,
    receive: <><path d="M12 5v14M7 14l5 5 5-5"/><path d="M5 4h14"/></>,
    qr: <><path d="M4 9V5a1 1 0 0 1 1-1h4M15 4h4a1 1 0 0 1 1 1v4M20 15v4a1 1 0 0 1-1 1h-4M9 20H5a1 1 0 0 1-1-1v-4"/><path d="M8 12h8"/></>,
    arrow: <><path d="M5 12h14M14 7l5 5-5 5"/></>,
    back: <><path d="M19 12H5M10 7l-5 5 5 5"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></>,
    copy: <><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></>,
    network: <><circle cx="12" cy="5" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/><path d="m11 7-4 9M13 7l4 9M8 18h8"/></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
    mic: <><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8"/></>,
    speaker: <><path d="M5 10H2v4h3l5 4V6l-5 4Z"/><path d="M14 9a4 4 0 0 1 0 6M17 6a8 8 0 0 1 0 12"/></>,
    flip: <><path d="M20 7v5h-5M4 17v-5h5"/><path d="M6.1 8A7 7 0 0 1 18 6l2 6M17.9 16A7 7 0 0 1 6 18l-2-6"/></>,
    minimize: <path d="M5 12h14"/>,
    more: <><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    trend: <><path d="m3 17 6-6 4 4 8-9"/><path d="M15 6h6v6"/></>,
    worker: <><rect x="4" y="4" width="16" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    document: <><path d="M6 3h8l4 4v14H6Z"/><path d="M14 3v5h5M9 12h6M9 16h6"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M4.8 7.2 3.6 5.5l1.9-1.9 1.7 1.2L9 4.1 9.4 2h2.8l.4 2.1 1.8.7 1.7-1.2L18 5.5l-1.2 1.7.7 1.8 2.1.4v2.8l-2.1.4-.7 1.8 1.2 1.7-1.9 1.9-1.7-1.2-1.8.7-.4 2.1H9.4L9 17.5l-1.8-.7-1.7 1.2-1.9-1.9 1.2-1.7-.7-1.8-2.1-.4V9.4L4.1 9Z"/></>,
    star: <path d="m12 3 2.7 5.5 6 .9-4.4 4.2 1.1 6-5.4-2.8-5.4 2.8 1.1-6-4.4-4.2 6-.9L12 3Z"/>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default function ChudoApp() {
  const [route, setRoute] = useState("/welcome");
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [hiddenBalance, setHiddenBalance] = useState(false);
  const [activeChat, setActiveChat] = useState<Chat>(demoData.chats[0]);
  const [call, setCall] = useState<ActiveCall | null>(null);
  const [callMinimized, setCallMinimized] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<AssetId>("CHUDO_NATIVE");
  const [toast, setToast] = useState("");
  const toastTimerRef = useRef<number | null>(null);
  const routeRef = useRef(route);
  const view = routeToView(route);
  const backgroundBlocked = overlay !== null || (call !== null && !callMinimized);

  function applyRoute(next: string, modal: Overlay = null) {
    const requested = normalizeHash(next);
    const normalized = isKnownScreenRoute(requested, PUBLIC_DEBUG_UI) ? requested : fallbackRouteForUnknown(requested);
    routeRef.current = normalized;
    setRoute(normalized);
    setOverlay(modal);
    if (!/^\/calls\/(audio|video|incoming|outgoing|ringing|connecting|connected|reconnecting|failed|ended|minimized)$/.test(normalized)) {
      setCall(null);
      setCallMinimized(false);
    }
  }
  function navigateRoute(next: string, replace = false) {
    const requested = normalizeHash(next);
    const normalized = isKnownScreenRoute(requested, PUBLIC_DEBUG_UI) ? requested : fallbackRouteForUnknown(requested);
    const currentState = window.history.state as { chudoDemo?: boolean; depth?: number; modal?: Overlay } | null;
    const depth = currentState?.chudoDemo ? currentState.depth ?? 0 : 0;
    const state = { chudoDemo: true, depth: replace ? depth : depth + 1, route: normalized };
    if (currentState?.chudoDemo && currentState.modal) {
      window.history.replaceState({ ...state, depth }, "", toHashRoute(normalized));
      applyRoute(normalized);
      return;
    }
    if (replace) window.history.replaceState(state, "", toHashRoute(normalized));
    else window.history.pushState(state, "", toHashRoute(normalized));
    applyRoute(normalized);
  }
  function backTo(fallback: string) {
    const state = window.history.state as { chudoDemo?: boolean; depth?: number } | null;
    if (state?.chudoDemo && (state.depth ?? 0) > 0) window.history.back();
    else navigateRoute(fallback, true);
  }
  function navigate(next: View) { navigateRoute(rootRouteByView[next]); }
  function openOverlay(next: Exclude<Overlay, null>) {
    const currentState = window.history.state as { chudoDemo?: boolean; depth?: number; modal?: Overlay } | null;
    if (currentState?.chudoDemo && currentState.modal) {
      window.history.replaceState({ ...currentState, modal: next }, "", toHashRoute(routeRef.current));
      setOverlay(next);
      return;
    }
    const depth = (currentState?.chudoDemo ? currentState.depth ?? 0 : 0) + 1;
    window.history.pushState({ chudoDemo: true, depth, route: routeRef.current, modal: next }, "", toHashRoute(routeRef.current));
    setOverlay(next);
  }
  function closeOverlay() {
    const state = window.history.state as { chudoDemo?: boolean; modal?: Overlay } | null;
    if (state?.chudoDemo && state.modal) window.history.back();
    else setOverlay(null);
  }
  function notify(message: string) {
    setToast(message);
    toastTimerRef.current = replaceOwnedTimeout(toastTimerRef.current, id => window.clearTimeout(id), (callback, delay) => window.setTimeout(callback, delay), () => {
      setToast("");
      toastTimerRef.current = null;
    }, 2600);
  }
  function startCall(kind: CallKind, contact: string) {
    const callTarget = getScreenTarget(`/calls/${kind}`);
    navigateRoute(`/calls/${kind}`);
    setCallMinimized(false);
    setCall({ kind, contact, screenId: callTarget?.screenId, componentKey: callTarget?.componentKey, semanticKey: callTarget?.semanticKey });
  }
  function exitDemo() {
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = null;
    setToast("");
    setOverlay(null);
    setCall(null);
    setCallMinimized(false);
    setHiddenBalance(false);
    setSelectedAssetId("CHUDO_NATIVE");
    setActiveChat(demoData.chats[0]);
    navigateRoute("/welcome", true);
  }
  useEffect(() => {
    const syncRoute = () => {
      const requested = normalizeHash(window.location.hash);
      const next = isKnownScreenRoute(requested, PUBLIC_DEBUG_UI) ? requested : fallbackRouteForUnknown(requested);
      const state = window.history.state as { chudoDemo?: boolean; modal?: Overlay } | null;
      if (!state?.chudoDemo || requested !== next) window.history.replaceState({ chudoDemo: true, depth: 0, route: next }, "", toHashRoute(next));
      applyRoute(next, state?.modal ?? null);
      const callRoute = next.match(/^\/calls\/(audio|video|incoming|outgoing|ringing|connecting|connected|reconnecting|failed|ended|minimized)$/)?.[1];
      if (callRoute) {
        const initialState: ActiveCall["initialState"] = callRoute === "incoming" ? "incoming" : callRoute === "audio" || callRoute === "video" || callRoute === "outgoing" ? "calling" : callRoute === "minimized" ? "connected" : callRoute as CallState;
        const callTarget = getScreenTarget(next);
        setCall({ kind: callRoute === "audio" ? "audio" : "video", contact: "Юрий Волков", initialState, initiallyMinimized: callRoute === "minimized", screenId: callTarget?.screenId, componentKey: callTarget?.componentKey, semanticKey: callTarget?.semanticKey });
      }
    };
    syncRoute();
    window.addEventListener("popstate", syncRoute);
    window.addEventListener("hashchange", syncRoute);
    return () => { window.removeEventListener("popstate", syncRoute); window.removeEventListener("hashchange", syncRoute); };
  }, []);
  useEffect(() => () => { if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current); }, []);

  if (view === "welcome") {
    const onboardingTarget = getScreenTarget(route);
    return <div className="route-render-root" data-screen-id={onboardingTarget?.screenId} data-component-key={onboardingTarget?.componentKey} data-semantic-key={onboardingTarget?.semanticKey}><OnboardingScreen route={route} navigateRoute={navigateRoute} backTo={backTo} /></div>;
  }

  const target = getScreenTarget(route);
  const componentKey = target?.componentKey;
  const walletRuntimeRoute = route === "/wallet/add-asset" || /^\/wallet\/(?:chudo|btc|eth|usdt-ethereum|sol)(?:\/.*)?$/.test(route);
  const renderSemanticTarget = target && isSemanticComponentKey(componentKey);

  return (
    <main className="app-stage">
      <section className="app-frame" aria-label="Интерактивный прототип приложения CHUDO">
        <Sidebar view={view} navigate={navigate} openActions={() => openOverlay("actions")} blocked={backgroundBlocked} />
        <div className="app-main" inert={backgroundBlocked} aria-hidden={backgroundBlocked || undefined}>
          <Topbar view={view} openMore={() => openOverlay("more")} openNotifications={() => navigateRoute("/notifications")} />
          <div className="view-scroll" id="main-content">
            {route === "/internal/screen-map" && PUBLIC_DEBUG_UI ? <InternalScreenMap targets={screenCatalog}/> : <div className="route-render-root" data-screen-id={target?.screenId} data-component-key={target?.componentKey} data-semantic-key={target?.semanticKey}>
              {renderSemanticTarget && <SemanticRouteScreen target={target} hidden={hiddenBalance} navigateRoute={navigateRoute} notify={notify} exitDemo={exitDemo}/>}
              {componentKey === "ProductHomeScreen" && <ProductHomeScreen selectedAssetId={selectedAssetId} hidden={hiddenBalance} setHidden={setHiddenBalance} onSelectAsset={setSelectedAssetId} navigateRoute={navigateRoute} startCall={startCall}/>}
              {componentKey === "NotificationCenter" && <NotificationCenter navigateRoute={navigateRoute} />}
              {componentKey === "ProductWalletScreen" && <ProductWalletScreen selectedAssetId={selectedAssetId} hidden={hiddenBalance} setHidden={setHiddenBalance} onSelectAsset={setSelectedAssetId} navigateRoute={navigateRoute}/>}
              {(walletRuntimeRoute || componentKey === "WalletRouteScreen") && <WalletRouteScreen target={target} route={route} selectedAssetId={selectedAssetId} hidden={hiddenBalance} navigateRoute={navigateRoute} notify={notify}/>}
              {componentKey === "SwapScreen" && <SwapScreen hidden={hiddenBalance} navigateRoute={navigateRoute}/>}
              {componentKey === "MarketScreen" && <MarketScreen route={route} navigateRoute={navigateRoute} backTo={backTo} hidden={hiddenBalance} notify={notify} />}
              {componentKey === "ChatsScreen" && <ChatsScreen route={route} navigateRoute={navigateRoute} hidden={hiddenBalance} activeChat={activeChat} setActiveChat={setActiveChat} openSend={() => openOverlay("send")} startCall={startCall} notify={notify} />}
              {componentKey === "CallsScreen" && <CallsScreen startCall={startCall} navigate={navigate} />}
              {componentKey === "MiningScreen" && <MiningScreen hidden={hiddenBalance} openMiner={() => openOverlay("miner")} />}
              {componentKey === "SecurityScreen" && <SecurityScreen hidden={hiddenBalance} setHidden={setHiddenBalance} notify={notify} />}
              {componentKey === "DocumentsScreen" && <DocumentsScreen navigateRoute={navigateRoute} />}
              {componentKey === "SettingsScreen" && <SettingsScreen navigateRoute={navigateRoute} exitDemo={exitDemo} />}
            </div>}
          </div>
          <MobileNav view={view} navigate={navigate} openActions={() => openOverlay("actions")} />
        </div>
        {overlay === "actions" && <ChudoActionSheet close={closeOverlay} navigate={navigate} openOverlay={openOverlay} />}
        {overlay === "send" && <SendFlow hidden={hiddenBalance} close={closeOverlay} />}
        {overlay === "receive" && <ReceiveSheet close={closeOverlay} notify={notify} />}
        {overlay === "scan" && <ScanSheet close={closeOverlay} notify={notify} />}
        {overlay === "more" && <MoreSheet close={closeOverlay} navigate={navigate} />}
        {overlay === "miner" && <MinerSheet close={closeOverlay} />}
        {call && <CallOverlay key={`${call.screenId ?? "interactive"}-${call.initialState ?? "auto"}`} call={call} close={() => backTo("/calls")} onMinimizedChange={setCallMinimized} />}
        {toast && <div className="toast" role="status"><Icon name="check" size={17}/>{toast}</div>}
      </section>
    </main>
  );
}

function Sidebar({ view, navigate, openActions, blocked }: { view: View; navigate: (view: View) => void; openActions: () => void; blocked: boolean }) {
  return <aside className="sidebar" inert={blocked} aria-hidden={blocked || undefined}>
    <div className="sidebar-brand"><span><ChudoLogo square /></span><div><strong>CHUDO</strong><small>PUBLIC DEMO</small></div></div>
    <nav className="sidebar-nav" aria-label="Основная навигация">{navItems.map(item => <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => navigate(item.id)} aria-label={item.label} aria-current={view === item.id ? "page" : undefined}><Icon name={item.icon}/><span>{item.label}</span>{item.id === "mining" && <em>DEMO</em>}</button>)}</nav>
    <button className="sidebar-action" onClick={openActions} aria-label="Действия CHUDO"><Icon name="plus" size={19}/><span>Действия CHUDO</span></button>
    <div className="sidebar-status"><span className="status-dot"/><div><strong>Демо-среда</strong><small>Backend не подключён</small></div></div>
  </aside>;
}

function Topbar({ view, openMore, openNotifications }: { view: View; openMore: () => void; openNotifications: () => void }) {
  const title = navItems.find(item => item.id === view)?.label ?? "CHUDO";
  return <header className="topbar"><div className="mobile-brand"><ChudoLogo square/><strong>CHUDO</strong></div><div className="desktop-page-title"><small>CHUDO · PUBLIC PROTOTYPE</small><strong>{title}</strong></div><div className="topbar-actions"><span className="global-demo-badge"><i/> ДЕМО · BACKEND NOT CONNECTED</span><button className="top-icon" onClick={openNotifications} aria-label="Уведомления"><Icon name="bell"/></button><button className="profile-button" onClick={openMore} aria-label="Профиль и дополнительные разделы"><span>{demoData.profile.initials}</span><div><strong>{demoData.profile.shortName}</strong><small>Демо-профиль</small></div><Icon name="more" size={18}/></button></div></header>;
}

function MobileNav({ view, navigate, openActions }: { view: View; navigate: (view: View) => void; openActions: () => void }) {
  return <nav className="mobile-nav" aria-label="Мобильная навигация">{mobileNavigationContract.map(item => item.view === null ? <button key={item.id} className="chudo-nav-action" onClick={openActions} aria-label="Действия CHUDO"><span><ChudoLogo square/></span><small>{item.label}</small></button> : <button key={item.id} className={view === item.view ? "active" : ""} onClick={() => navigate(item.view)} aria-current={view === item.view ? "page" : undefined}><Icon name={item.icon} size={21}/><span>{item.label}</span></button>)}</nav>;
}

function OnboardingScreen({ route, navigateRoute, backTo }: { route: string; navigateRoute: (route: string, replace?: boolean) => void; backTo: (fallback: string) => void }) {
  const [pin, setPin] = useState("");
  const [permissions, setPermissions] = useState({ notifications: false, camera: false });
  const target = getScreenTarget(route) ?? getScreenTarget("/welcome")!;
  const nextRoute: Record<string, string> = {
    "/splash": "/welcome",
    "/access/create-account": "/access/create-pin",
    "/access/recovery": "/access/create-pin",
    "/access/create-pin": "/access/permissions",
    "/access/enter-pin": "/home",
    "/access/permissions": "/home",
  };
  if (route === "/splash") return <main className="onboarding-stage splash-screen" data-screen-id="01.01"><div className="splash-mark"><ChudoLogo square/></div><strong>CHUDO</strong><span>СВЯЗЬ · ДЕНЬГИ · СВОБОДА</span><em>PUBLIC DEMO / SIMULATED</em><button className="primary-button" onClick={() => navigateRoute("/welcome", true)}>Открыть демо</button></main>;
  if (route === "/welcome") return <main className="onboarding-stage" data-screen-id="01.02"><section className="welcome-hero"><div className="welcome-brand"><span><ChudoLogo square/></span><strong>CHUDO</strong></div><span className="simulation-chip">PUBLIC DEMO · BACKEND NOT CONNECTED</span><h1>Связь и деньги.<br/>В одном спокойном интерфейсе.</h1><p>Посмотрите будущий продукт CHUDO без реальных средств, ключей, аккаунта или сетевых сервисов.</p><div className="welcome-actions"><button className="primary-button" onClick={() => navigateRoute("/access/create-account")}>Создать demo-профиль</button><button className="secondary-button" onClick={() => navigateRoute("/access/recovery")}>Импорт / Recovery</button><button className="text-button" onClick={() => navigateRoute("/access/enter-pin")}>У меня уже есть demo PIN</button></div><button className="demo-skip" onClick={() => navigateRoute("/home")}>Перейти прямо в публичное демо <Icon name="arrow" size={17}/></button></section><aside className="welcome-preview"><div className="preview-phone"><div><small>DEMO BALANCE</small><strong>12 840,62</strong><span>CHUDO</span></div><section><i/><span><strong>Связь</strong><small>Чаты и звонки · demo</small></span></section><section><i/><span><strong>Рынок</strong><small>Simulated prices</small></span></section><section><i/><span><strong>Защита</strong><small>Функции не подключены</small></span></section></div></aside></main>;
  const isPin = route === "/access/create-pin" || route === "/access/enter-pin";
  const isPermissions = route === "/access/permissions";
  return <main className="onboarding-stage access-stage" data-screen-id={target.screenId}><section className="access-card"><button className="access-back" onClick={() => backTo("/welcome")} aria-label="Назад"><Icon name="back"/></button><span className="access-logo"><ChudoLogo square/></span><small>PUBLIC DEMO ACCESS</small><h1>{target.chudoName}</h1><p>{target.note}</p>{route === "/access/create-account" && <div className="access-form"><label><span>Имя в demo</span><input data-autofocus defaultValue="Юрий"/></label><label><span>Demo identifier</span><input defaultValue="yuri.demo"/></label></div>}{route === "/access/recovery" && <div className="honest-state"><Icon name="lock" size={28}/><strong>Recovery-материал не запрашивается</strong><span>В публичном прототипе нельзя импортировать seed phrase, ключи или production-аккаунт.</span></div>}{isPin && <div className="pin-demo"><label><span>{route === "/access/create-pin" ? "Придумайте 4 цифры для этой сессии" : "Введите любой 4-значный demo PIN"}</span><input data-autofocus inputMode="numeric" maxLength={4} value={pin} onChange={event => setPin(event.target.value.replace(/\D/g, "").slice(0, 4))} aria-label="Demo PIN"/></label><small>PIN существует только в локальном UI-состоянии и не сохраняется.</small></div>}{isPermissions && <div className="permission-list"><button aria-pressed={permissions.notifications} onClick={() => setPermissions(value => ({ ...value, notifications: !value.notifications }))}><span><Icon name="bell"/></span><div><strong>Demo-уведомления</strong><small>Только локальные UI-сообщения</small></div><em>{permissions.notifications ? "Включено локально" : "Не включено"}</em></button><button aria-pressed={permissions.camera} onClick={() => setPermissions(value => ({ ...value, camera: !value.camera }))}><span><Icon name="video"/></span><div><strong>Камера и микрофон</strong><small>Разрешение браузера не запрашивается</small></div><em>{permissions.camera ? "UI выбран" : "Не запрашивать"}</em></button></div>}<div className="access-truth"><Icon name="info" size={17}/> Ключи, secure storage и identity material не создаются.</div><button className="primary-button" disabled={isPin && pin.length !== 4} onClick={() => navigateRoute(nextRoute[route] ?? "/home")}>{route === "/access/permissions" ? "Войти в demo" : "Продолжить"}</button></section></main>;
}

function NotificationCenter({ navigateRoute }: { navigateRoute: (route: string) => void }) {
  const notices = [
    { title: "Публичный demo-режим", note: "Backend, wallet и сеть не подключены", time: "Сейчас" },
    { title: "Новый экран рынка", note: "Пары CHUDO/EUR, BTC и USDT симулированы", time: "Сегодня" },
    { title: "Проверка безопасности", note: "Production-функции честно помечены как недоступные", time: "Вчера" },
  ];
  return <div className="page feature-page" data-screen-id="09.01"><PageHeading eyebrow="LOCAL NOTIFICATION CENTER" title="Уведомления" badge="DEMO"/><section className="feature-hero panel"><span><Icon name="bell" size={30}/></span><div><small>ВАЖНО</small><h2>Это демонстрационные уведомления</h2><p>Они не получены с сервера и не подтверждают реальную активность аккаунта.</p></div></section><section className="document-list panel">{notices.map((notice, index) => <button key={notice.title} onClick={() => navigateRoute("/notifications/demo-notice")}><span className="list-icon"><Icon name={index === 0 ? "info" : "bell"}/></span><div><strong>{notice.title}</strong><small>{notice.note}</small></div><em>{notice.time}</em><Icon name="arrow" size={17}/></button>)}</section></div>;
}

function DocumentsScreen({ navigateRoute }: { navigateRoute: (route: string) => void }) {
  const items = getFamilyTargets("09").filter(target => target.route !== "/notifications" && target.route !== "/documents");
  return <div className="page feature-page" data-screen-id="09.03"><PageHeading eyebrow="LOCAL STATIC CONTENT" title="Документы" badge="DOWNLOADS: НЕТ"/><section className="feature-hero panel"><span><Icon name="document" size={30}/></span><div><small>CHUDO DOCUMENT CENTER</small><h2>Правила и информация прототипа</h2><p>Материалы открываются локально. Приложение не притворяется, что создаёт или скачивает реальные документы.</p></div></section><section className="document-list panel">{items.map(target => <button key={target.screenId} onClick={() => navigateRoute(target.route)}><span className="list-icon"><Icon name="document"/></span><div><strong>{target.chudoName}</strong><small>{target.referenceName}</small></div><em>Локально</em><Icon name="arrow" size={17}/></button>)}</section></div>;
}

function SettingsScreen({ navigateRoute, exitDemo }: { navigateRoute: (route: string) => void; exitDemo: () => void }) {
  const items = getFamilyTargets("10").filter(target => target.route !== "/settings" && target.route !== "/profile");
  return <div className="page settings-page" data-screen-id="10.02"><PageHeading eyebrow="LOCAL PREFERENCES" title="Настройки / Помощь" badge="DEMO PROFILE"/><section className="profile-settings-card panel"><span>{demoData.profile.initials}</span><div><strong>{demoData.profile.name}</strong><small>Локальный demo-профиль · не синхронизируется</small></div><button onClick={() => navigateRoute("/profile")}>Профиль <Icon name="arrow" size={16}/></button></section><section className="settings-list panel">{items.map(target => <button key={target.screenId} onClick={() => target.route === "/settings/exit" ? exitDemo() : navigateRoute(target.route)}><span><Icon name={target.route.startsWith("/support") ? "info" : target.route.includes("notification") ? "bell" : "settings"}/></span><div><strong>{target.chudoName}</strong><small>{target.referenceName}</small></div><Icon name="arrow" size={17}/></button>)}</section><section className="version-card panel"><ChudoLogo square/><div><strong>CHUDO Public Demo V3</strong><small>Публичный симулированный интерфейс · production backend не подключён</small></div></section></div>;
}

function PageHeading({ eyebrow, title, badge, children }: { eyebrow: string; title: string; badge?: string; children?: React.ReactNode }) {
  return <div className="page-heading"><div><small>{eyebrow}</small><h1>{title}</h1></div><div className="page-heading-actions">{badge && <span className="soft-badge">{badge}</span>}{children}</div></div>;
}

function MarketScreen({ route, navigateRoute, backTo, hidden, notify }: { route: string; navigateRoute: (route: string) => void; backTo: (fallback: string) => void; hidden: boolean; notify: (message: string) => void }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<MarketFilter>("all");
  const pairId = route.match(/^\/market\/(chudo-(?:eur|btc|usdt))$/)?.[1];
  const selectedPair = demoData.marketPairs.find(pair => pair.id === pairId) ?? null;
  const pairs = demoData.marketPairs.filter(pair => {
    const matchesQuery = `${pair.base} ${pair.quote}`.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === "all" || (filter === "eur" ? pair.quote === "EUR" : pair.quote !== "EUR");
    return matchesQuery && matchesFilter;
  });
  return <div className="page market-page" data-screen-id={getScreenTarget(route)?.screenId ?? "05.01"}><PageHeading eyebrow="SIMULATED MARKET" title={selectedPair ? `${selectedPair.base} / ${selectedPair.quote}` : "Рынок"} badge="REAL TRADING: НЕТ">{selectedPair && <button className="back-button" onClick={() => backTo("/market")}><Icon name="back" size={18}/> Все пары</button>}</PageHeading>{!selectedPair ? <><div className="market-primary-actions"><button onClick={() => navigateRoute("/market/chudo-eur/buy")}>Купить</button><button onClick={() => navigateRoute("/market/chudo-eur/sell")}>Продать</button><button className="exchange" onClick={() => navigateRoute("/market/swap")}>Обменять</button></div><MarketList pairs={pairs} query={query} setQuery={setQuery} filter={filter} setFilter={setFilter} select={pair => navigateRoute(`/market/${pair.id}`)} /></> : <MarketDetails pair={selectedPair} hidden={hidden} notify={notify} />}</div>;
}

function MarketList({ pairs, query, setQuery, filter, setFilter, select }: { pairs: readonly MarketPair[]; query: string; setQuery: (value: string) => void; filter: MarketFilter; setFilter: (value: MarketFilter) => void; select: (pair: MarketPair) => void }) {
  const filters: ReadonlyArray<{ id: MarketFilter; label: string }> = [{ id: "all", label: "Все" }, { id: "eur", label: "EUR" }, { id: "crypto", label: "Крипто" }];
  return <><div className="truth-banner"><Icon name="info"/><div><strong>Все цены, объёмы и сделки симулированы</strong><span>Реальные BTC/USDT-интеграции, ликвидность, средства и settlement отсутствуют.</span></div><em>SIMULATED</em></div><section className="market-list-card panel"><div className="market-toolbar"><label className="search-field"><Icon name="search" size={19}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Найти торговую пару" aria-label="Поиск торговой пары"/></label><div className="market-filter" aria-label="Фильтр торговых пар">{filters.map(item => <button key={item.id} className={filter === item.id ? "active" : ""} aria-pressed={filter === item.id} onClick={() => setFilter(item.id)}>{item.label}</button>)}</div></div><div className="market-table market-table-head"><span>Пара</span><span>Демо-цена</span><span>24 часа</span><span>Демо-объём</span><span/></div>{pairs.map(pair => <button className="market-table market-row" key={pair.id} onClick={() => select(pair)}><span className="pair-name"><i><ChudoLogo square/></i><span><strong>{pair.base} / {pair.quote}</strong><small>CHUDO-centric · demo</small></span></span><span><strong>{formatPairPrice(pair)}</strong><small>{pair.quote}</small></span><span className={pair.changeTone}>{pair.change}</span><span>{pair.volume}</span><Icon name="arrow" size={18}/></button>)}</section><p className="money-scale-note">Demo display scales: CHUDO={DEMO_DECIMAL_SCALES.CHUDO}, BTC={DEMO_DECIMAL_SCALES.BTC}, EUR={DEMO_DECIMAL_SCALES.EUR}, USDT={DEMO_DECIMAL_SCALES.USDT}. {PRODUCTION_DECIMAL_SCALE_NOTE}</p><section className="market-info-grid"><article><Icon name="trend"/><div><small>24H DEMO ОБЪЁМ</small><strong>494 400 CHUDO</strong><span>Не отражает ликвидность</span></div></article><article><Icon name="clock"/><div><small>ОТКРЫТЫЕ ЗАЯВКИ</small><strong>По 1 примеру на пару</strong><span>Не находятся в сети</span></div></article><article><Icon name="shield"/><div><small>SETTLEMENT</small><strong>Не подключён</strong><span>Реальные средства не используются</span></div></article></section></>;
}

function MarketDetails({ pair, hidden, notify }: { pair: MarketPair; hidden: boolean; notify: (message: string) => void }) {
  const decimals = pair.quoteDecimals;
  const initialPrice = formatMinorUnits(pair.priceMinor, decimals, true).replace(",", ".").replaceAll(" ", "");
  const [side, setSide] = useState<TradeSide>("buy");
  const [period, setPeriod] = useState<ChartPeriod>("1d");
  const [amount, setAmount] = useState("250.00");
  const [price, setPrice] = useState(initialPrice);
  const [flow, setFlow] = useState<"form" | "review" | "receipt">("form");
  const amountMinor = parseMinorUnits(amount, 2);
  const priceMinor = parseMinorUnits(price, decimals);
  const totalMinor = amountMinor !== null && priceMinor !== null ? multiplyMinorUnits(amountMinor, priceMinor, 2) : null;
  const total = totalMinor === null ? "—" : formatMinorUnits(totalMinor, decimals, pair.quote === "BTC");
  if (flow === "receipt") return <section className="trade-receipt panel"><span className="receipt-check"><Icon name="check" size={34}/></span><span className="simulation-chip">SIMULATED</span><h2>Не отправлено в сеть</h2><p>NO SETTLEMENT · NO BROADCAST · РЕАЛЬНЫЕ СРЕДСТВА НЕ ПЕРЕМЕЩАЛИСЬ.</p><div className="receipt-grid"><span><small>Пара</small><strong>{pair.base} / {pair.quote}</strong></span><span><small>Сторона</small><strong>{side === "buy" ? "Покупка" : "Продажа"}</strong></span><span><small>Количество</small><strong data-private-amount>{protectUserAmount(hidden, `${amount} CHUDO`)}</strong></span><span><small>Учебный итог</small><strong data-private-amount>{protectUserAmount(hidden, `${total} ${pair.quote}`)}</strong></span><span><small>Settlement</small><strong>Не выполнялся</strong></span><span><small>Комиссия</small><strong>Не определена</strong></span></div><button className="primary-button" onClick={() => setFlow("form")}>Вернуться к рынку</button></section>;
  return <><div className="truth-banner compact"><Icon name="info"/><div><strong>SIMULATED MARKET · REAL FUNDS: НЕТ</strong><span>График, стакан, сделки и заявки — фиксированные демо-данные.</span></div></div><div className="market-detail-layout">
    <section className="chart-card panel"><div className="pair-overview"><span className="pair-coin"><ChudoLogo square/></span><div><small>ДЕМО-ПАРА</small><strong>{pair.base} / {pair.quote}</strong></div><div className="pair-current"><strong>{formatPairPrice(pair)} {pair.quote}</strong><span className={pair.changeTone}>{pair.change} · demo 24h</span></div></div><svg className="price-chart" viewBox="0 0 720 250" role="img" aria-label={`Симулированный график цены за ${chartPeriods.find(item => item.id === period)?.label}`}><defs><linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2563eb" stopOpacity=".25"/><stop offset="1" stopColor="#2563eb" stopOpacity="0"/></linearGradient></defs><path d={`${pair.detail.chartPaths[period]} V250 H0Z`} fill="url(#priceFill)"/><path d={pair.detail.chartPaths[period]} fill="none" stroke="#2563eb" strokeWidth="4" strokeLinecap="round"/></svg><div className="chart-footer"><div>{chartPeriods.map(item => <button key={item.id} className={period === item.id ? "active" : ""} aria-pressed={period === item.id} onClick={() => setPeriod(item.id)}>{item.label}</button>)}</div><span>Мин. {formatPairPrice(pair, pair.lowMinor)} · Макс. {formatPairPrice(pair, pair.highMinor)}</span></div></section>
    <section className="orderbook-card panel"><div className="panel-title"><div><small>SIMULATED</small><h2>Стакан заявок</h2></div><span className="soft-badge">Demo book</span></div><div className="book-header"><span>Цена, {pair.quote}</span><span>Количество, CHUDO</span></div>{pair.detail.orderBook.asks.map(row => <div className="book-line ask" key={`${row.priceMinor}-${row.amountMinor}`}><i style={{width: `${row.depth}%`}}/><span>{formatPairPrice(pair, row.priceMinor)}</span><b>{formatMinorUnits(row.amountMinor)}</b></div>)}<div className="book-spread"><strong>{formatPairPrice(pair)}</strong><span>Демо-спред</span></div>{pair.detail.orderBook.bids.map(row => <div className="book-line bid" key={`${row.priceMinor}-${row.amountMinor}`}><i style={{width: `${row.depth}%`}}/><span>{formatPairPrice(pair, row.priceMinor)}</span><b>{formatMinorUnits(row.amountMinor)}</b></div>)}</section>
    <section className="ticket-card panel">{flow === "review" ? <TradeReview pair={pair} side={side} amount={amount} price={price} total={total} hidden={hidden} confirm={() => { setFlow("receipt"); notify("Демо-заявка создана локально"); }} back={() => setFlow("form")} /> : <><div className="trade-switch"><button className={side === "buy" ? "buy active" : ""} onClick={() => setSide("buy")}>Купить</button><button className={side === "sell" ? "sell active" : ""} onClick={() => setSide("sell")}>Продать</button></div><label className="trade-field"><span>Количество</span><div><input className={hidden ? "private-value-input" : ""} value={amount} inputMode="decimal" aria-invalid={amountMinor === null} onChange={event => setAmount(sanitizeDecimalInput(event.target.value, 2))}/><b>CHUDO</b></div></label><label className="trade-field"><span>Лимитная цена</span><div><input value={price} inputMode="decimal" aria-invalid={priceMinor === null} onChange={event => setPrice(sanitizeDecimalInput(event.target.value, decimals))}/><b>{pair.quote}</b></div></label><div className="trade-total"><span>Ориентировочный demo-итог</span><strong data-private-amount>{protectUserAmount(hidden, `${total} ${pair.quote}`)}</strong></div><div className="trade-notes"><span><Icon name="info" size={15}/> Средства не резервируются</span><span>{amountMinor === null || priceMinor === null ? "Исправьте формат суммы или цены" : "Комиссия: не определена"}</span></div><button className={`primary-button ${side}`} disabled={amountMinor === null || priceMinor === null || amountMinor === BigInt(0) || priceMinor === BigInt(0)} onClick={() => setFlow("review")}>Проверить демо-заявку</button></>}</section>
    <section className="recent-trades panel"><div className="panel-title"><div><small>SIMULATED</small><h2>Последние сделки</h2></div></div>{pair.detail.recentTrades.map(trade => <div className="recent-trade" key={`${trade.time}-${trade.priceMinor}`}><span className={trade.side}>{formatPairPrice(pair, trade.priceMinor)}</span><b>{formatMinorUnits(trade.amountMinor)} CHUDO</b><time>{trade.time}</time></div>)}</section>
    <section className="open-orders panel"><div className="panel-title"><div><small>ЛОКАЛЬНЫЙ ПРИМЕР</small><h2>Открытые заявки</h2></div><span className="soft-badge">Не в сети</span></div>{pair.detail.openOrders.map(order => <div className="open-order" key={order.id}><span className="order-side">{order.side}</span><span><strong data-private-amount>{protectUserAmount(hidden, `${formatMinorUnits(order.amountMinor)} CHUDO`)}</strong><small>Лимит {formatPairPrice(pair, order.priceMinor)} {pair.quote}</small></span><span><strong data-private-amount>{protectUserAmount(hidden, `${formatMinorUnits(order.totalMinor, pair.quoteDecimals, pair.quote === "BTC")} ${pair.quote}`)}</strong><small>OPEN · DEMO</small></span></div>)}</section>
  </div></>;
}

function TradeReview({ pair, side, amount, price, total, hidden, confirm, back }: { pair: MarketPair; side: TradeSide; amount: string; price: string; total: string; hidden: boolean; confirm: () => void; back: () => void }) {
  return <div className="trade-review"><span className="simulation-chip">НЕ БУДЕТ ОТПРАВЛЕНО В СЕТЬ</span><h2>Проверка демо-заявки</h2><div className="review-list"><span><small>Пара</small><strong>{pair.base} / {pair.quote}</strong></span><span><small>Сторона</small><strong>{side === "buy" ? "Купить" : "Продать"}</strong></span><span><small>Количество</small><strong data-private-amount>{protectUserAmount(hidden, `${amount} CHUDO`)}</strong></span><span><small>Лимитная цена</small><strong>{price} {pair.quote}</strong></span><span><small>Ориентировочный итог</small><strong data-private-amount>{protectUserAmount(hidden, `${total} ${pair.quote}`)}</strong></span><span><small>Реальное исполнение</small><strong>Нет</strong></span></div><button className="primary-button" onClick={confirm}>Создать демо-заявку</button><button className="text-button" onClick={back}>Изменить параметры</button></div>;
}

function ChatsScreen({ route, navigateRoute, hidden, activeChat, setActiveChat, openSend, startCall, notify }: { route: string; navigateRoute: (route: string) => void; hidden: boolean; activeChat: Chat; setActiveChat: (chat: Chat) => void; openSend: () => void; startCall: (kind: CallKind, contact: string) => void; notify: (message: string) => void }) {
  const mobileDetail = route === "/chats/yuri";
  const searchMode = route === "/chats/search";
  const filterMode = route === "/chats/filters";
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ChatFilter>(filterMode ? "unread" : "all");
  const chats = filterDemoChats(demoData.chats, query, filter);
  const filters: ReadonlyArray<{ id: ChatFilter; label: string }> = [{ id: "all", label: "Все" }, { id: "unread", label: "Непрочитанные" }, { id: "contacts", label: "Контакты" }];
  const paymentAmount = protectUserAmount(hidden, `+${formatMinorUnits(demoData.transactions[0].amountMinor)} CHUDO`);
  return <div className="page chats-page" data-screen-id={getScreenTarget(route)?.screenId ?? "03.01"}><PageHeading eyebrow="MESSENGER UI · DEMO" title="Чаты" badge="BACKEND: НЕТ" /><nav className="chat-call-switch" aria-label="Раздел связи"><button className="active" aria-current="page">Чаты</button><button onClick={() => navigateRoute("/calls")}>Звонки</button></nav>
    <div className={`chat-workspace ${mobileDetail ? "show-detail" : ""}`}>
      <section className={`chat-sidebar panel ${searchMode ? "search-primary" : ""} ${filterMode ? "filters-primary" : ""}`} data-chat-list-visible="true" data-chat-mode={searchMode ? "search" : filterMode ? "filters" : "list"}>
        {(searchMode || filterMode) && <div className="chat-mode-heading"><small>{searchMode ? "ПОИСК ПО DEMO-ЧАТАМ" : "ЛОКАЛЬНЫЕ ФИЛЬТРЫ"}</small><strong>{searchMode ? "Найдите контакт или сообщение" : "Показываем непрочитанные"}</strong></div>}
        <label className="search-field"><Icon name="search" size={19}/><input autoFocus={searchMode} value={query} onChange={event => setQuery(event.target.value)} placeholder="Поиск людей и сообщений" aria-label="Поиск по чатам"/></label>
        <div className="chat-filters" aria-label="Фильтр чатов">{filters.map(item => <button key={item.id} className={filter === item.id ? "active" : ""} aria-pressed={filter === item.id} onClick={() => setFilter(item.id)}>{item.label}</button>)}</div>
        <div className="chat-list">{chats.map(chat => <button className={activeChat.id === chat.id ? "active" : ""} key={chat.id} onClick={() => { setActiveChat(chat); navigateRoute(`/chats/${chat.id}`); }}><Avatar initials={chat.initials} online={chat.online}/><span><strong>{chat.name}</strong><small>{chat.message}</small></span><em><time>{chat.time}</time>{chat.unread > 0 && <b>{chat.unread}</b>}</em></button>)}{chats.length === 0 && <p className="chat-empty">Ничего не найдено в локальных demo-чатах.</p>}</div>
      </section>
      <section className="conversation panel">
        <header className="conversation-head"><button className="chat-back" onClick={() => backToChats(navigateRoute)} aria-label="Назад к чатам"><Icon name="back"/></button><Avatar initials={activeChat.initials} online={activeChat.online}/><span><strong>{activeChat.name}</strong><small>{activeChat.online ? "Демо-статус: в сети" : "Демо-статус: не в сети"}</small></span><button onClick={() => startCall("audio", activeChat.name)} aria-label="Аудиозвонок"><Icon name="phone"/></button><button onClick={() => startCall("video", activeChat.name)} aria-label="Видеозвонок"><Icon name="video"/></button></header>
        <div className="conversation-notice"><Icon name="info" size={15}/> Сообщения симулированы. E2E и messenger backend не подключены.</div>
        <div className="messages"><time>Сегодня</time><div className="message received">Привет! Проверяем новый demo dashboard?<small>10:38</small></div><div className="message sent">Да, открой ещё market details.<small>10:40 · demo</small></div><button className="payment-message" onClick={openSend}><span><Icon name="receive"/></span><div><small>ДЕМО-ОПЕРАЦИЯ</small><strong data-private-amount>{paymentAmount}</strong><em>Нажмите, чтобы открыть review</em></div><Icon name="arrow"/></button><div className="message received">Перевод получил, спасибо!<small>10:44</small></div></div>
        <div className="composer"><button onClick={() => navigateRoute("/chats/yuri/attachments")} aria-label="Добавить demo-вложение"><Icon name="plus"/></button><input placeholder="Сообщение" aria-label="Сообщение"/><button onClick={() => notify("Демо-сообщение показано только локально")} aria-label="Отправить демо-сообщение"><Icon name="send"/></button></div>
      </section>
    </div>
  </div>;
}

function backToChats(navigateRoute: (route: string) => void) {
  if ((window.history.state as { chudoDemo?: boolean; depth?: number } | null)?.chudoDemo && (window.history.state.depth ?? 0) > 0) window.history.back();
  else navigateRoute("/chats");
}

function Avatar({ initials, online = false }: { initials: string; online?: boolean }) { return <span className="contact-avatar">{initials}{online && <i aria-label="Демо-статус: в сети"/>}</span>; }

function CallsScreen({ startCall, navigate }: { startCall: (kind: CallKind, contact: string) => void; navigate: (view: View) => void }) {
  return <div className="page calls-page" data-screen-id="03.19"><PageHeading eyebrow="COMMUNICATION UI" title="Звонки" badge="DEMO CALL" /><nav className="chat-call-switch" aria-label="Раздел связи"><button onClick={() => navigate("chats")}>Чаты</button><button className="active" aria-current="page">Звонки</button></nav><div className="truth-banner"><Icon name="info"/><div><strong>MEDIA BACKEND NOT CONNECTED</strong><span>Камера и микрофон не запрашиваются. Состояния, качество и длительность симулируются.</span></div><em>DEMO CALL</em></div><div className="calls-layout"><section className="call-launch panel"><div><small>БЫСТРЫЙ СЦЕНАРИЙ</small><h2>Начать демо-звонок</h2><p>Проверьте аудио- или видеоинтерфейс будущей функции.</p></div><div><button onClick={() => startCall("audio", "Юрий Волков")}><span><Icon name="phone"/></span><strong>Аудиозвонок</strong><small>Открыть demo UI</small></button><button onClick={() => startCall("video", "Юрий Волков")}><span><Icon name="video"/></span><strong>Видеозвонок</strong><small>Без камеры</small></button></div></section><section className="call-history panel"><div className="panel-title"><div><small>ДЕМО-ЗАПИСИ</small><h2>История звонков</h2></div><span className="simulation-chip">SIMULATED</span></div><div className="call-list">{demoData.calls.map(call => <div className="call-row" key={call.id}><Avatar initials={call.initials}/><span><strong>{call.contact}</strong><small className={call.direction === "missed" ? "missed" : ""}>{call.direction === "incoming" ? "Входящий" : call.direction === "outgoing" ? "Исходящий" : "Пропущенный"} · {call.kind === "video" ? "Видео" : "Аудио"} · {call.duration}</small></span><time>{call.time}</time><div><button onClick={() => startCall("audio", call.contact)} aria-label={`Аудиозвонок: ${call.contact}`}><Icon name="phone" size={18}/></button><button onClick={() => startCall("video", call.contact)} aria-label={`Видеозвонок: ${call.contact}`}><Icon name="video" size={18}/></button><button onClick={() => navigate("chats")} aria-label={`Сообщение: ${call.contact}`}><Icon name="chat" size={18}/></button></div></div>)}</div></section></div></div>;
}

function SecurityScreen({ hidden, setHidden, notify }: { hidden: boolean; setHidden: (value: boolean) => void; notify: (message: string) => void }) {
  const items = [{ icon: "wallet", title: "Защита кошелька", note: "Production wallet не подключён", status: "Не подключено" },{ icon: "lock", title: "Подписание", note: "Ключи и подписи не создаются", status: "Недоступно" },{ icon: "worker", title: "Устройства", note: "Реестр устройств отсутствует", status: "Прототип" },{ icon: "network", title: "Сеть", note: "P2P и blockchain backend отсутствуют", status: "Не подключено" },{ icon: "shield", title: "Восстановление", note: "Требуется production backend", status: "Недоступно" }];
  return <div className="page security-page"><PageHeading eyebrow="SECURITY CENTER" title="Защита" badge="СТАТУСЫ DEMO" /><section className="security-hero"><span><Icon name="shield" size={42}/></span><div><small>ЧЕСТНЫЙ СТАТУС ПРОТОТИПА</small><h2>Защитные функции не активированы</h2><p>Экран показывает планируемые контрольные точки. Он не подтверждает безопасность production-системы.</p></div><em>DEMO</em></section><div className="security-layout"><section className="security-list panel"><div className="panel-title"><div><small>ДОСТУПНОСТЬ</small><h2>Компоненты защиты</h2></div></div>{items.map(item => <button key={item.title} onClick={() => notify(`${item.title}: ${item.status}`)}><span><Icon name={item.icon}/></span><div><strong>{item.title}</strong><small>{item.note}</small></div><em>{item.status}</em><Icon name="arrow" size={17}/></button>)}</section><aside className="security-side"><section className="panel privacy-card"><div><span><Icon name="eye"/></span><div><strong>Приватность экрана</strong><small>Локально скрывает demo-суммы</small></div></div><button role="switch" aria-label="Скрывать суммы в демо-интерфейсе" aria-checked={hidden} className={hidden ? "on" : ""} onClick={() => setHidden(!hidden)}><i/></button></section><section className="panel security-explainer"><Icon name="info"/><h3>Что означает этот экран</h3><p>Реальная защита потребует wallet backend, signing, recovery, device control и security review. В прототипе эти компоненты отсутствуют.</p></section></aside></div></div>;
}

function MiningScreen({ hidden, openMiner }: { hidden: boolean; openMiner: () => void }) {
  const mining = demoData.mining;
  return <div className="page mining-page"><PageHeading eyebrow="DESKTOP-FIRST PROTOTYPE" title="Пул майнинга CHUDO" badge="DEMO / SIMULATED"><button className="primary-compact" onClick={openMiner}><Icon name="plus" size={17}/> Подключить майнер</button></PageHeading><div className="truth-banner"><Icon name="info"/><div><strong>Реальный mining pool не запущен</strong><span>Hashrate, workers, blocks и rewards ниже — фиксированный демонстрационный сценарий.</span></div><em>SIMULATED</em></div><section className="mining-stats"><StatCard icon="network" label="Статус пула" value="Демо-доступен" note="Production endpoint: нет"/><StatCard icon="trend" label="Hashrate пула" value={mining.poolHashrate} note="Симулированный"/><StatCard icon="worker" label="Мой hashrate" value={mining.personalHashrate} note="3 demo workers"/><StatCard icon="clock" label="Ожидает" value={protectUserAmount(hidden, `${formatMinorUnits(mining.pendingRewardMinor)} CHUDO`)} note="Demo reward" privateValue/><StatCard icon="check" label="Выплачено" value={protectUserAmount(hidden, `${formatMinorUnits(mining.paidRewardMinor)} CHUDO`)} note="Demo history" privateValue/><StatCard icon="miner" label="Последний блок" value={mining.lastBlock} note="Не blockchain data"/></section><div className="mining-grid"><section className="workers-card panel"><div className="panel-title"><div><small>SIMULATED WORKERS</small><h2>Воркеры</h2></div><span className="simulation-chip">3 DEMO</span></div><div className="workers-table workers-head"><span>Worker</span><span>Статус</span><span>Hashrate</span><span>Последняя связь</span><span>Shares</span></div>{mining.workersList.map(worker => <div className="workers-table worker-row" key={worker.name}><span><i/><strong>{worker.name}</strong></span><span>{worker.status}</span><span>{worker.hashrate}</span><span>{worker.seen}</span><span>{worker.shares}</span></div>)}</section><section className="round-card panel"><small>ТЕКУЩИЙ DEMO ROUND</small><h2>{mining.round}</h2><div className="round-progress"><i/></div><div><span><small>Оценка demo-награды</small><strong data-private-amount>{protectUserAmount(hidden, `${formatMinorUnits(mining.currentRewardMinor)} CHUDO`)}</strong></span><span><small>Комиссия пула</small><strong>Не определена</strong></span></div><p><Icon name="info" size={15}/> Реальная схема расчёта и payout ещё не определена.</p></section><section className="rewards-card panel"><div className="panel-title"><div><small>DEMO MINING HISTORY</small><h2>Награды и выплаты</h2></div></div>{mining.rewards.map(reward => <div className="reward-row" key={reward.round}><span><strong>{reward.round}</strong><small>{reward.time}</small></span><span><strong data-private-amount>{protectUserAmount(hidden, `${formatMinorUnits(reward.amountMinor)} CHUDO`)}</strong><small>{reward.status}</small></span></div>)}</section></div></div>;
}

function StatCard({ icon, label, value, note, privateValue = false }: { icon: string; label: string; value: string; note: string; privateValue?: boolean }) { return <article className="stat-card"><span><Icon name={icon}/></span><div><small>{label}</small><strong data-private-amount={privateValue || undefined}>{value}</strong><em>{note}</em></div></article>; }

function SendFlow({ hidden, close }: { hidden: boolean; close: () => void }) {
  const [step, setStep] = useState<"form" | "review" | "receipt">("form"); const [recipient, setRecipient] = useState("Александр"); const [amount, setAmount] = useState("40.00"); const amountMinor = parseMinorUnits(amount); const availableMinor = BigInt(demoData.portfolio.availableMinor);
  const amountError = amountMinor === null ? "Введите корректную сумму в формате 0,00 — без лишних символов и не более двух знаков после запятой." : amountMinor <= BigInt(0) ? "Сумма должна быть больше нуля." : amountMinor > availableMinor ? hidden ? "Недостаточно демо-баланса. Доступная сумма скрыта режимом приватности." : `Недостаточно демо-баланса. Доступно ${formatMinorUnits(availableMinor)} CHUDO.` : null;
  const canReview = recipient.trim() !== "" && amountError === null;
  const protectedAmount = protectUserAmount(hidden, `${amount.replace(".", ",")} CHUDO`);
  if (step === "receipt") return <ModalShell title="Демо-квитанция" close={close}><div className="modal-receipt"><DemoStamp text="SIMULATED"/><h2>Не отправлено в сеть</h2><p>РЕАЛЬНЫЕ СРЕДСТВА НЕ ПЕРЕМЕЩАЛИСЬ</p><div className="review-list"><span><small>Статус</small><strong>Demo-проверка</strong></span><span><small>Сумма</small><strong data-private-amount>{protectedAmount}</strong></span><span><small>Подпись</small><strong>Не создавалась</strong></span><span><small>Broadcast</small><strong>Отсутствует</strong></span></div><button className="primary-button" onClick={close}>Готово</button></div></ModalShell>;
  return <ModalShell title={step === "form" ? "Отправить CHUDO" : "Проверка перевода"} close={close}>{step === "form" ? <><DemoStamp text="ДЕМО · ТРАНЗАКЦИЯ НЕ СОЗДАЁТСЯ"/><label className="modal-field"><span>Получатель</span><input data-autofocus value={recipient} onChange={event => setRecipient(event.target.value)}/></label><div className="contact-chips">{["Александр", "Юрий Волков", "Мария"].map(name => <button className={recipient === name ? "active" : ""} key={name} onClick={() => setRecipient(name)}>{name[0]}<span>{name}</span></button>)}</div><label className="modal-field amount-input"><span>Сумма</span><div><input className={hidden ? "private-value-input" : ""} inputMode="decimal" value={amount} aria-invalid={amountError !== null} aria-describedby={amountError ? "send-amount-error" : undefined} onChange={event => setAmount(sanitizeDecimalInput(event.target.value, 2))}/><b>CHUDO</b></div></label><p className="available-copy">Демо-доступно: <span data-private-amount>{protectUserAmount(hidden, `${formatMinorUnits(demoData.portfolio.availableMinor)} CHUDO`)}</span></p>{amountError && <p className="send-validation" id="send-amount-error" role="alert">{amountError}</p>}<button className="primary-button" disabled={!canReview} onClick={() => { if (canReview) setStep("review"); }}>Проверить перевод</button></> : <><div className="review-contact"><Avatar initials={recipient[0] || "?"}/><small>Демо-получатель</small><strong>{recipient}</strong></div><div className="review-amount" data-private-amount>{protectedAmount}</div><div className="review-list"><span><small>Актив</small><strong>CHUDO · demo</strong></span><span><small>Получатель</small><strong>{recipient}</strong></span><span><small>Сеть</small><strong>Не подключена</strong></span><span><small>Комиссия</small><strong>Не рассчитывается</strong></span><span><small>Итого сценария</small><strong data-private-amount>{protectedAmount}</strong></span></div><button className="primary-button" onClick={() => setStep("receipt")}>Подтвердить demo без подписи</button><button className="text-button" onClick={() => setStep("form")}>Изменить</button></>}</ModalShell>;
}

function ChudoActionSheet({ close, navigate, openOverlay }: { close: () => void; navigate: (view: View) => void; openOverlay: (overlay: Exclude<Overlay, null>) => void }) {
  function selectAction(action: CentralAction) {
    if (action === "write") navigate("chats");
    else openOverlay(action === "scan" ? "scan" : action === "send" ? "send" : "receive");
  }
  return <ModalShell title="Действия CHUDO" close={close}><DemoStamp text="ЛОКАЛЬНЫЕ ДЕМО-ДЕЙСТВИЯ"/><div className="central-actions">{centralChudoActions.map((action, index) => <button key={action.id} data-autofocus={index === 0 || undefined} onClick={() => selectAction(action.id)}><span><Icon name={action.icon}/></span><strong>{action.label}</strong><small>{action.id === "write" ? "Открыть demo-чаты" : action.id === "scan" ? "Без доступа к камере" : "Без реальных средств"}</small></button>)}</div><p className="modal-info"><Icon name="info" size={17}/> Ни одно действие не обращается к production backend.</p></ModalShell>;
}

function ReceiveSheet({ close, notify }: { close: () => void; notify: (message: string) => void }) {
  const dark = [0,1,2,7,9,14,15,16,18,24,30,32,33,34,40,41,42,48];
  async function copyDemoAddress() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard API unavailable");
      await navigator.clipboard.writeText(DEMO_ADDRESS);
      notify(clipboardNotice(true));
    } catch {
      notify(clipboardNotice(false));
    }
  }
  return <ModalShell title="Получить CHUDO" close={close}><div className="centered-sheet"><DemoStamp text="QR НЕ СОДЕРЖИТ РЕАЛЬНЫЙ АДРЕС"/><div className="demo-qr"><div>{Array.from({length:49}, (_, index) => <i className={dark.includes(index) ? "dark" : ""} key={index}/>)}</div><span><ChudoLogo square/></span></div><strong>{demoData.profile.name}</strong><code>{DEMO_ADDRESS}</code><button className="primary-button" data-autofocus onClick={copyDemoAddress}><Icon name="copy" size={18}/> Скопировать demo-адрес</button><p><Icon name="info" size={16}/> Не отправляйте реальные средства — это прототип.</p></div></ModalShell>;
}

function ScanSheet({ close, notify }: { close: () => void; notify: (message: string) => void }) { return <ModalShell title="QR-сканер" close={close}><div className="centered-sheet"><p>Камера не включается и разрешения не запрашиваются.</p><div className="scanner"><i/><i/><i/><i/><span>CHUDO<br/><small>DEMO</small></span></div><button className="secondary-button" onClick={() => notify("Галерея не открывается в демо")}>Имитировать выбор из галереи</button><p><Icon name="shield" size={16}/> Production-версия должна показать review до любого действия.</p></div></ModalShell>; }

function MoreSheet({ close, navigate }: { close: () => void; navigate: (view: View) => void }) { return <ModalShell title="Профиль и ещё" close={close}><div className="profile-summary"><span>{demoData.profile.initials}</span><div><strong>{demoData.profile.name}</strong><small>Локальный демо-профиль</small></div></div><div className="more-links"><button onClick={() => navigate("security")}><span><Icon name="shield"/></span><div><strong>Защита</strong><small>Статусы будущих функций</small></div><Icon name="arrow"/></button>{secondaryMobileDestinations.map(item => <button key={item.view} onClick={() => navigate(item.view)}><span><Icon name={item.icon}/></span><div><strong>{item.label}</strong><small>{item.note}</small></div><Icon name="arrow"/></button>)}</div><div className="modal-info"><Icon name="info" size={17}/> Профиль не синхронизируется и не хранится на backend.</div></ModalShell>; }

function MinerSheet({ close }: { close: () => void }) { return <ModalShell title="Подключить майнер" close={close}><div className="miner-sheet"><span className="miner-illustration"><Icon name="miner" size={38}/></span><DemoStamp text="REAL MINER CONNECTION: НЕДОСТУПНО"/><h2>Функция ещё не активна</h2><p>Прототип не выдаёт credentials и не содержит production endpoint.</p><div className="config-preview"><span><small>Pool address</small><code>не определён</code></span><span><small>Worker name</small><code>your-worker.demo</code></span><span><small>Connection status</small><strong>Не подключено</strong></span><span><small>Комиссия пула</small><strong>Не определена</strong></span></div><button className="primary-button" onClick={close}>Понятно</button></div></ModalShell>; }

function CallOverlay({ call, close, onMinimizedChange }: { call: ActiveCall; close: () => void; onMinimizedChange: (minimized: boolean) => void }) {
  const [kind, setKind] = useState<CallKind>(call.kind); const [state, setState] = useState<CallState>(call.initialState === "incoming" ? "ringing" : call.initialState ?? "calling"); const [incoming, setIncoming] = useState(call.initialState === "incoming"); const [seconds, setSeconds] = useState(0); const [muted, setMuted] = useState(false); const [speaker, setSpeaker] = useState(true); const [camera, setCamera] = useState(call.kind === "video"); const [frontCamera, setFrontCamera] = useState(true); const [minimized, setMinimized] = useState(Boolean(call.initiallyMinimized));
  const machineRef = useRef<ReturnType<typeof createCallStateMachine> | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const miniRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const closeRef = useRef(close);
  useEffect(() => { closeRef.current = close; }, [close]);
  useEffect(() => {
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const machine = createCallStateMachine(setState);
    machineRef.current = machine;
    if (call.initialState) machine.setInitialState(call.initialState === "incoming" ? "ringing" : call.initialState);
    else machine.start();
    return () => {
      machine.close();
      machineRef.current = null;
      if (previousFocusRef.current?.isConnected) previousFocusRef.current.focus();
    };
  }, [call.initialState]);
  useEffect(() => { onMinimizedChange(minimized); }, [minimized, onMinimizedChange]);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (minimized) miniRef.current?.querySelector<HTMLElement>("[data-mini-focus]")?.focus();
      else dialogRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [minimized]);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        machineRef.current?.close();
        closeRef.current();
        return;
      }
      if (!minimized) containTabFocus(event, dialogRef.current);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [minimized]);
  useEffect(() => { if (state !== "connected") return; const timer = window.setInterval(() => setSeconds(value => value + 1), 1000); return () => window.clearInterval(timer); }, [state]);
  useEffect(() => { if (state !== "ended") return; const frame = window.requestAnimationFrame(() => dialogRef.current?.querySelector<HTMLElement>("[data-ended-close]")?.focus()); return () => window.cancelAnimationFrame(frame); }, [state]);
  const duration = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  function retry() { machineRef.current?.retry(); }
  function answerIncoming() { setIncoming(false); machineRef.current?.answer(); }
  function simulateQuality() { if (state === "connected") machineRef.current?.reconnect(); else if (state === "reconnecting") machineRef.current?.fail(); }
  function hangup() { setMinimized(false); machineRef.current?.hangup(); }
  function closeCall() { machineRef.current?.close(); closeRef.current(); }
  if (minimized) return <div ref={miniRef} className="call-mini" role="dialog" aria-label="Свёрнутый демо-звонок" data-screen-id={call.screenId} data-component-key={call.componentKey} data-semantic-key={call.semanticKey}><Avatar initials={call.contact.slice(0,2).toUpperCase()}/><span><strong>{call.contact}</strong><small>{callStateCopy[state]} · {duration}</small></span><button data-mini-focus onClick={() => setMinimized(false)} aria-label="Развернуть звонок"><Icon name="video"/></button><button className="hangup-mini" onClick={hangup} aria-label="Завершить звонок"><Icon name="phone"/></button></div>;
  return <div ref={dialogRef} className={`call-overlay ${kind}`} role="dialog" aria-modal="true" aria-label={`${kind === "video" ? "Видео" : "Аудио"}звонок · демо`} tabIndex={-1} data-screen-id={call.screenId} data-component-key={call.componentKey} data-semantic-key={call.semanticKey}><header className="call-header"><div><span className="status-dot"/><strong>DEMO CALL</strong><small>MEDIA BACKEND NOT CONNECTED</small></div><button data-autofocus onClick={() => setMinimized(true)} aria-label="Свернуть звонок"><Icon name="minimize"/></button></header>{state === "ended" ? <div className="ended-call"><span><Icon name="phone" size={38}/></span><small>DEMO CALL</small><h2>Звонок завершён</h2><p>{call.contact} · {duration}</p><div><span><small>Медиа</small><strong>Не подключались</strong></span><span><small>Запись</small><strong>Не создавалась</strong></span></div><button className="primary-button" data-ended-close onClick={closeCall}>Закрыть</button></div> : incoming ? <div className="incoming-call-stage"><span className="simulation-chip">ВХОДЯЩИЙ · DEMO</span><div className="call-avatar"><ChudoLogo square/></div><h2>{call.contact}</h2><p>{kind === "video" ? "Входящий видеозвонок" : "Входящий аудиозвонок"}</p><div><button className="incoming-answer" onClick={answerIncoming}>Ответить</button><button className="incoming-reject" onClick={hangup}>Отклонить</button></div><small>Камера и микрофон не запрашиваются.</small></div> : <>{kind === "video" ? <div className={`video-call-stage ${camera ? "" : "camera-off"}`}><div className="remote-placeholder"><span><ChudoLogo square/></span><strong>{call.contact}</strong><small>SIMULATED VIDEO · {callStateCopy[state]}</small></div><div className="local-preview"><ChudoLogo square/><span>Вы · {frontCamera ? "передняя" : "основная"}</span></div></div> : <div className="audio-call-stage"><div className="call-avatar"><ChudoLogo square/></div><h2>{call.contact}</h2><p>{callStateCopy[state]}</p><div className="audio-bars"><i/><i/><i/><i/><i/></div></div>}<button className={`quality-button ${state}`} onClick={simulateQuality} disabled={!(["connected", "reconnecting"] as CallState[]).includes(state)}><Icon name="network" size={16}/><span>{state === "connected" ? `Хорошее demo-качество · ${duration}` : state === "reconnecting" ? "Переподключение · нажмите для demo-сбоя" : callStateCopy[state]}</span></button>{state === "failed" ? <div className="failed-call"><strong>Демо-соединение не удалось</strong><span>Медиа backend по-прежнему не подключён.</span><button className="primary-button" onClick={retry}>Повторить demo</button><button className="text-button light" onClick={hangup}>Завершить</button></div> : <div className="call-controls"><CallControl icon="mic" label={muted ? "Включить" : "Микрофон"} active={muted} onClick={() => setMuted(!muted)}/>{kind === "video" && <CallControl icon="video" label="Камера" active={!camera} onClick={() => setCamera(!camera)}/>} {kind === "video" && <CallControl icon="flip" label="Повернуть" onClick={() => setFrontCamera(!frontCamera)}/>} <CallControl icon={kind === "video" ? "phone" : "video"} label={kind === "video" ? "Только аудио" : "Включить видео"} onClick={() => { const next = kind === "video" ? "audio" : "video"; setKind(next); setCamera(next === "video"); }}/><CallControl icon="speaker" label={speaker ? "Динамик" : "Телефон"} active={!speaker} onClick={() => setSpeaker(!speaker)}/><CallControl icon="phone" label="Завершить" danger onClick={hangup}/></div>}<p className="call-disclaimer">Камера и микрофон не запрашиваются. Все состояния, длительность и качество — UI-симуляция.</p></>}</div>;
}

function CallControl({ icon, label, active, danger, onClick }: { icon: string; label: string; active?: boolean; danger?: boolean; onClick: () => void }) { return <button className={`${active ? "active" : ""} ${danger ? "danger" : ""}`} onClick={onClick}><span><Icon name={icon}/></span><small>{label}</small></button>; }
function ModalShell({ title, close, children }: { title: string; close: () => void; children: React.ReactNode }) {
  const dialogRef = useRef<HTMLElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const closeRef = useRef(close);
  useEffect(() => { closeRef.current = close; }, [close]);
  useEffect(() => {
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusFrame = window.requestAnimationFrame(() => {
      const dialog = dialogRef.current;
      const initialFocus = dialog?.querySelector<HTMLElement>("[data-autofocus]") ?? dialog?.querySelector<HTMLElement>("input, button, [href], [tabindex]:not([tabindex='-1'])");
      (initialFocus ?? dialog)?.focus();
    });
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
        return;
      }
      containTabFocus(event, dialogRef.current);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      if (previousFocusRef.current?.isConnected) previousFocusRef.current.focus();
    };
  }, []);
  return <div className="modal-backdrop" onMouseDown={event => { if (event.currentTarget === event.target) closeRef.current(); }}><section ref={dialogRef} className="modal-sheet" role="dialog" aria-modal="true" aria-label={title} tabIndex={-1}><header><h2>{title}</h2><button onClick={() => closeRef.current()} aria-label="Закрыть">×</button></header>{children}</section></div>;
}
function DemoStamp({ text }: { text: string }) { return <div className="demo-stamp">{text}</div>; }
