<template>
  <v-app>
    <v-snackbar
      v-model="snackWithButtons"
      :timeout="timeout"
      bottom
      style="margin-bottom:10px"
      class="snack"
    >
      {{ snackWithBtnText }}
      <template v-slot:action="{ attrs }">
        <v-spacer />
        <v-btn
          aria-label="Snackbar"
          dark
          text
          v-bind="attrs"
          color="#00f500"
          @click.native="refreshApp"
        >
          {{ snackBtnText }}
        </v-btn>
        <v-btn
          icon
          v-bind="attrs"
          aria-label="close"
          @click="snackWithButtons = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
    <Appbar />
    <Appdrawer />
    <v-main class="pa-0 ma-0" style="background: #EFF7FF">
      <v-slide-y-reverse-transition>
        <router-view v-show="show" />
      </v-slide-y-reverse-transition>
    </v-main>
    <AppFooter class="hidden-sm-and-down"/>
    <BottomNav class="hidden-md-and-up"/>
  </v-app>
</template>

<script>
import Appbar from "../src/components/Core/Appbar.vue";
import BottomNav from "../src/components/Core/BottomNav.vue";
import AppFooter from "../src/components/Core/AppFooter.vue";
import Appdrawer from "../src/components/Core/AppDrawer.vue";
import FDK from "@/Config/firebase";
export default {
  name: "App",
  mounted(){
    FDK.firebase.performance()
  },
  components: {
    Appbar,
    Appdrawer,
    AppFooter,
    BottomNav
  },
  data: () => ({
    //
    refreshing: false,
    registration: null,
    snackBtnText: "",
    snackWithBtnText: "",
    snackWithButtons: false,
    timeout: 6000,
    show: false,
  }),
  created() {
    this.show = true;
    // Listen for swUpdated event and display refresh snackbar as required.
    document.addEventListener("swUpdated", this.showRefreshUI, { once: true });
    // Refresh all open app tabs when a new service worker is installed.
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (this.refreshing) return;
      this.refreshing = true;
      window.location.reload();
    });
  },
  methods: {
    showRefreshUI(e) {
      this.registration = e.detail;
      this.snackBtnText = "Refresh";
      this.snackWithBtnText = "New version available!";
      this.snackWithButtons = true;
      this.refreshApp();
    },
    refreshApp() {
      this.snackWithButtons = false;
      if (!this.registration || !this.registration.waiting) {
        return;
      }
      this.registration.waiting.postMessage("skipWaiting");
    },
  },
};
</script>
