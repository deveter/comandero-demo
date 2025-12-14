<template>
  <div class="page">
    <div class="top">
      <div>
        <!-- Header row: hamburguesa + título -->
        <div class="headerRow">
          <button class="hamburger" @click="drawer.open = true" aria-label="Menú">☰</button>
          <h2>Planos</h2>
        </div>

        <div class="me">
          <span><img class="icon-card" src="../assets/user.png" /></span>
          {{ store.session.user?.name }} {{ store.session.user?.surname }}
        </div>
      </div>

      <ViewToggle v-model="store.ui.viewMode" />
    </div>

    <ZoneTabs v-model="store.ui.activeZoneId" :zones="store.zones" />

    <div v-if="store.ui.viewMode==='map'" class="mapPlaceholder">
      (Mapa lo hacemos más adelante)
    </div>

    <div v-else class="grid">
      <button
        v-for="t in tablesInZone"
        :key="t.id"
        class="card"
        @click="onTapTable(t)"
        @pointerdown="startPress(t)"
        @pointerup="cancelPress"
        @pointerleave="cancelPress"
      >
        <div class="cardContent">
          <div class="circle" :class="t.status">{{ t.name }}</div>

          <div class="info">
            <!-- Comensales -->
            <div class="info-row">
              <span><img class="icon-card" src="../assets/user.png" /></span>
              <span class="text-card">{{ store.tableById(t.id)?.diners || 0 }}</span>
            </div>

            <!-- Importe -->
            <div class="info-row">
              <span class="text-card">{{ store.totalOrder(t.id).toFixed(2) }} €</span>
            </div>
          </div>
        </div>
      </button>
    </div>

    <TableActionsSheet
      v-if="sheet.open"
      :tableName="sheet.table?.name"
      @close="sheet.open=false"
      @edit-diners="openDiners(sheet.table)"
      @discount="todo('Descuento (pendiente)')"
      @print="todo('Imprimir cuenta (pendiente)')"
      @pay="goPay(sheet.table)"
    />

    <DinersModal
      v-if="diners.open"
      :tableName="diners.tableName"
      :initial="diners.initial"
      @close="diners.open=false"
      @accept="onAcceptDiners"
    />

    <!-- ===== Drawer / Menú hamburguesa ===== -->
    <transition name="fade">
      <div v-if="drawer.open" class="drawerOverlay" @click="drawer.open = false"></div>
    </transition>

    <transition name="slide">
      <aside v-if="drawer.open" class="drawer" @click.stop>
        <div class="drawerTop">
          <div class="drawerBrand">TIPSI</div>

          <div class="drawerUser">
            <img class="drawerUserIcon" src="../assets/user.png" />
            <div class="drawerUserText">
              <div class="drawerRole">Comandero 1</div>
              <div class="drawerName">
                {{ store.session.user?.name }} {{ store.session.user?.surname }}
              </div>
            </div>
          </div>

          <div class="drawerDivider"></div>
        </div>

        <div class="drawerSectionTitle"> </div>

        <button class="drawerItem" @click="nav('/planos')">
          <span class="drawerIco"><img class="icon-card" src="../assets/map.png" /></span>
          <span>Planos</span>
        </button>

        <div class="drawerSectionTitle">Impresoras</div>

        <button class="drawerItem" @click="todo('Mapeo de impresoras (pendiente)'); drawer.open=false">
          <span class="drawerIco"><img class="icon-card" src="../assets/printer.png" /></span>
          <span>Mapeo de impresoras</span>
        </button>

        <button class="drawerItem" @click="todo('Configurar tipo de impresión (pendiente)'); drawer.open=false">
          <span class="drawerIco"><img class="icon-card" src="../assets/printer2.png" /></span>
          <span>Configurar tipo de impresión</span>
        </button>

        <div class="drawerSectionTitle">Cuenta</div>

        <button class="drawerItem" @click="todo('Configuración (pendiente)'); drawer.open=false">
          <span class="drawerIco"><img class="icon-card" src="../assets/gear.png" /></span>
          <span>Configuración</span>
        </button>

        <button class="drawerItem danger" @click="logout">
          <span class="drawerIco"><img class="icon-card" src="../assets/logout.png" /></span>
          <span>Salir</span>
        </button>

        <div class="drawerFooter">Versión 0.0.000000</div>
      </aside>
    </transition>
    <!-- ===== /Drawer ===== -->
  </div>
</template>

<script setup>
import { computed, reactive } from "vue";
import { useRouter } from "vue-router";
import { useDemoStore } from "../stores/demo";
import ZoneTabs from "../components/ZoneTabs.vue";
import ViewToggle from "../components/ViewToggle.vue";
import TableActionsSheet from "../components/TableActionsSheet.vue";
import DinersModal from "../components/DinersModal.vue";

const store = useDemoStore();
const router = useRouter();

const tablesInZone = computed(() =>
  store.tables.filter(t => t.zoneId === store.ui.activeZoneId)
);

const sheet = reactive({ open:false, table:null });
const diners = reactive({ open:false, tableId:null, initial:1, afterSetGo:false });

// Drawer state (solo añadido)
const drawer = reactive({ open: false });

let pressTimer = null;

function startPress(t){
  cancelPress();
  pressTimer = setTimeout(() => {
    sheet.open = true;
    sheet.table = t;
  }, 450);
}
function cancelPress(){
  if (pressTimer) clearTimeout(pressTimer);
  pressTimer = null;
}

function onTapTable(t){
  if (sheet.open) return;

  if (t.status === "free" && (!t.diners || t.diners === 0)) {
    diners.open = true;
    diners.tableId = t.id;
    diners.initial = 0;
    diners.afterSetGo = true;
    return;
  }

  router.push(`/mesa/${t.id}/categorias`);
}

