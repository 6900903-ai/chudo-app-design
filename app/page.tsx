"use client";

import { useEffect, useState } from "react";

type Tab = "home" | "chats" | "actions" | "wallet" | "security";
type Modal = null | "send" | "receive" | "scan";
type CallKind = "audio" | "video";
type WalletView = "assets" | "market" | "orders";
type TradeSide = "buy" | "sell";

const capabilities = {
  dexMarket: "PROTOCOL DISABLED",
  audioCalls: "НЕ ВАЛИДИРОВАНО",
  videoCalls: "НЕ ВАЛИДИРОВАНО",
} as const;

const ChudoLogo = ({ className = "chudo-logo", square = false }: { className?: string; square?: boolean }) => (
  <img className={className} src={square ? "/chudo-app-icon.webp" : "/chudo-logo.webp"} alt="Логотип CHUDO" />
);

const Icon = ({ name, size = 22 }: { name: string; size?: number }) => {
  const paths: Record<string, React.ReactNode> = {
    home: <><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5M9 20v-6h6v6"/></>,
    chat: <><path d="M20 11.5a8 8 0 0 1-8.5 8 9.5 9.5 0 0 1-4-.9L3 20l1.5-4A8 8 0 1 1 20 11.5Z"/></>,
    wallet: <><path d="M4 6.5h14a2 2 0 0 1 2 2V18H5a2 2 0 0 1-2-2V6.5A2.5 2.5 0 0 1 5.5 4H17"/><path d="M16 11h4v4h-4a2 2 0 0 1 0-4Z"/></>,
    shield: <><path d="M12 3 5 6v5c0 4.6 2.8 8 7 10 4.2-2 7-5.4 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></>,
    send: <><path d="M12 19V5M7 10l5-5 5 5"/><path d="M5 20h14"/></>,
    receive: <><path d="M12 5v14M7 14l5 5 5-5"/><path d="M5 4h14"/></>,
    scan: <><path d="M4 9V5a1 1 0 0 1 1-1h4M15 4h4a1 1 0 0 1 1 1v4M20 15v4a1 1 0 0 1-1 1h-4M9 20H5a1 1 0 0 1-1-1v-4"/><path d="M8 12h8"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
    eye: <><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></>,
    arrow: <><path d="M5 12h14M14 7l5 5-5 5"/></>,
    back: <><path d="M19 12H5M10 7l-5 5 5 5"/></>,
    network: <><circle cx="12" cy="5" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/><path d="m11 7-4 9M13 7l4 9M8 18h8"/></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/></>,
    check: <><path d="m5 12 4 4L19 6"/></>,
    copy: <><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></>,
    key: <><circle cx="8" cy="15" r="4"/><path d="m11 12 8-8M15 8l2 2M17 6l2 2"/></>,
    cloud: <><path d="M6 18h11a4 4 0 0 0 .7-7.9A6 6 0 0 0 6.3 8.5 4.8 4.8 0 0 0 6 18Z"/><path d="M12 11v7M9 14l3-3 3 3"/></>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></>,
    phone: <><path d="M7.2 3.5 4.5 5.2c-.8.5-1.1 1.5-.7 2.4 2.4 6 6.7 10.3 12.7 12.7.9.4 1.9.1 2.4-.7l1.7-2.7-4.6-3-1.7 2.1c-2.7-1.3-5-3.6-6.3-6.3l2.1-1.7-2.9-4.5Z"/></>,
    video: <><rect x="3" y="6" width="13" height="12" rx="3"/><path d="m16 10 5-3v10l-5-3"/></>,
    mic: <><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8"/></>,
    speaker: <><path d="M5 10H2v4h3l5 4V6l-5 4Z"/><path d="M14 9a4 4 0 0 1 0 6M17 6a8 8 0 0 1 0 12"/></>,
    rotate: <><path d="M20 7v5h-5M4 17v-5h5"/><path d="M6.1 8A7 7 0 0 1 18 6l2 6M17.9 16A7 7 0 0 1 6 18l-2-6"/></>,
    market: <><path d="M4 19V9M10 19V5M16 19v-7M22 19V3"/><path d="M2 19h22"/></>,
    orders: <><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/></>,
    swap: <><path d="M7 7h12l-3-3M17 17H5l3 3"/></>,
    signal: <><path d="M4 18v2M9 14v6M14 10v10M19 6v14"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
};

const activity = [
  { icon: "Ю", title: "Юрий Волков", note: "Демо · получено", value: "+128 CHUDO", time: "10:42", positive: true },
  { icon: "A", title: "Александр", note: "Демо · отправлено", value: "−40 CHUDO", time: "Вчера", positive: false },
  { icon: "N", title: "Сценарий сети", note: "Тестовые данные", value: "+3,82 CHUDO", time: "Вчера", positive: true },
];

const chats = [
  { avatar: "Ю", name: "Юрий Волков", text: "Перевод получил, спасибо!", time: "10:44", unread: 2, online: true },
  { avatar: "A", name: "Александр", text: "Всё работает напрямую 👍", time: "09:18", unread: 0, online: true },
  { avatar: "М", name: "Мария", text: "Фото", time: "Вчера", unread: 0, online: false },
  { avatar: "C", name: "CHUDO Community", text: "Новая версия узла доступна", time: "Пн", unread: 5, online: false },
];

const calls = [
  { avatar: "Ю", name: "Юрий Волков", kind: "video" as CallKind, note: "Исходящий · демо 04:18", time: "10:21" },
  { avatar: "А", name: "Александр", kind: "audio" as CallKind, note: "Пропущенный · демо", time: "Вчера" },
  { avatar: "М", name: "Мария", kind: "video" as CallKind, note: "Входящий · демо 12:03", time: "Пн" },
];

const demoBook = {
  asks: [[1.28, 420], [1.24, 860], [1.21, 510]],
  bids: [[1.18, 640], [1.15, 920], [1.12, 380]],
};

export default function Home() {
  const [tab, setTab] = useState<Tab>("home");
  const [hidden, setHidden] = useState(false);
  const [modal, setModal] = useState<Modal>(null);
  const [sendStep, setSendStep] = useState(0);
  const [amount, setAmount] = useState("40");
  const [recipient, setRecipient] = useState("Александр");
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [call, setCall] = useState<{ kind: CallKind; name: string } | null>(null);
  const [walletView, setWalletView] = useState<WalletView>("assets");

  const openSend = () => { setModal("send"); setSendStep(0); };
  const closeModal = () => { setModal(null); setSendStep(0); };
  const notify = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(""), 2200); };

  const go = (next: Tab) => { setSelectedChat(null); setTab(next); };
  const openMarket = () => { setWalletView("market"); go("wallet"); };

  return (
    <main className="stage">
      <section className="app-shell" aria-label="Интерактивный прототип приложения CHUDO">
        <header className="topbar">
          <button className="avatar" aria-label="Открыть профиль" onClick={() => notify("Профиль Юрия")}>ЮЧ<span /></button>
          <div className="brand"><ChudoLogo/><strong>CHUDO</strong><small>ДЕМО</small></div>
          <button className="icon-button" aria-label="Уведомления" onClick={() => notify("Новых уведомлений нет")}><Icon name="bell" /></button>
        </header>

        <div className="content">
          {tab === "home" && <HomeScreen hidden={hidden} setHidden={setHidden} openSend={openSend} openModal={setModal} go={go} openMarket={openMarket} />}
          {tab === "chats" && <ChatsScreen selectedChat={selectedChat} setSelectedChat={setSelectedChat} openSend={openSend} notify={notify} startCall={(kind, name) => setCall({ kind, name })} />}
          {tab === "wallet" && <WalletScreen hidden={hidden} setHidden={setHidden} openSend={openSend} openModal={setModal} view={walletView} setView={setWalletView} notify={notify} />}
          {tab === "security" && <SecurityScreen hidden={hidden} setHidden={setHidden} notify={notify} />}
          {tab === "actions" && <ActionScreen close={() => go("home")} go={go} openSend={openSend} openModal={setModal} openMarket={openMarket} />}
        </div>

        <nav className="bottom-nav" aria-label="Главная навигация">
          <button className={tab === "home" ? "active" : ""} onClick={() => go("home")}><Icon name="home"/><span>Главная</span></button>
          <button className={tab === "chats" ? "active" : ""} onClick={() => go("chats")}><Icon name="chat"/><span>Чаты</span></button>
          <button className="center-action" onClick={() => go("actions")} aria-label="Открыть действия"><span><ChudoLogo/><b>+</b></span><em>CHUDO</em></button>
          <button className={tab === "wallet" ? "active" : ""} onClick={() => go("wallet")}><Icon name="wallet"/><span>Кошелёк</span></button>
          <button className={tab === "security" ? "active" : ""} onClick={() => go("security")}><Icon name="shield"/><span>Защита</span></button>
        </nav>

        {modal && <ModalLayer modal={modal} close={closeModal} step={sendStep} setStep={setSendStep} amount={amount} setAmount={setAmount} recipient={recipient} setRecipient={setRecipient} notify={notify} />}
        {call && <CallOverlay call={call} end={() => setCall(null)} />}
        {notice && <div className="toast" role="status"><Icon name="check" size={17}/>{notice}</div>}
      </section>
      <aside className="prototype-note"><span>Интерактивный прототип</span><strong>CHUDO mobile</strong><p>Связь, кошелёк и рынок в едином премиальном интерфейсе с официальным знаком CHUDO.</p><div><b /> Все операции и соединения — безопасная симуляция.</div></aside>
    </main>
  );
}

