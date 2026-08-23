import type { DemoView } from "./ui-contracts";
import {
  screenImplementationById,
  screenImplementationRegistry,
  type ImplementationKind,
  type ScreenStatus,
} from "./screen-implementation-registry.ts";

export type { ImplementationKind, ScreenStatus } from "./screen-implementation-registry.ts";

export type ScreenTarget = {
  familyId: string;
  familyName: string;
  screenId: string;
  referenceName: string;
  chudoName: string;
  route: string;
  view: DemoView;
  status: ScreenStatus;
  note: string;
  implementationKind: ImplementationKind;
  componentKey: string;
  semanticKey: string;
  interactionKey: string;
  publicReady: boolean;
};

type TargetSeed = readonly [screenId: string, referenceName: string, chudoName: string, route: string, view: DemoView];

const familyNotes: Record<string, string> = {
  "01": "Локальный onboarding без ключей, identity material или secure storage.",
  "02": "Спокойная банковская иерархия с фиксированными demo-данными.",
  "03": "Локальные сообщения и UI-состояния звонка без media backend.",
  "04": "Точные minor units и симулированные операции без кошелька или подписи.",
  "05": "Pair-specific simulated fixtures без ликвидности, matching или settlement.",
  "06": "Личный demo-портфель с симулированными allocation и performance.",
  "07": "Симулированная панель без pool endpoint и реального mining runtime.",
  "08": "Честные статусы unavailable; ключи и production-защита не создаются.",
  "09": "Локальные статические материалы без генерации или загрузки документов.",
  "10": "Локальные настройки и справка без аккаунтного backend.",
};

function makeFamily(familyId: string, familyName: string, seeds: readonly TargetSeed[]): ScreenTarget[] {
  return seeds.map(([screenId, referenceName, chudoName, route, view]) => {
    const implementation = screenImplementationById.get(screenId);
    if (!implementation) throw new Error(`Missing explicit implementation registry entry for ${screenId}`);
    if (implementation.route !== route) throw new Error(`Registry route mismatch for ${screenId}: ${implementation.route} !== ${route}`);
    return {
      familyId,
      familyName,
      referenceName,
      chudoName,
      view,
      note: familyNotes[familyId],
      ...implementation,
    };
  });
}

