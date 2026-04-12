import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Domů",
    component: Home,
  },
  // {
  //   path: '/about',
  //   name: 'About',
  //   component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  // },
  // {
  //   path: "/badge",
  //   name: "Badge",
  //   component: () =>
  //     import(/* webpackChunkName: "badgeview" */ "../views/ProfileBadge.vue"),
  // },
  {
    path: '/speakers',
    name: 'Speakers',
    component: () => import(/* webpackChunkName: "speakers" */ '../views/Speakers.vue')
  },
  {
    path: '/schedule',
    name: 'Schedule',
    component: () => import(/* webpackChunkName: "schedule" */ '../views/Schedule.vue')
  },
  {
    path: '/schedule/:id',
    name: 'scheduleDetails',
    component: () => import(/* webpackChunkName: "scheduleDetails" */ '../views/SchedulePage.vue')
  },
  {
    path: '/speakers/:id',
    name: 'SpeakerPage',
    component: () => import(/* webpackChunkName: "speaker-page" */ '../views/SpeakerPage.vue')
  },
  {
    path: '/ABC',
    name: 'ABCPage',
    component: () => import(/* webpackChunkName: "speaker-page" */ '../views/sifer/ABC.vue')
  },
  {
    path: '/APPSS',
    name: 'APPSSPage',
    component: () => import(/* webpackChunkName: "speaker-page" */ '../views/sifer/APPSS.vue')
  },
  {
    path: '/BIN',
    name: 'BINPage',
    component: () => import(/* webpackChunkName: "speaker-page" */ '../views/sifer/BIN.vue')
  },
  {
    path: '/BLACK',
    name: 'BLACKPage',
    component: () => import(/* webpackChunkName: "speaker-page" */ '../views/sifer/BLACK.vue')
  },
  {
    path: '/OSMIS',
    name: 'OSMISPage',
    component: () => import(/* webpackChunkName: "speaker-page" */ '../views/sifer/OSMIS.vue')
  },
  {
    path: '/OSTRAJ',
    name: 'OSTRAJPage',
    component: () => import(/* webpackChunkName: "speaker-page" */ '../views/sifer/OSTRAJ.vue')
  },
  // {
  //   path: "/profile",
  //   name: "Profil",
  //   component: () =>
  //     import(/* webpackChunkName: "profileview" */ "../views/Profile.vue"),
  // },
  // {
  //   path: "/u/:id",
  //   name: "PublicProfile",
  //   component: () =>
  //     import(
  //       /* webpackChunkName: "PublicProfileview" */ "../views/PublicProfile.vue"
  //     ),
  // },
  {
    path: "/registration",
    name: "Registrace",
    component: () =>
      import(
        /* webpackChunkName: "Registrationview" */ "../views/Registration.vue"
      ),
  },
  // {
  //   path: "/devfest-badges",
  //   name: "DevFestBadges",
  //   component: () =>
  //     import(
  //       /* webpackChunkName: "DevFestBadges" */ "../views/ViewAllBadges.vue"
  //     ),
  // },
  // {
  //   path: "/coc",
  //   name: "CodeofConduct",
  //   component: () =>
  //     import(/* webpackChunkName: "cocview" */ "../views/CoC.vue"),
  // },
  {
    path: "/faq",
    name: "FAQ",
    component: () =>
      import(/* webpackChunkName: "FAQview" */ "../views/FAQ.vue"),
  },
  {
    path: "/communities",
    name: "Communities",
    component: () =>
      import(
        /* webpackChunkName: "Communitiesview" */ "../views/Communities.vue"
      ),
  },
  {
    path: "/partners",
    name: "partners",
    component: () =>
      import(
        /* webpackChunkName: "Partnersview" */ "../views/Partners.vue"
      ),
  },
  // {
  //   path: "/contest",
  //   name: "Contest",
  //   component: () =>
  //     import(
  //       /* webpackChunkName: "contestview" */ "../views/CollectContestBadge.vue"
  //     ),
  // },
  // {
  //   path: "/tc",
  //   name: "tc",
  //   component: () => import(/* webpackChunkName: "Tcview" */ "../views/TC.vue"),
  // },
  {
    path: "*",
    name: "redirect",
    redirect: {
      path: "/",
    },
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  scrollBehavior() {
    return { x: 0, y: 0 };
  },
  routes,
});

export default router;