function HomeScreen({ hidden, setHidden, openSend, openModal, go, openMarket }: { hidden:boolean; setHidden:(v:boolean)=>void; openSend:()=>void; openModal:(v:Modal)=>void; go:(v:Tab)=>void; openMarket:()=>void }) {
  const actions = [
    { label: "Отправить", icon: "send", run: openSend },
    { label: "Получить", icon: "receive", run: () => openModal("receive") },
    { label: "Сканировать", icon: "scan", run: () => openModal("scan") },
    { label: "Рынок", icon: "market", run: openMarket },
  ];
  return <div className="screen home-screen">
    <div className="greeting"><span>Доброе утро, Юрий</span><em><b /> Демо-сценарий</em></div>
    <section className="balance-card">
      <div className="balance-head"><span>Общий баланс</span><button onClick={() => setHidden(!hidden)} aria-label="Показать или скрыть баланс"><Icon name="eye" size={19}/></button></div>
      <div className="balance">{hidden ? "••••••" : "12 840,62"}<small>CHUDO</small></div>
      <div className="fiat">≈ {hidden ? "••••" : "12 840,62"} dEUR <span>Симуляция</span></div>
      <div className="balance-line" />
      <div className="balance-foot"><span><Icon name="shield" size={16}/> Ключи только на устройстве</span><button onClick={() => go("security")}>Подробнее <Icon name="arrow" size={15}/></button></div>
    </section>
    <section className="quick-grid" aria-label="Быстрые действия">
      {actions.map((action) => <button key={action.label} onClick={action.run}><i><Icon name={action.icon}/></i><span>{action.label}</span></button>)}
    </section>
    <button className="network-card" onClick={() => go("security") }>
      <span className="network-icon"><Icon name="network"/></span><span><strong>Архитектура прямого соединения</strong><small>Макет статуса · backend не подключён</small></span><Icon name="arrow" size={18}/>
    </button>
    <section className="section-block">
      <div className="section-title"><h2>Последние операции</h2><button onClick={() => go("wallet")}>Все</button></div>
      <ActivityList />
    </section>
  </div>;
}

