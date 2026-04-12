import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    drawer: false,
    items: [
      {
        text: "Domů",
        to: "/",
        icon: "mdi-home-outline",
        meta: {
          showToolbar: true,
          showBottomNav: true,
          showDrawer: true
        },
      },

      // {
      //   text: "Badge",
      //   to: "/badge",
      //   icon: "mdi-badge-account-outline",
      //   meta: {
      //     showToolbar: true,
      //     showBottomNav: false,
      //     showDrawer: true
      //   },
      // },
      {
        text: "Program",
        to: "/schedule",
        icon: "mdi-badge-account-outline",
        meta: {
          showToolbar: true,
          showBottomNav: false,
          showDrawer: true
        },
      },
      {
        text: "Registrace workshopy",
        to: "/registration",
        icon: "mdi-account-circle-outline",
        meta: {
          showToolbar: true,
          showBottomNav: false,
          showDrawer: true
        },
      },
      {
        text: "Přednášející",
        to: "/speakers",
        icon: "mdi-badge-account-outline",
        meta: {
          showToolbar: true,
          showBottomNav: false,
          showDrawer: true
        },
      },
      {
        text: "Komunity",
        to: "/communities",
        icon: "mdi-form-select",
        meta: {
          showToolbar: true,
          showBottomNav: false,
          showDrawer: true
        },
      },
      {
        text: "Partneři",
        to: "/partners",
        icon: "mdi-form-select",
        meta: {
          showToolbar: true,
          showBottomNav: false,
          showDrawer: true
        },
      },
      // {
      //   text: "Profil",
      //   to: "/profile",
      //   icon: "mdi-account-circle-outline",
      //   meta: {
      //     showToolbar: false,
      //     showBottomNav: false,
      //     showDrawer: true
      //   },
      // },
      {
        text: "FAQ",
        to: "/faq",
        icon: "mdi-star-outline",
        meta: {
          showToolbar: true,
          showBottomNav: false,
          showDrawer: true
        },
      },
      // {
      //   text: "Code of Conduct",
      //   to: "/coc",
      //   icon: "mdi-information-outline",
      //   meta: {
      //     showToolbar: false,
      //     showBottomNav: false,
      //     showDrawer: true
      //   }
      // }
    ]
  },
  getters:{
    links: (state) => state.items,
  },
  mutations: {
    setDrawer: (state, payload) => (state.drawer = payload),
    toggleDrawer: (state) => (state.drawer = !state.drawer),
  },
  actions: {
  },
  modules: {
  }
})