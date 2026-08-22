"use client";

import { useState } from "react";

type Tab = "home" | "chats" | "actions" | "wallet" | "security";
type Modal = null | "send" | "receive" | "scan";

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
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
};

const activity = [
  { icon: "Ю", title: "Юрий Волков", note: "Получено", value: "+128 CHUDO", time: "10:42", positive: true },
  { icon: "A", title: "Александр", note: "Отправлено", value: "−40 CHUDO", time: "Вчера", positive: false },
  { icon: "N", title: "Награда сети", note: "Микро-узел", value: "+3,82 CHUDO", time: "Вчера", positive: true },
];

const chats = [
  { avatar: "Ю", name: "Юрий Волков", text: "Перевод получил, спасибо!", time: "10:44", unread: 2, online: true },
  { avatar: "A", name: "Александр", text: "Всё работает напрямую 👍", time: "09:18", unread: 0, online: true },
  { avatar: "М", name: "Мария", text: "Фото", time: "Вчера", unread: 0, online: false },
  { avatar: "C", name: "CHUDO Community", text: "Новая версия узла доступна", time: "Пн", unread: 5, online: false },
];

export default function Home() {
  const [tab, setTab] = useState<Tab>("home");
  const [hidden, setHidden] = useState(false);
  const [modal, setModal] = useState<Modal>(null);
  const [sendStep, setSendStep] = useState(0);
  const [amount, setAmount] = useState("40");
  const [recipient, setRecipient] = useState("Александр");
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const openSend = () => { setModal("send"); setSendStep(0); };
  const closeModal = () => { setModal(null); setSendStep(0); };
  const notify = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(""), 2200); };

  const go = (next: Tab) => { setSelectedChat(null); setTab(next); };

  return (
    <main className="stage">
      <section className="app-shell" aria-label="Интерактивный прототип приложения CHUDO">
        <header className="topbar">
          <button className="avatar" aria-label="Открыть профиль" onClick={() => notify("Профиль Юрия")}>ЮЧ<span /></button>
          <div className="brand"><ChudoLogo/><strong>CHUDO</strong></div>
          <button className="icon-button" aria-label="Уведомления" onClick={() => notify("Новых уведомлений нет")}><Icon name="bell" /></button>
        </header>

        <div className="content">
          {tab === "home" && <HomeScreen hidden={hidden} setHidden={setHidden} openSend={openSend} openModal={setModal} go={go} />}
          {tab === "chats" && <ChatsScreen selectedChat={selectedChat} setSelectedChat={setSelectedChat} openSend={openSend} notify={notify} />}
          {tab === "wallet" && <WalletScreen hidden={hidden} setHidden={setHidden} openSend={openSend} openModal={setModal} />}
          {tab === "security" && <SecurityScreen hidden={hidden} setHidden={setHidden} notify={notify} />}
          {tab === "actions" && <ActionScreen close={() => go("home")} go={go} openSend={openSend} openModal={setModal} />}
        </div>

        <nav className="bottom-nav" aria-label="Главная навигация">
          <button className={tab === "home" ? "active" : ""} onClick={() => go("home")}><Icon name="home"/><span>Главная</span></button>
          <button className={tab === "chats" ? "active" : ""} onClick={() => go("chats")}><Icon name="chat"/><span>Чаты</span></button>
          <button className="center-action" onClick={() => go("actions")} aria-label="Открыть действия"><span><ChudoLogo/><b>+</b></span><em>CHUDO</em></button>
          <button className={tab === "wallet" ? "active" : ""} onClick={() => go("wallet")}><Icon name="wallet"/><span>Кошелёк</span></button>
          <button className={tab === "security" ? "active" : ""} onClick={() => go("security")}><Icon name="shield"/><span>Защита</span></button>
        </nav>

        {modal && <ModalLayer modal={modal} close={closeModal} step={sendStep} setStep={setSendStep} amount={amount} setAmount={setAmount} recipient={recipient} setRecipient={setRecipient} notify={notify} />}
        {notice && <div className="toast" role="status"><Icon name="check" size={17}/>{notice}</div>}
      </section>
      <aside className="prototype-note"><span>Интерактивный прототип</span><strong>CHUDO mobile</strong><p>Собственный дизайн: скорость Revolut, понятность IKO и суверенная архитектура CHUDO.</p><div><b /> Нажимайте кнопки — все главные экраны работают.</div></aside>
    </main>
  );
}

