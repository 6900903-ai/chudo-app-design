export type ChartPeriod = "1h" | "1d" | "1w" | "1m";
export type CallState = "calling" | "ringing" | "connecting" | "connected" | "reconnecting" | "ended" | "failed";

type TimerHandle = ReturnType<typeof globalThis.setTimeout>;

type CallScheduler = {
  setTimeout: (callback: () => void, delay: number) => TimerHandle;
  clearTimeout: (handle: TimerHandle) => void;
};

const defaultCallScheduler: CallScheduler = {
  setTimeout: (callback, delay) => globalThis.setTimeout(callback, delay),
  clearTimeout: handle => globalThis.clearTimeout(handle),
};

export function createCallStateMachine(
  onState: (state: CallState) => void,
  scheduler: CallScheduler = defaultCallScheduler,
) {
  let state: CallState = "calling";
  let closed = false;
  let ended = false;
  const timers = new Set<TimerHandle>();

  function clearTimers() {
    timers.forEach(handle => scheduler.clearTimeout(handle));
    timers.clear();
  }

  function transition(next: CallState) {
    if (closed || ended) return;
    state = next;
    onState(next);
  }

  function schedule(next: CallState, delay: number) {
    const handle = scheduler.setTimeout(() => {
      timers.delete(handle);
      transition(next);
    }, delay);
    timers.add(handle);
  }

  return {
    setInitialState(next: CallState) {
      if (closed) return;
      clearTimers();
      state = next;
      if (next === "ended") ended = true;
      onState(next);
    },
    start() {
      if (closed || ended) return;
      clearTimers();
      transition("calling");
      schedule("ringing", 700);
      schedule("connecting", 1500);
      schedule("connected", 2400);
    },
    answer() {
      if (closed || ended) return;
      clearTimers();
      transition("connecting");
      schedule("connected", 900);
    },
    reconnect() {
      if (state !== "connected" || closed || ended) return;
      clearTimers();
      transition("reconnecting");
      schedule("connected", 1300);
    },
    fail() {
      if (closed || ended) return;
      clearTimers();
      transition("failed");
    },
    retry() {
      if (state !== "failed" || closed || ended) return;
      clearTimers();
      transition("connecting");
      schedule("connected", 1200);
    },
    hangup() {
      if (closed || ended) return;
      clearTimers();
      ended = true;
      state = "ended";
      onState("ended");
    },
    close() {
      clearTimers();
      closed = true;
    },
    getState() {
      return state;
    },
  };
}

type MarketLevel = {
  readonly priceMinor: string;
  readonly amountMinor: string;
  readonly depth: number;
};

type MarketTrade = {
  readonly priceMinor: string;
  readonly amountMinor: string;
  readonly side: "buy" | "sell";
  readonly time: string;
};

type MarketOpenOrder = {
  readonly id: string;
  readonly side: "BUY" | "SELL";
  readonly amountMinor: string;
  readonly priceMinor: string;
  readonly totalMinor: string;
};

export type MarketPair = {
  readonly id: string;
  readonly base: string;
  readonly quote: string;
  readonly priceMinor: string;
  readonly quoteDecimals: number;
  readonly change: string;
  readonly changeTone: "up" | "down";
  readonly volume: string;
  readonly highMinor: string;
  readonly lowMinor: string;
  readonly detail: {
    readonly chartPaths: Readonly<Record<ChartPeriod, string>>;
    readonly orderBook: {
      readonly asks: readonly MarketLevel[];
      readonly bids: readonly MarketLevel[];
    };
    readonly recentTrades: readonly MarketTrade[];
    readonly openOrders: readonly MarketOpenOrder[];
  };
};

