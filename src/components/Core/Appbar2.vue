<template>
  <!-- style="box-shadow: 0 2px 6px 0 rgba(0,0,0,.12), inset  0 -1px 0 0 #dadce0" -->
  <v-app-bar
    app
    fixed
    color="#EFF7FF"
    flat
    style="-webkit-backdrop-filter: blur(15px);
  backdrop-filter: blur(8px);opacity:0.93"
  >
    <!-- <v-app-bar-nav-icon
      aria-label="Hamburger Btn"
      @click="toggleDrawer"
      class="d-md-none d-lg-none"
    ></v-app-bar-nav-icon> -->
    <v-toolbar-title class="google-font px-0 mr-1" style="width: 215px"
      ><router-link
        to="/"
        class="google-font grey--text text--darken-2"
        style="text-decoration: none; font-size: 110%;font-weight:400"
      >
        <v-img :src="require('@/assets/img/devfest.svg')" width="150px"></v-img>
      </router-link></v-toolbar-title
    >
    <!-- <v-spacer></v-spacer> -->
    <v-tabs
      color="#1A1B1B"
      left
      slider-color="#4285FA"
      :hide-slider="getRouteName()"
      class="hidden-sm-and-down google-font"
    >
      <v-tab
        class="google-font"
        aria-label="toolbar links"
        v-for="(link, i) in links.filter((obj) => obj.meta.showToolbar)"
        :key="i"
        :to="link.to"
        @click="onClick($event, link)"
        style="text-transform: capitalize; font-size: 14px;font-weight:400"
        >{{ link.text }}</v-tab
      >
    </v-tabs>
    <v-spacer></v-spacer>
   


    <PushNotification :class="userFound && !loadingUser?'mx-2':'ml-2'" />
    <!-- <UserProfileMenu :userInfo="userInfo" v-if="userFound && !loadingUser" /> -->
      <v-btn
      aria-label="Share Button"
      icon
      v-on:click="shareMe"
    >
      <v-icon>mdi-share-variant</v-icon>
    </v-btn>
    
    
    <!-- <v-btn
      class="ma-2"
      
      :loading="loadingUser"
      icon
      color="#1A1B1B"
      v-if="loadingUser"
    >
    </v-btn> -->
    
    <!-- <v-btn v-if="!userFound && !loadingUser" to="/profile" style="text-transform: capitalize;" rounded depressed class="mx-2 google-font hidden-sm-and-down" color="#CDDFFD" light> Get Profile Badge
    </v-btn>

    <v-btn v-if="!userFound && !loadingUser" to="/registration" style="text-transform: capitalize;" rounded depressed class="mx-2 google-font hidden-sm-and-down" color="#4285f4" dark> Register Now
    </v-btn> -->
    <!-- 
      class="hidden-sm-and-up" -->
  
    
    
  </v-app-bar>
</template>

<script>
import FDK from "@/Config/firebase";
// import UserProfileMenu from "../Core/ProfileMenu.vue";
import PushNotification from "../Core/PushNotification.vue";
import { mapGetters, mapMutations } from "vuex";
export default {
  name: "AppBar2",
  data: () => ({
    hideSlidersOn: ["CodeofConduct","Profile","SpeakerPage","scheduleDetails","PublicProfile"],
    userFound: false,
    userInfo: {},
    loadingUser: true
  }),
  components:{
    UserProfileMenu,
    PushNotification
  },
  computed: {
    ...mapGetters(["links"]),
  },
  mounted(){
    this.checkStatus();
  },
  methods: {
    ...mapMutations(["toggleDrawer"]),
    onClick(e, item) {
      e.stopPropagation();
      if (item.to || !item.href) return;
      this.$vuetify.goTo(item.href);
    },
    getRouteName() {
        return this.hideSlidersOn.includes(this.$route.name) ? true : false;
    },
    shareMe() {
      if (navigator.share) {
        // console.log(this.$route)
        navigator
          .share({
            title:
              "DevFest.cz 2021",
            url: "https://2021.devfest.cz"+this.$route.path,
          })
          .then(() => {
            console.log("Thanks for sharing");
          })
          .catch((e) => {
            console.log(e);
          });
      } else {
        window.open('https://www.facebook.com/sharer.php?s=100&p[title]=DevFest.cz2021&p[url]=https%3A%2F%2F2021.devfest.cz&p[summary]=DevFest.cz2021&p[images][0]=https%3A%2F%2Fdevfest-2021-gug.web.app%2Fimg%2Fshare.jpg', '_blank').focus();
      }
    },
    checkStatus(){
      this.loadingUser = true
      FDK.auth.onAuthStateChanged(async (user) => {
        if (user) {
          this.userFound = true;
          this.loadingUser = false
          this.userInfo = user;
        } else {
          this.userFound = false;
          this.loadingUser = false
        }
      });
    }
  },
};
</script>

<style>
.v-toolbar .v-toolbar__content {
  /* border-bottom: 1px solid rgb(218, 220, 224); */
  border-bottom: none !important;
}
.theme--light.v-btns, .v-tab.v-tab {
    color:#1A1B1B !important;
}
.v-btn:not(.v-btn--round).v-size--default {
    height: 45px;
}
.v-btn--rounded {
    border-radius: 15px !important;
}
.v-tabs-slider-wrapper {
    top: 45px;
}
@media only screen and (min-width: 600px) {
  .v-toolbar .v-toolbar__content {
    padding-left: 4%;
    padding-right: 4%;
    padding-top: 20px;
  }
}
</style>