function ActivityList() {
  return <div className="activity-list">{activity.map((item) => <div className="activity-row" key={item.title}>
    <div className={`activity-avatar ${item.icon === "N" ? "node" : ""}`}>{item.icon}</div>
    <div className="activity-copy"><strong>{item.title}</strong><span>{item.note} · {item.time}</span></div>
    <div className={`activity-value ${item.positive ? "positive" : ""}`}>{item.value}</div>
  </div>)}</div>;
}

function ChatsScreen({ selectedChat, setSelectedChat, openSend, notify, startCall }: { selectedChat:string|null; setSelectedChat:(v:string|null)=>void; openSend:()=>void; notify:(v:string)=>void; startCall:(kind:CallKind,name:string)=>void }) {
  const [section, setSection] = useState<"chats" | "calls">("chats");
  if (selectedChat) return <div className="screen chat-detail">
    <div className="chat-header"><button onClick={() => setSelectedChat(null)} aria-label="Назад"><Icon name="back"/></button><div className="chat-mini-avatar">{selectedChat[0]}<span /></div><div><strong>{selectedChat}</strong><small>в сети · защищено</small></div><button className="call-start" onClick={() => startCall("audio", selectedChat)} aria-label="Аудиозвонок"><Icon name="phone" size={19}/></button><button className="call-start" onClick={() => startCall("video", selectedChat)} aria-label="Видеозвонок"><Icon name="video" size={19}/></button></div>
    <div className="encryption-note"><Icon name="lock" size={14}/> Демо E2E · реальный канал отключён</div>
    <div className="messages">
      <div className="bubble received">Привет! Проверяем перевод через CHUDO?<time>10:38</time></div>
      <div className="bubble sent">Да, отправляю сейчас.<time>10:40 ✓✓</time></div>
      <button className="payment-message" onClick={openSend}><i><Icon name="receive"/></i><span><small>ДЕМО-ОПЕРАЦИЯ</small><strong>+128 CHUDO</strong><em>Пример состояния интерфейса</em></span><Icon name="arrow"/></button>
      <div className="bubble received">Перевод получил, спасибо!<time>10:44</time></div>
    </div>
    <div className="composer"><button onClick={openSend} aria-label="Добавить платёж">+</button><span>Сообщение</span><button onClick={() => notify("Демо-сообщение отправлено")} aria-label="Отправить сообщение"><Icon name="send"/></button></div>
  </div>;

  return <div className="screen list-screen">
    <div className="screen-heading"><div><small>Защищённая связь · демо</small><h1>Общение</h1></div><button aria-label="Поиск"><Icon name="search"/></button></div>
    <div className="communication-tabs" role="tablist"><button className={section === "chats" ? "active" : ""} onClick={() => setSection("chats")}><Icon name="chat" size={17}/> Чаты</button><button className={section === "calls" ? "active" : ""} onClick={() => setSection("calls")}><Icon name="phone" size={17}/> Звонки</button></div>
    {section === "chats" ? <>
      <label className="search-box"><Icon name="search" size={18}/><input aria-label="Поиск по чатам" placeholder="Поиск людей и сообщений" /></label>
      <div className="chat-filter"><button className="active">Все</button><button>Непрочитанные</button><button>Контакты</button></div>
      <div className="chat-list">{chats.map(chat => <button key={chat.name} onClick={() => setSelectedChat(chat.name)}>
        <span className="chat-avatar">{chat.avatar}{chat.online && <i />}</span><span className="chat-copy"><strong>{chat.name}</strong><small>{chat.text}</small></span><span className="chat-meta"><time>{chat.time}</time>{chat.unread > 0 && <b>{chat.unread}</b>}</span>
      </button>)}</div>
      <button className="floating-compose" onClick={() => notify("Выберите контакт для нового чата")} aria-label="Новый чат"><Icon name="chat"/><span>+</span></button>
    </> : <>
      <CapabilityBanner icon="phone" title="Звонки работают как UI-демо" text={`Микрофон и камера не включаются. AUDIO: ${capabilities.audioCalls}; VIDEO: ${capabilities.videoCalls}.`} />
      <div className="call-actions"><button onClick={() => startCall("audio", "Юрий Волков")}><span><Icon name="phone"/></span><strong>Аудиозвонок</strong><small>Открыть сценарий</small></button><button onClick={() => startCall("video", "Юрий Волков")}><span><Icon name="video"/></span><strong>Видеозвонок</strong><small>Открыть сценарий</small></button></div>
      <div className="section-title call-history-title"><h2>История звонков</h2><button onClick={() => notify("История содержит только демонстрационные записи")}>О демо</button></div>
      <div className="call-list">{calls.map(item => <div className="call-row" key={`${item.name}-${item.kind}`}><span className="chat-avatar">{item.avatar}</span><span><strong>{item.name}</strong><small>{item.note} · {item.time}</small></span><button onClick={() => startCall("audio", item.name)} aria-label={`Аудиозвонок: ${item.name}`}><Icon name="phone" size={18}/></button><button onClick={() => startCall("video", item.name)} aria-label={`Видеозвонок: ${item.name}`}><Icon name="video" size={18}/></button></div>)}</div>
      <div className="recording-disabled"><Icon name="lock" size={16}/><span><strong>Запись отключена</strong><small>Нужны отдельное согласие и подтверждённая media-authority.</small></span></div>
    </>}
  </div>;
}