function openDiners(t){
  sheet.open = false;
  diners.open = true;
  diners.tableId = t.id;
  diners.initial = t.diners || 2;
  diners.afterSetGo = false;
}

function confirmDiners(n){
  store.setDiners(diners.tableId, n);
  const go = diners.afterSetGo;
  const tableId = diners.tableId;
  diners.open = false;
  diners.afterSetGo = false;
  if (go) router.push(`/mesa/${tableId}/categorias`);
}

function goPay(t){
  sheet.open = false;
  store.payTable(t.id);
}

function todo(msg){ sheet.open=false; alert(msg); }

function onAcceptDiners(n) {
  store.setDiners(diners.tableId, n);
  diners.open = false;
  router.push(`/mesa/${diners.tableId}/categorias`);
}

/* ===== Funciones del drawer (solo añadido) ===== */
function nav(path) {
  drawer.open = false;
  router.push(path);
}

function logout() {
  drawer.open = false;
  // Si tienes store.logout(), úsalo. Si no, hacemos un fallback suave.
  if (typeof store.logout === "function") {
    store.logout();
  } else if (store.session) {
    store.session.user = null;
  }
  router.push("/login");
}
/* ===== /drawer ===== */
</script>

<style scoped>
h2{
  margin:0px !important;
}

.page{
  padding: 16px;
  min-height:100vh;
  background:transparent;
}

.top{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap:10px;
}

.me{
  opacity:.7;
  margin-top: 20px;
  margin-bottom: 20px;
}

.grid{
  margin-top: 14px;
  display:grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

/* BOTÓN CUADRADO INFALIBLE */
.card{
  width: 100%;
  border:1px solid #eee;
  background:#fff;
  border-radius:16px;

  padding: 0;
  position: relative;
  overflow: hidden;

  touch-action: manipulation;
}

/* Esto fuerza alto = ancho */
.card::before{
  content:"";
  display:block;
  padding-top:100%;
}

/* Contenido “encima” del cuadrado */
.cardContent{
  position:absolute;
  inset:0;
  padding: 12px;

  display:flex;
  flex-direction:column;
  justify-content: space-between;
  align-items:center;
}

/*ICONOS DEL CARD*/
.icon-card{
  max-width: 13px;
}

.text-card{
  font-weight:600;
}

/* CÍRCULO */
.circle{
  width: 44px;
  height:44px;
  border-radius:999px;
  display:grid;
  place-items:center;
  color:#fff;
  font-weight: 900;
}

.circle.free{ background:#2ecc71; }
.circle.busy{ background:#e74c3c; }
.circle.bill_requested{ background:#3498db; }

/* INFO ABAJO */
.info{
  width:100%;
  display:flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity:.85;
  font-weight:800;
  gap: 4px;
}

.info-row{
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
}

.info-row .icon {
  width: 14px;
  height: 14px;
  display: inline-block;
}

/* RELOJ */
.icon-clock {
  mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="%23000" viewBox="0 0 24 24"><path d="M12 1a11 11 0 1 0 11 11A11.013 11.013 0 0 0 12 1zm0 20a9 9 0 1 1 9-9 9.01 9.01 0 0 1-9 9zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>') no-repeat center;
  background-color: currentColor;
}

/* ===== SOLO AÑADIDO: botón hamburguesa + drawer ===== */
.headerRow{
  display:flex;
  align-items:center;
  gap:10px;
}

.hamburger{
  border:1px solid #eee;
  background:#fff;
  border-radius:12px;  
  padding: 8px 10px;
  font-weight: 900;  
  border-width: 3px;
  cursor:pointer;
}

.drawerOverlay{
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.25);
  z-index: 50;
}

.drawer{
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 78%;
  max-width: 330px;
  background: #fff;
  z-index: 60;
  box-shadow: 10px 0 30px rgba(0,0,0,.18);
  padding: 16px 14px;
  display:flex;
  flex-direction: column;
}

.drawerTop{ padding-bottom: 10px; }
.drawerBrand{
  font-weight: 900;
  letter-spacing: 2px;
  color: #163357;
  font-size: 18px;
  margin-bottom: 12px;
}

.drawerUser{
  display:flex;
  align-items:center;
  gap:10px;
  padding: 10px 8px;
  border-radius: 14px;
  background: #f6f6f6;
}

.drawerUserIcon{
  width: 28px;
  height: 28px;
  border-radius: 999px;
}

.drawerUserText{ line-height: 1.1; }
.drawerRole{ font-size: 12px; opacity:.7; font-weight: 900; }
.drawerName{ font-size: 12px; font-weight: 900; }

.drawerDivider{
  height: 1px;
  background: #eee;
  margin: 12px 0 6px;
}

.drawerSectionTitle{
  font-size: 12px;
  font-weight: 900;
  opacity: .6;
  margin: 14px 6px 8px;
}

.drawerItem{
  width:100%;
  display:flex;
  align-items:center;
  gap:10px;
  border: 0;
  background: transparent;
  padding: 12px 10px;
  border-radius: 14px;
  font-weight: 900;
  cursor:pointer;
  text-align:left;
}
.drawerItem:hover{ background:#f3f3f3; }
.drawerItem.danger{ color:#c0392b; }

.drawerIco{ width: 22px; text-align:center; }

.drawerFooter{
  margin-top:auto;
  font-size: 11px;
  opacity:.5;
  padding: 10px 6px 0;
}

/* Transiciones */
.fade-enter-active, .fade-leave-active{ transition: opacity .14s ease; }
.fade-enter-from, .fade-leave-to{ opacity: 0; }

.slide-enter-active, .slide-leave-active{ transition: transform .18s ease; }
.slide-enter-from, .slide-leave-to{ transform: translateX(-105%); }
/* ===== /AÑADIDO ===== */
</style>
