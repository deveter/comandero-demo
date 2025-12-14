import { createRouter, createWebHistory } from "vue-router";
import { useDemoStore } from "../stores/demo";

import LoginView from "../views/LoginView.vue";
import PlanosView from "../views/PlanosView.vue";
import CategoriasView from "../views/CategoriasView.vue";
import ProductosView from "../views/ProductosView.vue";
import CobroView from "../views/CobroView.vue";
import MapeoImpresorasView from "../views/MapeoImpresorasView.vue";
import MapeoImpresoraConfigView from "../views/MapeoImpresoraConfigView.vue";

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", component: LoginView },

  { path: "/planos", component: PlanosView, meta: { requiresAuth: true } },
  { path: "/mesa/:tableId/categorias", component: CategoriasView, meta: { requiresAuth: true } },
  { path: "/mesa/:tableId/categoria/:catId", component: ProductosView, meta: { requiresAuth: true } },
  { path: "/mesa/:tableId/cobro", component: CobroView, meta: { requiresAuth: true } },
  { path: "/impresoras/mapeo", name: "imp-mapeo", component: MapeoImpresorasView },
  { path: "/impresoras/mapeo/:key", name: "imp-config", component: MapeoImpresoraConfigView },
];

const router = createRouter({ history: createWebHistory(), routes });

router.beforeEach((to) => {
  const store = useDemoStore();
  if (to.meta.requiresAuth && !store.session.user) return "/login";
});

export default router;