function WalletScreen({ hidden, setHidden, openSend, openModal, view, setView, notify }: { hidden:boolean; setHidden:(v:boolean)=>void; openSend:()=>void; openModal:(v:Modal)=>void; view:WalletView; setView:(v:WalletView)=>void; notify:(v:string)=>void }) {
  return <div className="screen wallet-screen">
    <div className="screen-heading"><div><small>Активы и обмен · демо</small><h1>{view === "assets" ? "Кошелёк" : view === "market" ? "Рынок" : "Мои заявки"}</h1></div><button onClick={() => setHidden(!hidden)} aria-label="Скрыть баланс"><Icon name="eye"/></button></div>
    <div className="wallet-tabs" role="tablist"><button className={view === "assets" ? "active" : ""} onClick={() => setView("assets")}><Icon name="wallet" size={16}/> Активы</button><button className={view === "market" ? "active" : ""} onClick={() => setView("market")}><Icon name="market" size={16}/> Рынок</button><button className={view === "orders" ? "active" : ""} onClick={() => setView("orders")}><Icon name="orders" size={16}/> Заявки</button></div>
    {view === "assets" && <>
      <section className="wallet-hero"><div className="coin-mark"><ChudoLogo/></div><span>Учебный доступный баланс</span><strong>{hidden ? "••••••" : "12 840,62"}<small> CHUDO</small></strong><em>≈ {hidden ? "••••" : "12 840,62"} dEUR · симулированный курс</em></section>
      <div className="wallet-actions"><button onClick={openSend}><Icon name="send"/><span>Отправить</span></button><button onClick={() => openModal("receive")}><Icon name="receive"/><span>Получить</span></button><button onClick={() => setView("market")}><Icon name="market"/><span>Рынок</span></button></div>
      <div className="ownership-card"><Icon name="key"/><div><strong>Non-custodial принцип интерфейса</strong><span>Прототип не создаёт ключи, не хранит средства и не отправляет транзакции.</span></div></div>
      <section className="section-block"><div className="section-title"><h2>История сценария</h2><button onClick={() => notify("Все строки истории — демонстрационные")}>О демо</button></div><ActivityList /></section>
    </>}
    {view === "market" && <MarketScreen setView={setView} notify={notify}/>} 
    {view === "orders" && <OrdersScreen notify={notify}/>} 
  </div>;
}