export const screenCatalog: readonly ScreenTarget[] = [
  ...makeFamily("01", "ONBOARDING_AND_ACCESS", [
    ["01.01", "Splash", "Заставка CHUDO", "/splash", "welcome"],
    ["01.02", "Welcome / Добро пожаловать", "Добро пожаловать в CHUDO", "/welcome", "welcome"],
    ["01.03", "Create account", "Создать demo-профиль", "/access/create-account", "welcome"],
    ["01.04", "Import / Recovery", "Импорт и recovery — demo", "/access/recovery", "welcome"],
    ["01.05", "Create PIN", "Создать demo PIN", "/access/create-pin", "welcome"],
    ["01.06", "Enter PIN", "Ввести demo PIN", "/access/enter-pin", "welcome"],
    ["01.07", "Permissions", "Разрешения прототипа", "/access/permissions", "welcome"],
  ]),
  ...makeFamily("02", "HOME", [
    ["02.01", "Main dashboard", "Главная", "/home", "home"],
    ["02.02", "Promo / important notification card", "Важное уведомление", "/home/promo", "home"],
    ["02.03", "Quick actions", "Быстрые действия", "/home/quick-actions", "home"],
    ["02.04", "Favorites / selected items", "Избранное", "/home/favorites", "home"],
    ["02.05", "Favorites empty state", "Избранное — пусто", "/home/favorites-empty", "home"],
    ["02.06", "Notification center entry", "Вход в центр уведомлений", "/home/notification-entry", "home"],
  ]),
  ...makeFamily("03", "CHATS_AND_CALLS", [
    ["03.01", "Chat list", "Чаты", "/chats", "chats"],
    ["03.02", "Chat search", "Поиск по чатам", "/chats/search", "chats"],
    ["03.03", "Chat filters", "Фильтры чатов", "/chats/filters", "chats"],
    ["03.04", "Conversation", "Диалог с Юрием", "/chats/yuri", "chats"],
    ["03.05", "Attachment sheet", "Добавить вложение", "/chats/yuri/attachments", "chats"],
    ["03.06", "Image/file attachment state", "Demo-вложение", "/chats/yuri/attachment-preview", "chats"],
    ["03.07", "Payment card inside chat", "Платёж в чате", "/chats/yuri/payment", "chats"],
    ["03.08", "Audio call", "Аудиозвонок", "/calls/audio", "calls"],
    ["03.09", "Video call", "Видеозвонок", "/calls/video", "calls"],
    ["03.10", "Incoming call", "Входящий demo-звонок", "/calls/incoming", "calls"],
    ["03.11", "Outgoing/calling", "Исходящий вызов", "/calls/outgoing", "calls"],
    ["03.12", "Ringing", "Идёт вызов", "/calls/ringing", "calls"],
    ["03.13", "Connecting", "Соединяем", "/calls/connecting", "calls"],
    ["03.14", "Connected", "Demo-соединение", "/calls/connected", "calls"],
    ["03.15", "Reconnecting", "Восстановление связи", "/calls/reconnecting", "calls"],
    ["03.16", "Failed", "Соединение не удалось", "/calls/failed", "calls"],
    ["03.17", "Ended", "Звонок завершён", "/calls/ended", "calls"],
    ["03.18", "Minimized call", "Свёрнутый звонок", "/calls/minimized", "calls"],
    ["03.19", "Call history", "История звонков", "/calls", "calls"],
  ]),
  ...makeFamily("04", "WALLET", [
    ["04.01", "Wallet overview", "Кошелёк", "/wallet", "wallet"],
    ["04.02", "Balance", "Демо-баланс", "/wallet/balance", "wallet"],
    ["04.03", "Asset list", "Активы", "/wallet/assets", "wallet"],
    ["04.04", "CHUDO asset detail", "Актив CHUDO", "/wallet/chudo", "wallet"],
    ["04.05", "Asset chart", "График CHUDO", "/wallet/chudo/chart", "wallet"],
    ["04.06", "Transaction history", "История операций", "/wallet/transactions", "wallet"],
    ["04.07", "Transaction detail", "Детали demo-операции", "/wallet/transaction/tx-received-128", "wallet"],
    ["04.08", "Send", "Отправить CHUDO", "/wallet/send", "wallet"],
    ["04.09", "Send validation", "Проверка суммы", "/wallet/send/validation", "wallet"],
    ["04.10", "Send review", "Review перевода", "/wallet/send/review", "wallet"],
    ["04.11", "Operation confirmation", "Подтверждение demo-операции", "/wallet/send/confirmation", "wallet"],
    ["04.12", "Send receipt", "Демо-квитанция", "/wallet/send/receipt", "wallet"],
    ["04.13", "Receive", "Получить CHUDO", "/wallet/receive", "wallet"],
    ["04.14", "QR display", "Demo QR", "/wallet/receive/qr", "wallet"],
    ["04.15", "QR scanner demo", "QR-сканер — demo", "/wallet/scan", "wallet"],
    ["04.16", "Select recipient/contact", "Выбрать получателя", "/wallet/send/recipient", "wallet"],
  ]),
  ...makeFamily("05", "MARKET_AND_EXCHANGE", [
    ["05.01", "Market landing", "Рынок", "/market", "market"],
    ["05.02", "Search", "Поиск пар", "/market/search", "market"],
    ["05.03", "Filters", "Фильтры рынка", "/market/filters", "market"],
    ["05.04", "CHUDO/EUR pair", "CHUDO / EUR", "/market/chudo-eur", "market"],
    ["05.05", "CHUDO/BTC pair", "CHUDO / BTC", "/market/chudo-btc", "market"],
    ["05.06", "CHUDO/USDT pair", "CHUDO / USDT", "/market/chudo-usdt", "market"],
    ["05.07", "Asset/pair detail", "Детали пары", "/market/chudo-eur/detail", "market"],
    ["05.08", "Full price chart", "Полный график", "/market/chudo-eur/chart", "market"],
    ["05.09", "Chart periods", "Периоды графика", "/market/chudo-eur/periods", "market"],
    ["05.10", "Order book", "Книга заявок", "/market/chudo-eur/order-book", "market"],
    ["05.11", "Recent trades", "Последние сделки", "/market/chudo-eur/trades", "market"],
    ["05.12", "Buy", "Купить CHUDO", "/market/chudo-eur/buy", "market"],
    ["05.13", "Sell", "Продать CHUDO", "/market/chudo-eur/sell", "market"],
    ["05.14", "Swap / Exchange", "Обмен активов", "/market/swap", "market"],
    ["05.15", "Trade review", "Review заявки", "/market/chudo-eur/review", "market"],
    ["05.16", "Trade confirmation", "Подтверждение заявки", "/market/chudo-eur/confirmation", "market"],
    ["05.17", "Trade receipt", "Квитанция заявки", "/market/chudo-eur/receipt", "market"],
    ["05.18", "Open orders", "Открытые заявки", "/market/orders", "market"],
    ["05.19", "Order detail", "Детали заявки", "/market/order/demo-eur-01", "market"],
    ["05.20", "Cancel order", "Отмена demo-заявки", "/market/order/demo-eur-01/cancel", "market"],
    ["05.21", "Trade history", "История торговли", "/market/history", "market"],
    ["05.22", "Trade-history detail", "Детали сделки", "/market/history/demo-trade-01", "market"],
  ]),
  ...makeFamily("06", "PORTFOLIO", [
    ["06.01", "Portfolio overview", "Портфель", "/portfolio", "portfolio"],
    ["06.02", "Total portfolio value", "Стоимость портфеля", "/portfolio/value", "portfolio"],
    ["06.03", "Asset allocation", "Распределение активов", "/portfolio/allocation", "portfolio"],
    ["06.04", "Performance", "Динамика портфеля", "/portfolio/performance", "portfolio"],
    ["06.05", "Performance periods", "Периоды динамики", "/portfolio/performance/periods", "portfolio"],
    ["06.06", "Watchlist", "Список наблюдения", "/portfolio/watchlist", "portfolio"],
    ["06.07", "Watchlist empty state", "Список наблюдения — пусто", "/portfolio/watchlist-empty", "portfolio"],
    ["06.08", "Position detail", "Позиция CHUDO", "/portfolio/chudo", "portfolio"],
  ]),
  ...makeFamily("07", "MINING", [
    ["07.01", "Mining overview", "Пул майнинга", "/mining", "mining"],
    ["07.02", "Miner status", "Статус майнера", "/mining/miner-status", "mining"],
    ["07.03", "Pool status", "Статус пула", "/mining/pool-status", "mining"],
    ["07.04", "Current round / queue", "Текущий demo-round", "/mining/round", "mining"],
    ["07.05", "Workers", "Воркеры", "/mining/workers", "mining"],
    ["07.06", "Earnings", "Начисления", "/mining/earnings", "mining"],
    ["07.07", "Reward history", "История наград", "/mining/rewards", "mining"],
    ["07.08", "Reward detail", "Детали demo-награды", "/mining/reward/demo-round-48291", "mining"],
    ["07.09", "Connect miner", "Подключить майнер", "/mining/connect", "mining"],
    ["07.10", "Miner settings", "Настройки майнера", "/mining/settings", "mining"],
    ["07.11", "No-miner empty state", "Майнеры не подключены", "/mining/no-miner", "mining"],
  ]),
  ...makeFamily("08", "SECURITY", [
    ["08.01", "Security overview", "Защита", "/security", "security"],
    ["08.02", "Devices", "Устройства", "/security/devices", "security"],
    ["08.03", "Device detail", "Demo-устройство", "/security/device/demo-phone", "security"],
    ["08.04", "Active sessions", "Активные demo-сессии", "/security/sessions", "security"],
    ["08.05", "Session detail", "Детали demo-сессии", "/security/session/current", "security"],
    ["08.06", "Backups", "Резервные копии", "/security/backups", "security"],
    ["08.07", "Backup empty state", "Резервных копий нет", "/security/backups-empty", "security"],
    ["08.08", "Recovery", "Recovery — недоступно", "/security/recovery", "security"],
    ["08.09", "Operation confirmation", "Подтверждение действия", "/security/confirmation", "security"],
    ["08.10", "Trusted contacts", "Доверенные контакты", "/security/trusted-contacts", "security"],
    ["08.11", "Trusted contact detail", "Доверенный контакт", "/security/trusted-contact/yuri", "security"],
    ["08.12", "Security log", "Журнал статусов", "/security/log", "security"],
    ["08.13", "PIN / access settings", "PIN и доступ", "/security/pin", "security"],
    ["08.14", "Production-feature unavailable state", "Production-функция недоступна", "/security/unavailable", "security"],
  ]),
  ...makeFamily("09", "DOCUMENTS_AND_NOTIFICATIONS", [
    ["09.01", "Notification center", "Уведомления", "/notifications", "documents"],
    ["09.02", "Notification detail", "Детали уведомления", "/notifications/demo-notice", "documents"],
    ["09.03", "Documents", "Документы", "/documents", "documents"],
    ["09.04", "Document detail", "Документ CHUDO", "/documents/demo-overview", "documents"],
    ["09.05", "Statements", "Выписки", "/documents/statements", "documents"],
    ["09.06", "Statement detail", "Demo-выписка", "/documents/statement/august", "documents"],
    ["09.07", "Terms / Rules", "Условия и правила", "/documents/terms", "documents"],
    ["09.08", "Privacy", "Конфиденциальность", "/documents/privacy", "documents"],
    ["09.09", "Security information", "Информация о защите", "/documents/security", "documents"],
    ["09.10", "Legal", "Юридическая информация", "/documents/legal", "documents"],
    ["09.11", "Document empty state", "Документов пока нет", "/documents/empty", "documents"],
  ]),
  ...makeFamily("10", "SETTINGS_AND_SUPPORT", [
    ["10.01", "Profile", "Demo-профиль", "/profile", "settings"],
    ["10.02", "Settings home", "Настройки и помощь", "/settings", "settings"],
    ["10.03", "Limits", "Лимиты — demo", "/settings/limits", "settings"],
    ["10.04", "Language", "Язык", "/settings/language", "settings"],
    ["10.05", "Appearance", "Оформление", "/settings/appearance", "settings"],
    ["10.06", "Notification settings", "Настройки уведомлений", "/settings/notifications", "settings"],
    ["10.07", "Help / FAQ", "Помощь и FAQ", "/support/faq", "settings"],
    ["10.08", "Support", "Поддержка", "/support", "settings"],
    ["10.09", "About CHUDO", "О CHUDO", "/settings/about", "settings"],
    ["10.10", "Legal / Licenses", "Лицензии", "/settings/licenses", "settings"],
    ["10.11", "Application version", "Версия приложения", "/settings/version", "settings"],
    ["10.12", "Logout / exit demo", "Выйти из demo", "/settings/exit", "settings"],
  ]),
] as const;

