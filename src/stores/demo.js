import { defineStore } from "pinia";

const LS_KEY = "tipsi_comandero_demo_v2";

const DEFAULT_TABLES = [
  { id: "m1", zoneId: "p1", name: "1", status: "free" },
  { id: "m2", zoneId: "p1", name: "2", status: "free" },
  { id: "m3", zoneId: "p1", name: "3", status: "free" },
  { id: "m4", zoneId: "p1", name: "Barra 1", status: "free" },
  { id: "m5", zoneId: "p1", name: "Barra 2", status: "free" },
];

function safeParse(v) { try { return JSON.parse(v); } catch { return null; } }

function itemKey(it) {
  // preparado para formatos/modificadores
  const fmt = it.format || "";
  const mods = it.modifiers ? JSON.stringify(it.modifiers) : "";
  return `${it.productId}__${fmt}__${mods}`;
}

export const useDemoStore = defineStore("demo", {
  state: () => ({
    users: [
      { id: "u1", name: "Antonio", surname: "López", requiresPin: false },
      { id: "u2", name: "Belén", surname: "Barbero", requiresPin: true, pin: "1234" },
      { id: "u3", name: "Carlos", surname: "López", requiresPin: false },
    ],
    session: { user: null },

    zones: [
      { id: "p1", name: "Sala P1" },
      { id: "p2", name: "Sala P2" },
      { id: "t",  name: "Terraza" },
    ],
    ui: {
      activeZoneId: "p1",
      viewMode: "list", // list | map
    },
    tables: [
      { id: "m1", zoneId: "p1", name: "1", status: "free", diners: 0 },
      { id: "m2", zoneId: "p1", name: "2", status: "free", diners: 0 },
      { id: "m3", zoneId: "p1", name: "3", status: "free", diners: 0 },

      { id: "m4", zoneId: "p2", name: "1", status: "free", diners: 0 },
      { id: "m5", zoneId: "p2", name: "2", status: "free", diners: 0 },

      { id: "m6", zoneId: "t", name: "1", status: "free", diners: 0 },
      { id: "m7", zoneId: "t", name: "2", status: "free", diners: 0 },
    ],

    categories: [
      { id: "aper", name: "APERITIVOS" },
      { id: "car", name: "CARNES" },
      { id: "cer", name: "CERVEZAS" },
      { id: "coct", name: "CÓCTELES" },
      { id: "post", name: "POSTRES" },
      { id: "tap", name: "TAPAS" },
    ],

    products: [
      { id: "vino", catId: "coct", name: "Vino tinto", price: 3.0 },
      { id: "agua", catId: "aper", name: "Agua", price: 1.5 },
      { id: "cerveza", catId: "cer", name: "Cerveza", price: 2.8 },
      { id: "entrecot", catId: "car", name: "Entrecot", price: 18.5 },
      { id: "croquetas", catId: "tap", name: "Croquetas", price: 8.0 },
      { id: "tarta", catId: "post", name: "Tarta", price: 4.5 },
    ],

    // 👇 lo importante
    draftCartByTable: {}, // lo seleccionado (aún no enviado)
    ordersByTable: {},    // lo ya enviado/confirmado (lo que “tiene” la mesa)
  }),

  getters: {
    tableById: (s) => (id) => s.tables.find(t => t.id === id),

    draftFor: (s) => (tableId) => s.draftCartByTable[tableId] || { tableId, items: [] },
    orderFor: (s) => (tableId) => s.ordersByTable[tableId] || { tableId, items: [] },

    totalDraft: (s) => (tableId) => {
      const d = s.draftCartByTable[tableId];
      if (!d) return 0;
      return d.items.reduce((acc, it) => acc + it.qty * it.unit, 0);
    },

    totalOrder: (s) => (tableId) => {
      const o = s.ordersByTable[tableId];
      if (!o) return 0;
      return o.items.reduce((acc, it) => acc + it.qty * it.unit, 0);
    },

    productsByCat: (s) => (catId) => s.products.filter(p => p.catId === catId),
  },

  actions: {
    persist() {
      localStorage.setItem(LS_KEY, JSON.stringify({
        tables: this.tables,
        draftCartByTable: this.draftCartByTable,
        ordersByTable: this.ordersByTable,
        ui: this.ui,
      }));
    },
    discardDraft(tableId) {
  // borra carrito no enviado
      delete this.draftCartByTable[tableId];

      const t = this.tableById(tableId);
      // si la mesa sigue libre (verde), también reseteamos comensales
      if (t && t.status === "free") {
        t.diners = 0;
      }

      this.persist();
    },

    setDiners(tableId, diners) {
      const t = this.tableById(tableId);
      if (!t) return;
      t.diners = Math.max(0, Number(diners) || 0);
      this.persist();
    },

    hydrate() {
      const saved = safeParse(localStorage.getItem(LS_KEY) || "");
      if (!saved) return;
      if (Array.isArray(saved.tables)) this.tables = saved.tables;
      if (saved.draftCartByTable) this.draftCartByTable = saved.draftCartByTable;
      if (saved.ordersByTable) this.ordersByTable = saved.ordersByTable;
      if (saved.ui) this.ui = { ...this.ui, ...saved.ui };
    },

    login(user) { this.session.user = { id: user.id, name: user.name, surname: user.surname }; },
    logout() { this.session.user = null; },

    // --- Carrito (draft)
    addToCart(tableId, productId, opts = {}) {
      const p = this.products.find(x => x.id === productId);
      if (!p) return;

      const draft = this.draftCartByTable[tableId] || { tableId, items: [] };

      const incoming = {
        productId,
        name: p.name,
        unit: p.price,
        qty: 1,
        format: opts.format || null,
        modifiers: opts.modifiers || null,
      };

      const key = itemKey(incoming);
      const existing = draft.items.find(it => itemKey(it) === key);

      if (existing) existing.qty += 1;
      else draft.items.push(incoming);

      this.draftCartByTable[tableId] = draft;
      this.persist();
    },

    incDraft(tableId, idx) {
      const d = this.draftCartByTable[tableId];
      if (!d?.items?.[idx]) return;
      d.items[idx].qty += 1;
      this.persist();
    },

    decDraft(tableId, idx) {
      const d = this.draftCartByTable[tableId];
      if (!d?.items?.[idx]) return;
      d.items[idx].qty -= 1;
      if (d.items[idx].qty <= 0) d.items.splice(idx, 1);
      this.persist();
    },

    // --- Enviar: draft -> order y cambia estado de mesa
    sendCart(tableId) {
      const draft = this.draftCartByTable[tableId];
      if (!draft || draft.items.length === 0) return;

      const order = this.ordersByTable[tableId] || { tableId, items: [] };

      // merge líneas (por key)
      for (const it of draft.items) {
        const key = itemKey(it);
        const ex = order.items.find(x => itemKey(x) === key);
        if (ex) ex.qty += it.qty;
        else order.items.push({ ...it });
      }

      this.ordersByTable[tableId] = order;
      delete this.draftCartByTable[tableId];

      const t = this.tableById(tableId);
      if (t) {
        // si estaba azul y envían algo nuevo, vuelve a “ocupada”
        t.status = "busy";
      }

      this.persist();
    },

    // --- pedir cuenta (azul)
    requestBill(tableId) {
      const t = this.tableById(tableId);
      if (!t) return;
      if (t.status === "busy") {
        t.status = "bill_requested";
        this.persist();
      }
    },

    // --- pagar: limpia todo y vuelve a verde
    payTable(tableId) {
      delete this.ordersByTable[tableId];
      delete this.draftCartByTable[tableId];
      const t = this.tableById(tableId);
      if (t) t.status = "free";
      this.persist();
    },

    resetDemo() {
      localStorage.removeItem(LS_KEY);
      this.tables = JSON.parse(JSON.stringify(DEFAULT_TABLES));
      this.draftCartByTable = {};
      this.ordersByTable = {};
    },
  },
});