function MarketScreen({ setView, notify }: { setView:(v:WalletView)=>void; notify:(v:string)=>void }) {
  const [side, setSide] = useState<TradeSide>("buy");
  const [quantity, setQuantity] = useState("250");
  const [price, setPrice] = useState("1.18");
  const [confirming, setConfirming] = useState(false);
  const total = (Number(quantity.replace(",", ".")) || 0) * (Number(price.replace(",", ".")) || 0);
  const placeDemo = () => { setConfirming(false); notify("Демо-заявка создана локально — в сеть не отправлена"); setView("orders"); };

  return <div className="market-screen">
    <CapabilityBanner icon="market" title="Рынок — интерактивный макет" text={`Цены, график и заявки — изолированный учебный сценарий. ${capabilities.dexMarket}.`} />
    <section className="pair-card">
      <div className="pair-head"><span className="pair-logo"><ChudoLogo/></span><div><small>УЧЕБНАЯ ПАРА</small><strong>CHUDO / dEUR</strong></div><button onClick={() => notify("Другие пары появятся после подтверждения backend")}>Сменить</button></div>
      <div className="pair-price"><strong>1,18 <small>dEUR</small></strong><span>Симулированная цена</span></div>
      <svg className="market-chart" viewBox="0 0 320 92" role="img" aria-label="Демонстрационный график цены"><defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3979ff" stopOpacity=".35"/><stop offset="1" stopColor="#3979ff" stopOpacity="0"/></linearGradient></defs><path d="M0 76 C22 68 28 73 48 58 S84 66 105 50 138 45 157 53 187 35 205 38 236 20 258 30 288 14 320 9 V92 H0Z" fill="url(#chartFill)"/><path d="M0 76 C22 68 28 73 48 58 S84 66 105 50 138 45 157 53 187 35 205 38 236 20 258 30 288 14 320 9" fill="none" stroke="#2868ef" strokeWidth="3" strokeLinecap="round"/></svg>
      <div className="chart-period"><button>1Ч</button><button className="active">1Д</button><button>1Н</button><button>1М</button><span>DEMO DATA</span></div>
    </section>
    <section className="order-book"><div className="section-title"><h2>Стакан заявок</h2><button onClick={() => notify("V1: только полное исполнение, частичных сделок нет")}>V1 · Full fill</button></div><div className="book-head"><span>Цена dEUR</span><span>Количество CHUDO</span></div>{demoBook.asks.map(([p,q]) => <div className="book-row ask" key={p}><span>{p.toFixed(2)}</span><b>{q}</b><i style={{width:`${Math.min(92,q/10)}%`}}/></div>)}<div className="spread"><strong>1,18</strong><span>Демо-спред 0,03</span></div>{demoBook.bids.map(([p,q]) => <div className="book-row bid" key={p}><span>{p.toFixed(2)}</span><b>{q}</b><i style={{width:`${Math.min(92,q/10)}%`}}/></div>)}</section>
    <section className="trade-ticket"><div className="trade-side"><button className={side === "buy" ? "buy active" : ""} onClick={() => setSide("buy")}>Купить</button><button className={side === "sell" ? "sell active" : ""} onClick={() => setSide("sell")}>Продать</button></div><label><span>Количество</span><div><input value={quantity} inputMode="decimal" onChange={e => setQuantity(e.target.value.replace(/[^0-9.,]/g,""))}/><b>CHUDO</b></div></label><label><span>Лимитная цена</span><div><input value={price} inputMode="decimal" onChange={e => setPrice(e.target.value.replace(/[^0-9.,]/g,""))}/><b>dEUR</b></div></label><div className="ticket-total"><span>Учебный итог</span><strong>{total.toLocaleString("ru-RU",{maximumFractionDigits:2})} dEUR</strong></div><p><Icon name="lock" size={14}/> Средства не резервируются. Самосделка запрещена политикой V1.</p><button className={`primary-button ${side}`} disabled={!quantity || !price} onClick={() => setConfirming(true)}>Проверить демо-заявку</button></section>
    {confirming && <div className="modal-backdrop market-modal" role="dialog" aria-modal="true"><div className="sheet"><SheetHead title="Проверка демо-заявки" close={() => setConfirming(false)}/><div className="demo-stamp">НЕ БУДЕТ ОТПРАВЛЕНО В СЕТЬ</div><div className="review-table"><span>Рынок<b>CHUDO / dEUR</b></span><span>Сторона<b>{side === "buy" ? "Купить" : "Продать"}</b></span><span>Количество<b>{quantity} CHUDO</b></span><span>Лимитная цена<b>{price} dEUR</b></span><span>Полный объём<b>{total.toLocaleString("ru-RU",{maximumFractionDigits:2})} dEUR</b></span><span>Исполнение<b>Только полностью</b></span><span>Торговая комиссия<b>Не задана протоколом</b></span></div><button className="primary-button" onClick={placeDemo}>Создать локальный пример</button><button className="text-button" onClick={() => setConfirming(false)}>Вернуться</button></div></div>}
  </div>;
}