if (screenImplementationRegistry.length !== screenCatalog.length) {
  throw new Error(`Implementation registry/catalog count mismatch: ${screenImplementationRegistry.length} !== ${screenCatalog.length}`);
}
for (const implementation of screenImplementationRegistry) {
  if (!screenCatalog.some(target => target.screenId === implementation.screenId && target.route === implementation.route)) {
    throw new Error(`Implementation registry entry has no catalog target: ${implementation.screenId}`);
  }
}

export const screenFamilies = [...new Set(screenCatalog.map(target => target.familyId))].map(familyId => {
  const targets = screenCatalog.filter(target => target.familyId === familyId);
  return {
    familyId,
    familyName: targets[0].familyName,
    firstScreenId: targets[0].screenId,
    lastScreenId: targets.at(-1)!.screenId,
    targetCount: targets.length,
  };
});

export function getScreenTarget(route: string): ScreenTarget | undefined {
  return screenCatalog.find(target => target.route === route);
}

export function getFamilyTargets(familyId: string): ScreenTarget[] {
  return screenCatalog.filter(target => target.familyId === familyId);
}

export function getScreenCoverageSummary() {
  const statuses = screenCatalog.reduce((summary, target) => {
    summary[target.status] += 1;
    return summary;
  }, {
    IMPLEMENTED: 0,
    ADAPTED_TO_CHUDO: 0,
    DEFERRED: 0,
    NOT_APPLICABLE_OWNER_APPROVAL_REQUIRED: 0,
  } satisfies Record<ScreenStatus, number>);
  return {
    accounted: screenCatalog.length,
    implemented: statuses.IMPLEMENTED,
    adapted: statuses.ADAPTED_TO_CHUDO,
    deferred: statuses.DEFERRED,
    ownerApprovalRequired: statuses.NOT_APPLICABLE_OWNER_APPROVAL_REQUIRED,
    dedicated: screenCatalog.filter(target => target.implementationKind === "DEDICATED_SCREEN").length,
    sharedSemantic: screenCatalog.filter(target => target.implementationKind === "SHARED_SEMANTIC_SCREEN").length,
    runtimeState: screenCatalog.filter(target => target.implementationKind === "RUNTIME_STATE").length,
    coveragePlaceholder: screenCatalog.filter(target => target.implementationKind === "COVERAGE_PLACEHOLDER").length,
    publicReady: screenCatalog.filter(target => target.publicReady).length,
  };
}
