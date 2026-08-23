export type DemoView = "welcome" | "home" | "wallet" | "market" | "chats" | "calls" | "portfolio" | "mining" | "security" | "documents" | "settings";
export type ChatFilter = "all" | "unread" | "contacts";
export type CentralAction = "write" | "scan" | "send" | "receive";

export const PRIVACY_AMOUNT_MASK = "••••";

export const mobileNavigationContract = [
  { id: "home", label: "Главная", icon: "home", view: "home" },
  { id: "chats", label: "Чаты", icon: "chat", view: "chats" },
  { id: "action", label: "CHUDO", icon: "plus", view: null },
  { id: "wallet", label: "Кошелёк", icon: "wallet", view: "wallet" },
  { id: "security", label: "Защита", icon: "shield", view: "security" },
] as const satisfies ReadonlyArray<{ id: string; label: string; icon: string; view: DemoView | null }>;

export const centralChudoActions = [
  { id: "write", label: "Написать", icon: "chat" },
  { id: "scan", label: "Сканировать", icon: "qr" },
  { id: "send", label: "Отправить", icon: "send" },
  { id: "receive", label: "Получить", icon: "receive" },
] as const satisfies ReadonlyArray<{ id: CentralAction; label: string; icon: string }>;

export const secondaryMobileDestinations = [
  { view: "market", label: "Рынок", icon: "market", note: "Симулированные торговые пары" },
  { view: "calls", label: "Звонки", icon: "phone", note: "История и demo call UI" },
  { view: "portfolio", label: "Портфель", icon: "trend", note: "Личные simulated allocation и performance" },
  { view: "mining", label: "Пул майнинга", icon: "miner", note: "Desktop-first demo dashboard" },
  { view: "documents", label: "Документы", icon: "document", note: "Локальные статические материалы" },
  { view: "settings", label: "Настройки / Помощь", icon: "settings", note: "Локальные параметры и FAQ" },
] as const satisfies ReadonlyArray<{ view: DemoView; label: string; icon: string; note: string }>;

export type TimeoutOwner = number | null;

export function replaceOwnedTimeout(
  current: TimeoutOwner,
  clear: (id: number) => void,
  schedule: (callback: () => void, delay: number) => number,
  callback: () => void,
  delay: number,
): number {
  if (current !== null) clear(current);
  return schedule(callback, delay);
}

export function protectUserAmount(hidden: boolean, visibleValue: string): string {
  return hidden ? PRIVACY_AMOUNT_MASK : visibleValue;
}

export function clipboardNotice(succeeded: boolean): string {
  return succeeded
    ? "Демонстрационный идентификатор скопирован"
    : "Не удалось скопировать demo-идентификатор. Буфер обмена недоступен.";
}

export function filterDemoChats<T extends { id: string; name: string; message: string; unread: number }>(
  chats: readonly T[],
  query: string,
  filter: ChatFilter,
): T[] {
  const normalizedQuery = query.trim().toLocaleLowerCase("ru");
  return chats.filter(chat => {
    const matchesQuery = normalizedQuery === "" || `${chat.name} ${chat.message}`.toLocaleLowerCase("ru").includes(normalizedQuery);
    const matchesFilter = filter === "all" || (filter === "unread" ? chat.unread > 0 : chat.id !== "community");
    return matchesQuery && matchesFilter;
  });
}

export function getContainedFocusIndex(
  currentIndex: number,
  focusableCount: number,
  backwards: boolean,
): number | null {
  if (focusableCount <= 0) return null;
  if (currentIndex < 0) return backwards ? focusableCount - 1 : 0;
  if (backwards && currentIndex === 0) return focusableCount - 1;
  if (!backwards && currentIndex === focusableCount - 1) return 0;
  return null;
}