function OrdersScreen({ notify }: { notify:(v:string)=>void }) {
  const [cancelled, setCancelled] = useState(false);
  return <div className="orders-screen"><CapabilityBanner icon="orders" title="Заявки не находятся в сети" text="Ни одна строка ниже не подписана, не зарезервирована и не может быть исполнена."/><div className="reserve-card"><span><small>Демо-доступно</small><strong>12 840,62 CHUDO</strong></span><span><small>Зарезервировано</small><strong>{cancelled ? "0" : "250"} CHUDO</strong></span></div><div className="section-title"><h2>Локальный пример</h2><button onClick={() => notify("Статусы OPEN / FILLED / CANCELLED принадлежат будущему CORE")}>Статусы V1</button></div><div className="demo-order"><div className="order-top"><span className="pair-logo small"><ChudoLogo/></span><span><strong>CHUDO / dEUR</strong><small>SELL · лимит 1,18 dEUR</small></span><em className={cancelled ? "cancelled" : "open"}>{cancelled ? "CANCELLED" : "OPEN · ДЕМО"}</em></div><div className="order-details"><span>Количество<b>250 CHUDO</b></span><span>Учебный итог<b>295 dEUR</b></span><span>Исполнение<b>Full fill only</b></span></div><button className="secondary-button" disabled={cancelled} onClick={() => {setCancelled(true); notify("Локальный пример отменён — сеть не вызывалась");}}>{cancelled ? "Пример отменён" : "Имитировать отмену"}</button></div><p className="orders-foot"><Icon name="info" size={15}/> UI не сопоставляет заявки и не решает, какая сделка исполнена. Это полномочие будущего canonical backend.</p></div>;
}

function SecurityScreen({ hidden, setHidden, notify }: { hidden:boolean; setHidden:(v:boolean)=>void; notify:(v:string)=>void }) {
  const items = [
    { icon:"lock", title:"Вход и подтверждения", note:"Макет системного PIN-потока", status:"ДЕМО" },
    { icon:"key", title:"Ключи и устройства", note:"Ключи в прототипе не создаются", status:"GATED" },
    { icon:"cloud", title:"Восстановление", note:"Ожидает canonical finality", status:"НЕДОСТУПНО" },
    { icon:"network", title:"Сеть и соединения", note:"Backend в демо не подключён", status:"OFFLINE" },
  ];
  return <div className="screen security-screen">
    <div className="screen-heading"><div><small>Центр доверия · макет</small><h1>Защита</h1></div><div className="secure-badge"><Icon name="shield" size={18}/> ДЕМО</div></div>
    <section className="security-hero"><div className="shield-orbit"><Icon name="shield" size={38}/></div><div><strong>Fail-closed по умолчанию</strong><span>Прототип не хранит ключи и не активирует защищённые функции.</span></div></section>
    <div className="exact-auth"><Icon name="info" size={18}/><span><strong>Одна авторизация — одна точная операция</strong><small>Production-подпись останется отключённой до отдельного security PASS.</small></span></div>
    <div className="settings-list">{items.map(item => <button key={item.title} onClick={() => notify(`${item.title}: ${item.status}`)}><i><Icon name={item.icon}/></i><span><strong>{item.title}</strong><small>{item.note}</small></span><em>{item.status}</em><Icon name="arrow" size={17}/></button>)}</div>
    <div className="privacy-toggle"><span><strong>Скрывать суммы</strong><small>На главном экране и в кошельке</small></span><button className={hidden ? "on" : ""} onClick={() => setHidden(!hidden)} aria-label="Скрывать суммы"><i /></button></div>
    <p className="security-foot"><Icon name="lock" size={15}/> Все статусы на экране — дизайн состояний. Реальная защита определяется владельцами CORE и платформы.</p>
  </div>;
}

function ActionScreen({ close, go, openSend, openModal, openMarket }: { close:()=>void; go:(v:Tab)=>void; openSend:()=>void; openModal:(v:Modal)=>void; openMarket:()=>void }) {
  return <div className="screen action-screen">
    <button className="close-action" onClick={close} aria-label="Закрыть">×</button><div className="action-brand"><ChudoLogo/></div><h1>Что хотите сделать?</h1><p>Деньги и сообщения — в одном безопасном месте</p>
    <div className="action-list">
      <button onClick={() => go("chats")}><i><Icon name="chat"/></i><span><strong>Написать</strong><small>Начать защищённый чат</small></span><Icon name="arrow"/></button>
      <button onClick={() => openModal("scan")}><i><Icon name="scan"/></i><span><strong>Сканировать</strong><small>QR-код контакта или платежа</small></span><Icon name="arrow"/></button>
      <button onClick={openSend}><i><Icon name="send"/></i><span><strong>Отправить CHUDO</strong><small>Контакту или по адресу</small></span><Icon name="arrow"/></button>
      <button onClick={() => openModal("receive")}><i><Icon name="receive"/></i><span><strong>Получить</strong><small>Показать свой QR-код</small></span><Icon name="arrow"/></button>
      <button onClick={openMarket}><i><Icon name="market"/></i><span><strong>Открыть рынок</strong><small>Лимитные заявки в безопасном демо</small></span><Icon name="arrow"/></button>
    </div><div className="local-note"><Icon name="lock" size={17}/> Демо не создаёт ключи, транзакции или реальные заявки</div>
  </div>;
}

