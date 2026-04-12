<template>
  <v-main >
    <v-container fluid>
      <v-row align="center" justify="center" class="my-0 py-0">
        <v-col md="11" lg="9" class="my-0 py-0">
          <HeroSection2 class="mt-3" />
          <WhatToExpect2 class="my-md-15 py-15" />
          <Overview class="my-md-15 py-10 py-md-0"  />
          <Faqs class="my-md-15 py-15" />
          <!-- <Products class="my-md-5" /> -->
          <SocialMedia class="my-md-15 py-md-15" />
        </v-col>
      </v-row>
    </v-container>
    <!-- User your Component Here -->
  </v-main>
</template>

<script>
// Import your component
// Example
import Overview from "/src/components/Home/Overview.vue";
import Faqs from "/src/components/Home/FAQ.vue";
// import SocialMedia from "../components/Home/SocialMedia.vue";
import WhatToExpect2 from "../components/Home/WhatToExpect2.vue";
import HeroSection2 from "../components/Home/HeroSection2.vue";
// import Products from "../components/Home/Products.vue";
export default {
  name: "HomeComponent",
  components: {
    // register your component
    HeroSection2,
    Overview,
    WhatToExpect2,
    Faqs,
    // Products,
    SocialMedia: ()=>import( /* webpackChunkName: "home-socialmedia" */  '@/components/Home/SocialMedia.vue'),
    
  },
  data: () => ({}),
  created() {
    document.title = "Úvodní stránka | DevFest.cz 2021";
  },
};
</script>

<style>

</style>