function HomeScreen({ hidden, setHidden, openSend, openModal, go }: { hidden:boolean; setHidden:(v:boolean)=>void; openSend:()=>void; openModal:(v:Modal)=>void; go:(v:Tab)=>void }) {
  const actions = [
    { label: "Отправить", icon: "send", run: openSend },
    { label: "Получить", icon: "receive", run: () => openModal("receive") },
    { label: "Сканировать", icon: "scan", run: () => openModal("scan") },
    { label: "Ещё", icon: "plus", run: () => go("actions") },
  ];
  return <div className="screen home-screen">
    <div className="greeting"><span>Доброе утро, Юрий</span><em><b /> Сеть работает</em></div>
    <section className="balance-card">
      <div className="balance-head"><span>Общий баланс</span><button onClick={() => setHidden(!hidden)} aria-label="Показать или скрыть баланс"><Icon name="eye" size={19}/></button></div>
      <div className="balance">{hidden ? "••••••" : "12 840,62"}<small>CHUDO</small></div>
      <div className="fiat">≈ {hidden ? "••••" : "12 840,62"} EUR <span>Демо</span></div>
      <div className="balance-line" />
      <div className="balance-foot"><span><Icon name="shield" size={16}/> Ключи только на устройстве</span><button onClick={() => go("security")}>Подробнее <Icon name="arrow" size={15}/></button></div>
    </section>
    <section className="quick-grid" aria-label="Быстрые действия">
      {actions.map((action) => <button key={action.label} onClick={action.run}><i><Icon name={action.icon}/></i><span>{action.label}</span></button>)}
    </section>
    <button className="network-card" onClick={() => go("security") }>
      <span className="network-icon"><Icon name="network"/></span><span><strong>CHUDO работает напрямую</strong><small>8 узлов рядом · синхронизировано</small></span><Icon name="arrow" size={18}/>
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

function ChatsScreen({ selectedChat, setSelectedChat, openSend, notify }: { selectedChat:string|null; setSelectedChat:(v:string|null)=>void; openSend:()=>void; notify:(v:string)=>void }) {
  if (selectedChat) return <div className="screen chat-detail">
    <div className="chat-header"><button onClick={() => setSelectedChat(null)} aria-label="Назад"><Icon name="back"/></button><div className="chat-mini-avatar">Ю<span /></div><div><strong>{selectedChat}</strong><small>в сети · защищено</small></div><button onClick={() => notify("Звонки будут добавлены после стабилизации")} aria-label="Позвонить">⌕</button></div>
    <div className="encryption-note"><Icon name="lock" size={14}/> Сквозное шифрование · прямое соединение</div>
    <div className="messages">
      <div className="bubble received">Привет! Проверяем перевод через CHUDO?<time>10:38</time></div>
      <div className="bubble sent">Да, отправляю сейчас.<time>10:40 ✓✓</time></div>
      <button className="payment-message" onClick={openSend}><i><Icon name="receive"/></i><span><small>ПОЛУЧЕНО</small><strong>+128 CHUDO</strong><em>Подтверждено сетью</em></span><Icon name="arrow"/></button>
      <div className="bubble received">Перевод получил, спасибо!<time>10:44</time></div>
    </div>
    <div className="composer"><button onClick={openSend} aria-label="Добавить платёж">+</button><span>Сообщение</span><button onClick={() => notify("Демо-сообщение отправлено")} aria-label="Отправить сообщение"><Icon name="send"/></button></div>
  </div>;

  return <div className="screen list-screen">
    <div className="screen-heading"><div><small>Защищённая связь</small><h1>Чаты</h1></div><button aria-label="Поиск"><Icon name="search"/></button></div>
    <label className="search-box"><Icon name="search" size={18}/><input aria-label="Поиск по чатам" placeholder="Поиск людей и сообщений" /></label>
    <div className="chat-filter"><button className="active">Все</button><button>Непрочитанные</button><button>Контакты</button></div>
    <div className="chat-list">{chats.map(chat => <button key={chat.name} onClick={() => setSelectedChat(chat.name)}>
      <span className="chat-avatar">{chat.avatar}{chat.online && <i />}</span><span className="chat-copy"><strong>{chat.name}</strong><small>{chat.text}</small></span><span className="chat-meta"><time>{chat.time}</time>{chat.unread > 0 && <b>{chat.unread}</b>}</span>
    </button>)}</div>
    <button className="floating-compose" onClick={() => notify("Выберите контакт для нового чата")} aria-label="Новый чат"><Icon name="chat"/><span>+</span></button>
  </div>;
}

function WalletScreen({ hidden, setHidden, openSend, openModal }: { hidden:boolean; setHidden:(v:boolean)=>void; openSend:()=>void; openModal:(v:Modal)=>void }) {
  return <div className="screen wallet-screen">
    <div className="screen-heading"><div><small>Ваши средства</small><h1>Кошелёк</h1></div><button onClick={() => setHidden(!hidden)} aria-label="Скрыть баланс"><Icon name="eye"/></button></div>
    <section className="wallet-hero"><div className="coin-mark"><ChudoLogo/></div><span>Доступно</span><strong>{hidden ? "••••••" : "12 840,62"}<small> CHUDO</small></strong><em>≈ {hidden ? "••••" : "12 840,62"} EUR · демо-курс</em></section>
    <div className="wallet-actions"><button onClick={openSend}><Icon name="send"/><span>Отправить</span></button><button onClick={() => openModal("receive")}><Icon name="receive"/><span>Получить</span></button><button onClick={() => openModal("scan")}><Icon name="scan"/><span>QR-код</span></button></div>
    <div className="ownership-card"><Icon name="key"/><div><strong>Только вы управляете средствами</strong><span>CHUDO не хранит ключи и не может заморозить баланс</span></div></div>
    <section className="section-block"><div className="section-title"><h2>История</h2><button>Фильтр</button></div><ActivityList /></section>
  </div>;
}

function SecurityScreen({ hidden, setHidden, notify }: { hidden:boolean; setHidden:(v:boolean)=>void; notify:(v:string)=>void }) {
  const items = [
    { icon:"lock", title:"Вход и подтверждения", note:"PIN · рисунок · пароль устройства", status:"Защищено" },
    { icon:"key", title:"Ключи и устройства", note:"1 активное устройство", status:"Проверено" },
    { icon:"cloud", title:"Резервная копия", note:"Зашифрована локально", status:"Готово" },
    { icon:"network", title:"Сеть и соединения", note:"8 узлов · прямой маршрут", status:"В сети" },
  ];
  return <div className="screen security-screen">
    <div className="screen-heading"><div><small>Центр доверия</small><h1>Защита</h1></div><div className="secure-badge"><Icon name="shield" size={18}/> 96%</div></div>
    <section className="security-hero"><div className="shield-orbit"><Icon name="shield" size={38}/></div><div><strong>Высокий уровень защиты</strong><span>Ключи находятся только на этом устройстве</span></div></section>
    <div className="exact-auth"><Icon name="info" size={18}/><span><strong>Одно подтверждение — одна операция</strong><small>Каждый перевод подтверждается отдельно системным экраном Android.</small></span></div>
    <div className="settings-list">{items.map(item => <button key={item.title} onClick={() => notify(`${item.title}: ${item.status}`)}><i><Icon name={item.icon}/></i><span><strong>{item.title}</strong><small>{item.note}</small></span><em>{item.status}</em><Icon name="arrow" size={17}/></button>)}</div>
    <div className="privacy-toggle"><span><strong>Скрывать суммы</strong><small>На главном экране и в кошельке</small></span><button className={hidden ? "on" : ""} onClick={() => setHidden(!hidden)} aria-label="Скрывать суммы"><i /></button></div>
    <p className="security-foot"><Icon name="lock" size={15}/> Без биометрии по умолчанию. Используется защищённый PIN, рисунок или пароль вашего телефона.</p>
  </div>;
}

function ActionScreen({ close, go, openSend, openModal }: { close:()=>void; go:(v:Tab)=>void; openSend:()=>void; openModal:(v:Modal)=>void }) {
  return <div className="screen action-screen">
    <button className="close-action" onClick={close} aria-label="Закрыть">×</button><div className="action-brand"><ChudoLogo/></div><h1>Что хотите сделать?</h1><p>Деньги и сообщения — в одном безопасном месте</p>
    <div className="action-list">
      <button onClick={() => go("chats")}><i><Icon name="chat"/></i><span><strong>Написать</strong><small>Начать защищённый чат</small></span><Icon name="arrow"/></button>
      <button onClick={() => openModal("scan")}><i><Icon name="scan"/></i><span><strong>Сканировать</strong><small>QR-код контакта или платежа</small></span><Icon name="arrow"/></button>
      <button onClick={openSend}><i><Icon name="send"/></i><span><strong>Отправить CHUDO</strong><small>Контакту или по адресу</small></span><Icon name="arrow"/></button>
      <button onClick={() => openModal("receive")}><i><Icon name="receive"/></i><span><strong>Получить</strong><small>Показать свой QR-код</small></span><Icon name="arrow"/></button>
    </div><div className="local-note"><Icon name="lock" size={17}/> Приложение не хранит ваши ключи на сервере</div>
  </div>;
}

function ModalLayer({ modal, close, step, setStep, amount, setAmount, recipient, setRecipient, notify }: { modal:Exclude<Modal,null>; close:()=>void; step:number; setStep:(v:number)=>void; amount:string; setAmount:(v:string)=>void; recipient:string; setRecipient:(v:string)=>void; notify:(v:string)=>void }) {
  if (modal === "receive") return <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="sheet receive-sheet"><SheetHead title="Получить CHUDO" close={close}/><div className="qr"><div className="qr-grid">{Array.from({length:49},(_,i)=><i key={i} className={[0,1,2,7,9,14,15,16,32,33,34,40,41,42,48,24,30,18].includes(i)?"dark":""}/>)}</div><span className="qr-coin"><ChudoLogo/></span></div><strong className="receive-name">Юрий Чудинович</strong><p className="address">chudoacct1q7k…9mx4p</p><button className="primary-button" onClick={() => notify("Адрес скопирован")}><Icon name="copy" size={18}/> Скопировать адрес</button><div className="sheet-note"><Icon name="info" size={17}/> Отправляйте на этот адрес только CHUDO</div></div></div>;
  if (modal === "scan") return <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="sheet scan-sheet"><SheetHead title="Сканировать" close={close}/><p>Наведите камеру на QR-код CHUDO</p><div className="scanner"><i/><i/><i/><i/><div className="scan-line"/><div className="scan-mark">C</div></div><button className="secondary-button" onClick={() => notify("Галерея открыта в демо-режиме")}>Выбрать из галереи</button><div className="sheet-note"><Icon name="shield" size={17}/> Перед оплатой вы увидите получателя, сумму и комиссию</div></div></div>;

  return <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="sheet send-sheet">
    <SheetHead title={step === 0 ? "Отправить CHUDO" : step === 1 ? "Проверка перевода" : step === 2 ? "Подтверждение" : "Готово"} close={close}/>
    {step === 0 && <><label className="field"><span>Получатель</span><input value={recipient} onChange={e=>setRecipient(e.target.value)} /></label><div className="contact-chips">{["Александр","Юрий Волков","Мария"].map(name=><button className={recipient===name?"active":""} key={name} onClick={()=>setRecipient(name)}>{name[0]}<span>{name}</span></button>)}</div><label className="field amount-field"><span>Сумма</span><div><input inputMode="decimal" value={amount} onChange={e=>setAmount(e.target.value.replace(/[^0-9.,]/g,""))}/><b>CHUDO</b></div></label><div className="available">Доступно: 12 840,62 CHUDO</div><button className="primary-button" disabled={!amount || !recipient} onClick={()=>setStep(1)}>Продолжить</button></>}
    {step === 1 && <><div className="review-person"><span>{recipient[0] || "?"}</span><small>Вы отправляете</small><strong>{recipient}</strong></div><div className="review-amount">{amount} <small>CHUDO</small></div><div className="review-table"><span>Получатель получит<b>{amount} CHUDO</b></span><span>Комиссия сети<b>0,02 CHUDO</b></span><span>Ожидаемое время<b>≈ 2 секунды</b></span><span>Итого<b>{(Number(amount.replace(",",".")) + .02).toFixed(2)} CHUDO</b></span></div><button className="primary-button" onClick={()=>setStep(2)}>Подтвердить перевод</button><button className="text-button" onClick={()=>setStep(0)}>Изменить данные</button></>}
    {step === 2 && <div className="auth-step"><div className="auth-icon"><Icon name="lock" size={34}/></div><h2>Подтвердите на устройстве</h2><p>Android откроет защищённый системный экран. Используйте PIN, рисунок или пароль телефона.</p><div className="exact-operation"><small>ТОЧНАЯ ОПЕРАЦИЯ</small><strong>{amount} CHUDO → {recipient}</strong><span>Одно подтверждение действует только для этого перевода</span></div><button className="primary-button" onClick={()=>setStep(3)}>Имитировать подтверждение</button><button className="text-button" onClick={close}>Отменить</button></div>}
    {step === 3 && <div className="success-step"><div className="success-check"><Icon name="check" size={42}/></div><h2>Перевод отправлен</h2><p>{amount} CHUDO для {recipient}</p><div className="receipt"><span>Статус<b>Подтверждено сетью</b></span><span>Комиссия<b>0,02 CHUDO</b></span><span>Квитанция<b>CHD-8F21-A7</b></span></div><button className="primary-button" onClick={close}>Готово</button></div>}
  </div></div>;
}

function SheetHead({ title, close }: { title:string; close:()=>void }) { return <div className="sheet-head"><h2>{title}</h2><button onClick={close} aria-label="Закрыть">×</button></div>; }