function ModalLayer({ modal, close, step, setStep, amount, setAmount, recipient, setRecipient, notify }: { modal:Exclude<Modal,null>; close:()=>void; step:number; setStep:(v:number)=>void; amount:string; setAmount:(v:string)=>void; recipient:string; setRecipient:(v:string)=>void; notify:(v:string)=>void }) {
  if (modal === "receive") return <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="sheet receive-sheet"><SheetHead title="Получить CHUDO · демо" close={close}/><div className="demo-stamp">QR НЕ СОДЕРЖИТ РЕАЛЬНЫЙ АДРЕС</div><div className="qr"><div className="qr-grid">{Array.from({length:49},(_,i)=><i key={i} className={[0,1,2,7,9,14,15,16,32,33,34,40,41,42,48,24,30,18].includes(i)?"dark":""}/>)}</div><span className="qr-coin"><ChudoLogo/></span></div><strong className="receive-name">Юрий Чудинович</strong><p className="address">demo_chudo_address_not_for_funds</p><button className="primary-button" onClick={() => notify("Скопирован только демонстрационный адрес")}><Icon name="copy" size={18}/> Скопировать демо-адрес</button><div className="sheet-note"><Icon name="info" size={17}/> Не отправляйте реальные средства — это макет.</div></div></div>;
  if (modal === "scan") return <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="sheet scan-sheet"><SheetHead title="Сканировать · демо" close={close}/><p>Камера не включается. Показан сценарий QR-сканера.</p><div className="scanner"><i/><i/><i/><i/><div className="scan-line"/><div className="scan-mark">C</div></div><button className="secondary-button" onClick={() => notify("Галерея не открывается в демо")}>Имитировать выбор из галереи</button><div className="sheet-note"><Icon name="shield" size={17}/> Production-версия покажет точный review перед действием.</div></div></div>;

  return <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="sheet send-sheet">
    <SheetHead title={step === 0 ? "Отправить CHUDO" : step === 1 ? "Проверка перевода" : step === 2 ? "Подтверждение" : "Готово"} close={close}/>
    {step === 0 && <><div className="demo-stamp">ДЕМО · ТРАНЗАКЦИЯ НЕ СОЗДАЁТСЯ</div><label className="field"><span>Получатель</span><input value={recipient} onChange={e=>setRecipient(e.target.value)} /></label><div className="contact-chips">{["Александр","Юрий Волков","Мария"].map(name=><button className={recipient===name?"active":""} key={name} onClick={()=>setRecipient(name)}>{name[0]}<span>{name}</span></button>)}</div><label className="field amount-field"><span>Сумма</span><div><input inputMode="decimal" value={amount} onChange={e=>setAmount(e.target.value.replace(/[^0-9.,]/g,""))}/><b>CHUDO</b></div></label><div className="available">Учебный доступный баланс: 12 840,62 CHUDO</div><button className="primary-button" disabled={!amount || !recipient} onClick={()=>setStep(1)}>Проверить демо</button></>}
    {step === 1 && <><div className="review-person"><span>{recipient[0] || "?"}</span><small>Учебный получатель</small><strong>{recipient}</strong></div><div className="review-amount">{amount} <small>CHUDO</small></div><div className="review-table"><span>Актив<b>CHUDO · demo identity</b></span><span>Получатель<b>{recipient}</b></span><span>Сеть<b>Не подключена</b></span><span>Комиссия сети<b>Не рассчитывается</b></span><span>Итого сценария<b>{amount} CHUDO</b></span></div><button className="primary-button" onClick={()=>setStep(2)}>Посмотреть защиту</button><button className="text-button" onClick={()=>setStep(0)}>Изменить данные</button></>}
    {step === 2 && <div className="auth-step"><div className="auth-icon"><Icon name="lock" size={34}/></div><h2>Защищённая подпись отключена</h2><p>Это дизайн будущего системного подтверждения Android. Прототип не вызывает PIN и не создаёт подпись.</p><div className="exact-operation"><small>УЧЕБНАЯ ТОЧНАЯ ОПЕРАЦИЯ</small><strong>{amount} CHUDO → {recipient}</strong><span>Production: одна новая авторизация только для одной операции</span></div><button className="primary-button" onClick={()=>setStep(3)}>Завершить демо без подписи</button><button className="text-button" onClick={close}>Закрыть</button></div>}
    {step === 3 && <div className="success-step"><div className="success-check"><Icon name="check" size={42}/></div><h2>Демо завершено</h2><p>Ничего не отправлено, баланс не изменён</p><div className="receipt"><span>Статус<b>Симуляция</b></span><span>Сеть<b>Не вызывалась</b></span><span>Подпись<b>Не создавалась</b></span></div><button className="primary-button" onClick={close}>Готово</button></div>}
  </div></div>;
}

