"use client";

import { useState } from "react";

type Tab = "home" | "chats" | "actions" | "wallet" | "security";

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
    network: <><circle cx="12" cy="5" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/><path d="m11 7-4 9M13 7l4 9M8 18h8"/></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
};

const quickActions = [
  { label: "Отправить", icon: "send" },
  { label: "Получить", icon: "receive" },
  { label: "Сканировать", icon: "scan" },
  { label: "Ещё", icon: "plus" },
];

const activity = [
  { icon: "Ю", title: "Юрий Волков", note: "Получено", value: "+128 CHUDO", time: "10:42", positive: true },
  { icon: "A", title: "Александр", note: "Отправлено", value: "−40 CHUDO", time: "Вчера", positive: false },
  { icon: "N", title: "Награда сети", note: "Микро-узел", value: "+3,82 CHUDO", time: "Вчера", positive: true },
];

export default function Home() {
  const [tab, setTab] = useState<Tab>("home");
  const [hidden, setHidden] = useState(false);

  return (
    <main className="stage">
      <section className="app-shell" aria-label="Прототип приложения CHUDO">
        <header className="topbar">
          <button className="avatar" aria-label="Открыть профиль">ЮЧ<span /></button>
          <div className="brand"><i>C</i><strong>CHUDO</strong></div>
          <button className="icon-button" aria-label="Уведомления"><Icon name="bell" /></button>
        </header>

        <div className="content">
          {tab === "home" && (
            <div className="screen home-screen">
              <div className="greeting"><span>Доброе утро, Юрий</span><em><b /> Сеть работает</em></div>
              <section className="balance-card">
                <div className="balance-head"><span>Общий баланс</span><button onClick={() => setHidden(!hidden)} aria-label="Показать или скрыть баланс"><Icon name="eye" size={19}/></button></div>
                <div className="balance">{hidden ? "••••••" : "12 840,62"}<small>CHUDO</small></div>
                <div className="fiat">≈ {hidden ? "••••" : "12 840,62"} EUR <span>Демо</span></div>
                <div className="balance-line" />
                <div className="balance-foot"><span><Icon name="shield" size={16}/> Ключи только на устройстве</span><button>Подробнее <Icon name="arrow" size={15}/></button></div>
              </section>

              <section className="quick-grid" aria-label="Быстрые действия">
                {quickActions.map((action) => <button key={action.label} onClick={() => setTab("actions")}><i><Icon name={action.icon}/></i><span>{action.label}</span></button>)}
              </section>

              <section className="network-card">
                <div className="network-icon"><Icon name="network"/></div>
                <div><strong>CHUDO работает напрямую</strong><span>8 узлов рядом · синхронизировано</span></div>
                <button aria-label="Открыть состояние сети"><Icon name="arrow" size={18}/></button>
              </section>

              <section className="section-block">
                <div className="section-title"><h2>Последние операции</h2><button onClick={() => setTab("wallet")}>Все</button></div>
                <div className="activity-list">
                  {activity.map((item) => <div className="activity-row" key={item.title}>
                    <div className={`activity-avatar ${item.icon === "N" ? "node" : ""}`}>{item.icon}</div>
                    <div className="activity-copy"><strong>{item.title}</strong><span>{item.note} · {item.time}</span></div>
                    <div className={`activity-value ${item.positive ? "positive" : ""}`}>{item.value}</div>
                  </div>)}
                </div>
              </section>
            </div>
          )}

          {tab !== "home" && tab !== "actions" && (
            <div className="screen placeholder-screen">
              <div className="placeholder-icon"><Icon name={tab === "chats" ? "chat" : tab === "wallet" ? "wallet" : "shield"} size={34}/></div>
              <h1>{tab === "chats" ? "Чаты" : tab === "wallet" ? "Кошелёк" : "Защита"}</h1>
              <p>Этот раздел уже собирается в цельный интерактивный сценарий CHUDO.</p>
            </div>
          )}

          {tab === "actions" && (
            <div className="screen action-screen">
              <button className="close-action" onClick={() => setTab("home")} aria-label="Закрыть">×</button>
              <div className="action-brand">C</div>
              <h1>Что хотите сделать?</h1>
              <p>Деньги и сообщения — в одном безопасном месте</p>
              <div className="action-list">
                <button><i><Icon name="chat"/></i><span><strong>Написать</strong><small>Начать защищённый чат</small></span><Icon name="arrow"/></button>
                <button><i><Icon name="scan"/></i><span><strong>Сканировать</strong><small>QR-код контакта или платежа</small></span><Icon name="arrow"/></button>
                <button><i><Icon name="send"/></i><span><strong>Отправить CHUDO</strong><small>Контакту или по адресу</small></span><Icon name="arrow"/></button>
                <button><i><Icon name="receive"/></i><span><strong>Получить</strong><small>Показать свой QR-код</small></span><Icon name="arrow"/></button>
              </div>
              <div className="local-note"><Icon name="lock" size={17}/> Приложение не хранит ваши ключи на сервере</div>
            </div>
          )}
        </div>

        <nav className="bottom-nav" aria-label="Главная навигация">
          <button className={tab === "home" ? "active" : ""} onClick={() => setTab("home")}><Icon name="home"/><span>Главная</span></button>
          <button className={tab === "chats" ? "active" : ""} onClick={() => setTab("chats")}><Icon name="chat"/><span>Чаты</span></button>
          <button className="center-action" onClick={() => setTab("actions")} aria-label="Открыть действия"><span><b>+</b></span><em>CHUDO</em></button>
          <button className={tab === "wallet" ? "active" : ""} onClick={() => setTab("wallet")}><Icon name="wallet"/><span>Кошелёк</span></button>
          <button className={tab === "security" ? "active" : ""} onClick={() => setTab("security")}><Icon name="shield"/><span>Защита</span></button>
        </nav>
      </section>
      <aside className="prototype-note"><span>Интерактивный прототип</span><strong>CHUDO mobile</strong><p>Собственный дизайн на основе лучших приёмов Revolut и IKO.</p></aside>
    </main>
  );
}