export const demoData = {
  profile: {
    name: "Юрий Чудинович",
    shortName: "Юрий",
    initials: "ЮЧ",
  },
  portfolio: {
    balanceMinor: "1284062",
    availableMinor: "1259062",
    reservedMinor: "25000",
    currency: "CHUDO",
    referenceMinor: "1284062",
    referenceCurrency: "dEUR",
  },
  transactions: [
    { id: "tx-1042", person: "Юрий Волков", initials: "ЮВ", kind: "Получено", amountMinor: "12800", time: "Сегодня, 10:42", direction: "in" as const },
    { id: "tx-0918", person: "Александр", initials: "А", kind: "Отправлено", amountMinor: "-4000", time: "Вчера, 09:18", direction: "out" as const },
    { id: "tx-reward", person: "Демо-награда", initials: "Д", kind: "Начисление сценария", amountMinor: "382", time: "18 августа", direction: "in" as const },
    { id: "tx-market", person: "Рынок CHUDO / EUR", initials: "Р", kind: "Демо-заявка", amountMinor: "-25000", time: "16 августа", direction: "out" as const },
  ],
  marketPairs: [
    {
      id: "chudo-eur", base: "CHUDO", quote: "EUR", priceMinor: "118", quoteDecimals: 2,
      change: "+2,4%", changeTone: "up", volume: "182 400 CHUDO", highMinor: "123", lowMinor: "112",
      detail: {
        chartPaths: {
          "1h": "M0 196 C58 182 96 205 142 168 S232 174 286 138 374 152 426 103 520 122 578 76 656 91 720 62",
          "1d": "M0 211 C55 193 82 206 124 165 S207 178 249 144 324 151 369 112 435 127 486 82 568 102 614 56 676 71 720 28",
          "1w": "M0 220 C62 211 94 176 147 188 S239 141 302 154 391 105 451 126 523 83 585 96 642 52 720 70",
          "1m": "M0 226 C70 209 111 214 169 181 S264 196 323 145 421 168 472 111 566 128 614 82 680 96 720 44",
        },
        orderBook: {
          asks: [
            { priceMinor: "123", amountMinor: "42000", depth: 38 },
            { priceMinor: "121", amountMinor: "86000", depth: 74 },
            { priceMinor: "120", amountMinor: "51000", depth: 49 },
          ],
          bids: [
            { priceMinor: "118", amountMinor: "64000", depth: 58 },
            { priceMinor: "116", amountMinor: "92000", depth: 86 },
            { priceMinor: "114", amountMinor: "38000", depth: 35 },
          ],
        },
        recentTrades: [
          { priceMinor: "118", amountMinor: "8400", side: "buy", time: "10:46" },
          { priceMinor: "117", amountMinor: "12000", side: "sell", time: "10:41" },
          { priceMinor: "118", amountMinor: "4250", side: "buy", time: "10:37" },
        ],
        openOrders: [
          { id: "eur-order-1", side: "SELL", amountMinor: "25000", priceMinor: "118", totalMinor: "29500" },
        ],
      },
    },
    {
      id: "chudo-btc", base: "CHUDO", quote: "BTC", priceMinor: "11", quoteDecimals: 6,
      change: "−0,8%", changeTone: "down", volume: "94 200 CHUDO", highMinor: "12", lowMinor: "10",
      detail: {
        chartPaths: {
          "1h": "M0 72 C58 88 101 63 151 94 S242 68 302 111 398 91 451 128 530 102 598 151 660 126 720 162",
          "1d": "M0 58 C62 79 102 66 153 101 S240 81 297 121 383 106 445 151 511 126 585 174 648 153 720 192",
          "1w": "M0 85 C64 63 118 102 175 89 S272 130 334 112 424 156 481 136 555 180 622 158 676 203 720 186",
          "1m": "M0 44 C70 70 114 52 177 90 S274 75 332 123 424 102 487 151 558 132 625 182 681 165 720 210",
        },
        orderBook: {
          asks: [
            { priceMinor: "14", amountMinor: "18000", depth: 32 },
            { priceMinor: "13", amountMinor: "46500", depth: 72 },
            { priceMinor: "12", amountMinor: "31000", depth: 51 },
          ],
          bids: [
            { priceMinor: "11", amountMinor: "52000", depth: 63 },
            { priceMinor: "10", amountMinor: "74000", depth: 88 },
            { priceMinor: "9", amountMinor: "28500", depth: 37 },
          ],
        },
        recentTrades: [
          { priceMinor: "11", amountMinor: "6000", side: "sell", time: "10:45" },
          { priceMinor: "12", amountMinor: "14500", side: "buy", time: "10:39" },
          { priceMinor: "11", amountMinor: "9750", side: "sell", time: "10:33" },
        ],
        openOrders: [
          { id: "btc-order-1", side: "BUY", amountMinor: "25000", priceMinor: "11", totalMinor: "2750" },
        ],
      },
    },
    {
      id: "chudo-usdt", base: "CHUDO", quote: "USDT", priceMinor: "121", quoteDecimals: 2,
      change: "+1,6%", changeTone: "up", volume: "217 800 CHUDO", highMinor: "125", lowMinor: "115",
      detail: {
        chartPaths: {
          "1h": "M0 205 C62 187 98 210 149 171 S244 183 298 147 385 161 443 116 529 132 588 93 657 105 720 71",
          "1d": "M0 218 C57 196 99 204 143 178 S230 188 284 139 373 158 429 108 513 125 574 74 650 91 720 49",
          "1w": "M0 227 C66 204 113 220 166 184 S257 198 318 153 411 166 470 122 548 139 608 95 671 112 720 77",
          "1m": "M0 235 C63 221 106 194 164 202 S263 158 324 171 413 122 475 141 548 94 614 112 670 63 720 82",
        },
        orderBook: {
          asks: [
            { priceMinor: "125", amountMinor: "68000", depth: 45 },
            { priceMinor: "123", amountMinor: "112000", depth: 82 },
            { priceMinor: "122", amountMinor: "54000", depth: 39 },
          ],
          bids: [
            { priceMinor: "121", amountMinor: "76000", depth: 61 },
            { priceMinor: "120", amountMinor: "98000", depth: 79 },
            { priceMinor: "119", amountMinor: "43000", depth: 34 },
          ],
        },
        recentTrades: [
          { priceMinor: "121", amountMinor: "10200", side: "buy", time: "10:47" },
          { priceMinor: "120", amountMinor: "18800", side: "sell", time: "10:42" },
          { priceMinor: "121", amountMinor: "7350", side: "buy", time: "10:36" },
        ],
        openOrders: [
          { id: "usdt-order-1", side: "SELL", amountMinor: "25000", priceMinor: "122", totalMinor: "30500" },
        ],
      },
    },
  ] as const satisfies readonly MarketPair[],
  chats: [
    { id: "yuri", name: "Юрий Волков", initials: "ЮВ", message: "Перевод получил, спасибо!", time: "10:44", unread: 2, online: true },
    { id: "alex", name: "Александр", initials: "А", message: "Посмотрим market flow?", time: "09:18", unread: 0, online: true },
    { id: "maria", name: "Мария", initials: "М", message: "Макет видеозвонка готов", time: "Вчера", unread: 0, online: false },
    { id: "community", name: "CHUDO Community", initials: "C", message: "Новые экраны demo V2", time: "Пн", unread: 5, online: false },
  ],
  calls: [
    { id: "call-1", contact: "Юрий Волков", initials: "ЮВ", direction: "outgoing" as const, kind: "video" as const, duration: "04:18", time: "Сегодня, 10:21" },
    { id: "call-2", contact: "Александр", initials: "А", direction: "missed" as const, kind: "audio" as const, duration: "—", time: "Вчера, 18:07" },
    { id: "call-3", contact: "Мария", initials: "М", direction: "incoming" as const, kind: "video" as const, duration: "12:03", time: "Понедельник, 14:32" },
    { id: "call-4", contact: "CHUDO Community", initials: "C", direction: "outgoing" as const, kind: "audio" as const, duration: "02:46", time: "18 августа, 09:12" },
  ],
  mining: {
    poolHashrate: "14,8 GH/s",
    personalHashrate: "268 MH/s",
    workers: "3",
    pendingRewardMinor: "4268",
    paidRewardMinor: "128400",
    currentRewardMinor: "1890",
    lastBlock: "Демо-блок #12 842",
    round: "Раунд #348 · симуляция",
    workersList: [
      { name: "desktop-main", status: "Демо · активен", hashrate: "124 MH/s", seen: "12 сек. назад", shares: "1 284" },
      { name: "studio-rig", status: "Демо · активен", hashrate: "96 MH/s", seen: "25 сек. назад", shares: "942" },
      { name: "laptop-test", status: "Демо · пауза", hashrate: "48 MH/s", seen: "18 мин. назад", shares: "318" },
    ],
    rewards: [
      { round: "#347", amountMinor: "1842", status: "Демо-начисление", time: "Сегодня, 08:40" },
      { round: "#346", amountMinor: "2108", status: "Демо-выплата", time: "Вчера, 19:12" },
      { round: "#345", amountMinor: "1676", status: "Демо-выплата", time: "20 августа" },
    ],
  },
} as const;

export type Chat = (typeof demoData.chats)[number];
export type DemoCall = (typeof demoData.calls)[number];