function CallOverlay({ call, end }: { call:{ kind:CallKind; name:string }; end:()=>void }) {
  const [kind, setKind] = useState<CallKind>(call.kind);
  const [connected, setConnected] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(true);
  const [camera, setCamera] = useState(call.kind === "video");
  const [frontCamera, setFrontCamera] = useState(true);
  const [quality, setQuality] = useState<"good" | "low">("good");

  useEffect(() => {
    const connectTimer = window.setTimeout(() => setConnected(true), 1100);
    return () => window.clearTimeout(connectTimer);
  }, []);

  useEffect(() => {
    if (!connected) return;
    const timer = window.setInterval(() => setSeconds(value => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [connected]);

  const time = `${String(Math.floor(seconds / 60)).padStart(2,"0")}:${String(seconds % 60).padStart(2,"0")}`;

  const switchKind = () => { const next = kind === "audio" ? "video" : "audio"; setKind(next); setCamera(next === "video"); };

  return <div className={`call-overlay ${kind}`} role="dialog" aria-modal="true" aria-label={kind === "video" ? "Демо видеозвонка" : "Демо аудиозвонка"}>
    <div className="call-glow" />
    <div className="call-topline"><span><Icon name="lock" size={14}/> Media backend отключён</span><em>СИМУЛЯЦИЯ</em></div>

    {kind === "video" ? <div className={`video-stage ${camera ? "camera-on" : "camera-off"}`}>
      <div className="remote-video">
        <ChudoLogo className="remote-logo" square/>
        <div><strong>{call.name}</strong><span>{connected ? `${time} · ${quality === "good" ? "связь стабильна" : "низкая скорость"}` : "Демо-соединение…"}</span></div>
      </div>
      <div className="self-video"><ChudoLogo square/><span>Вы · {frontCamera ? "передняя" : "основная"}</span></div>
    </div> : <div className="audio-stage">
      <div className="call-avatar"><ChudoLogo/></div>
      <h2>{call.name}</h2>
      <p>{connected ? `${time} · ${quality === "good" ? "стабильная сеть" : "низкая скорость"}` : "Имитируем прямое соединение…"}</p>
      <div className="audio-pulse"><i/><i/><i/><i/><i/></div>
    </div>}

    <button className="call-security" onClick={() => setQuality(quality === "good" ? "low" : "good")}><Icon name="signal" size={15}/> {quality === "good" ? "Демо E2E · хорошее качество" : "Низкая скорость · доступен audio fallback"}</button>
    <div className="call-controls">
      <button className={muted ? "off" : ""} onClick={() => setMuted(!muted)} aria-label={muted ? "Включить микрофон" : "Выключить микрофон"}><span><Icon name="mic"/></span><small>{muted ? "Включить" : "Микрофон"}</small></button>
      {kind === "video" && <button className={!camera ? "off" : ""} onClick={() => setCamera(!camera)} aria-label="Камера"><span><Icon name="video"/></span><small>Камера</small></button>}
      {kind === "video" && <button onClick={() => setFrontCamera(!frontCamera)} aria-label="Сменить камеру"><span><Icon name="rotate"/></span><small>Повернуть</small></button>}
      {kind === "audio" && <button onClick={switchKind} aria-label="Перейти в видеорежим"><span><Icon name="video"/></span><small>Включить видео</small></button>}
      {kind === "video" && <button onClick={switchKind} aria-label="Перейти в аудиорежим"><span><Icon name="phone"/></span><small>Только аудио</small></button>}
      <button className={!speaker ? "off" : ""} onClick={() => setSpeaker(!speaker)} aria-label="Динамик"><span><Icon name="speaker"/></span><small>{speaker ? "Динамик" : "Телефон"}</small></button>
      <button className="hangup" onClick={end} aria-label="Завершить звонок"><span><Icon name="phone"/></span><small>Завершить</small></button>
    </div>
    <p className="call-demo-note">Камера и микрофон не запрашиваются. Таймер, качество и соединение имитируются только для проверки дизайна.</p>
  </div>;
}

function SheetHead({ title, close }: { title:string; close:()=>void }) { return <div className="sheet-head"><h2>{title}</h2><button onClick={close} aria-label="Закрыть">×</button></div>; }

function CapabilityBanner({ icon, title, text }: { icon:string; title:string; text:string }) {
  return <div className="capability-banner"><i><Icon name={icon} size={18}/></i><span><strong>{title}</strong><small>{text}</small></span><em>ДЕМО</em></div>;
}
