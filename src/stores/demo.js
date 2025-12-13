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
      { id: "p1", name: "Salón" },
      { id: "p2", name: "Comedor" },
      { id: "t",  name: "Terraza" },
    ],
    ui: {
      activeZoneId: "p1",
      course: "Comanda",
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
      { id: "coct", name: "VINOS" },
      { id: "post", name: "POSTRES" },
      { id: "tap", name: "TAPAS" },
    ],

    products: [
      { id: "vino", catId: "coct", name: "VINO TINTO", price: 3.0 },
      { id: "vinoblan", catId: "coct", name: "VINO BLANCO", price: 2.0 },
      { id: "vinoshe", catId: "coct", name: "VINO SHERRY", price: 3.1 },
      { id: "manza", catId: "coct", name: "MANZANILLA", price: 4.2 },
      { id: "olo", catId: "coct", name: "OLOROSO", price: 3.2 },
      { id: "vermu", catId: "coct", name: "VERMUT", price: 3.3 },
      { id: "pedro", catId: "coct", name: "PEDRO XIMÉNEZ", price: 1.9 },
      { id: "mosca", catId: "coct", name: "MOSCATEL", price: 2.5 },
      { id: "acei", catId: "aper", name: "ACEITUNAS", price: 1.5 },
      { id: "altra", catId: "aper", name: "ALTRAMUCES", price: 1.8 },
      { id: "gilda", catId: "aper", name: "GILDA", price: 3.5 },
      { id: "moja", catId: "aper", name: "MOJAMA", price: 3.5 },
      { id: "gildap", catId: "aper", name: "GILDA PREMIUM", price: 3.8 },
      { id: "pan", catId: "aper", name: "PAN Y PICOS", price: 1 },
      { id: "torr", catId: "aper", name: "TORREZNOS", price: 3.5 },
      { id: "chicha", catId: "aper", name: "CHICHARRONES", price: 3.5 },
      { id: "cana", catId: "cer", name: "CAÑA", price: 2.8 },
      { id: "dob", catId: "cer", name: "DOBLE", price: 4.0 },
      { id: "cop", catId: "cer", name: "COPA", price: 4.2 },
      { id: "hein", catId: "cer", name: "HEINEKEN", price: 3.8 },
      { id: "voll", catId: "cer", name: "VOLL-DAMM", price: 3.8 },
      { id: "bud", catId: "cer", name: "BUDWEISER", price: 3.8 },
      { id: "mod", catId: "cer", name: "MODELO", price: 3.8 },
      { id: "cor", catId: "cer", name: "CORONA", price: 3.8 },
      { id: "carl", catId: "cer", name: "CARLDBERG", price: 3.8 },
      { id: "entre", catId: "car", name: "ENTRECOT", price: 18.5 },
      { id: "colo", catId: "car", name: "SOLOMILLO DE VACA", price: 23.5 },
      { id: "pres", catId: "car", name: "PRESA IBÉRICA", price: 22 },
      { id: "lagar", catId: "car", name: "LAGARTITO", price: 19.5 },
      { id: "chul", catId: "car", name: "CHULETAS DE CORDERO", price: 18.5 },
      { id: "coch", catId: "car", name: "COCHINILLO", price: 30 },
      { id: "croq", catId: "tap", name: "CROQUETAS", price: 8.0 },
      { id: "ensala", catId: "tap", name: "ENSALADILLA RUSA", price: 12.0 },
      { id: "rabo", catId: "tap", name: "RABO DE TORO", price: 13.0 },
      { id: "gazp", catId: "tap", name: "GAZPACHO", price: 4.0 },
      { id: "flam", catId: "tap", name: "FLAMENQUÍN", price: 8.0 },
      { id: "cala", catId: "tap", name: "CALAMARES", price: 16.0 },
      { id: "baca", catId: "tap", name: "BACALAO", price: 15.0 },
      { id: "merl", catId: "tap", name: "MERLUZA A LA PLANCHA", price: 18.0 },
      { id: "albo", catId: "tap", name: "ALBÓNDIGAS EN SALSA", price: 8.0 },
      { id: "ques", catId: "post", name: "TARTA DE QUESO", price: 4.5 },
      { id: "choco", catId: "post", name: "TARTA DE CHOCOLATE", price: 4.6 },
      { id: "lim", catId: "post", name: "TARTA DE LIMÓN", price: 4.5 },
      { id: "bunu", catId: "post", name: "BUÑUELOS", price: 4.6 },
      { id: "pana", catId: "post", name: "PANACOTTA", price: 4.9 },
      { id: "perpi", catId: "post", name: "PERPIÑÁN", price: 4.8 },
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
