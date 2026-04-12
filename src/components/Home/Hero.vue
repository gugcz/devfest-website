<template>
  <v-container fluid class="my-0 py-0 py-md-10">
    <v-row justify="center" align="center" class="my-0 py-md-0">
      <v-col md="5" sm="12" lg="6" class="py-0 pa-md-10">
        <v-img
          alt="DevFest India Logo"
          contain
          class="hero-main-img"
          :src="require('@/assets/img/logo.png')"
          :lazy-src="require('@/assets/img/logo.png')"
          width=""
          style=""
        />
      </v-col>
      <v-col md="7" sm="12" lg="6" class="google-font py-10 pl-md-5">
        <p class="h1-heading mb-0">
          India’s Largest<br />Developer Event of 2021
        </p>
        <p style="font-size: 18px">
          DevFests are community led developer events hosted by Google
          Developers Groups around the globe. This year 50 Google Developer
          Groups in India have come together to organise a DEVFEST INDIA 2021
        </p>

        <p style="font-size:20px"><v-icon>mdi-calendar</v-icon> Oct 22 to Oct 24, 2021 | Online</p>

        <v-btn
          large
          color="#4285f4"
          to="/registration"
          dark
          depressed
          class="mr-2"
          rounded
          style="text-transform: capitalize"
        >
          Register Now
        </v-btn>

        <v-btn
          large
          depressed
          outlined
          rounded
          style="text-transform: capitalize"
        >
          Learn More
        </v-btn>

        
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "Hero",
};
</script>

<style lang="scss" scoped>
// .hero-calendar-container {
//   display: flex;
//   align-items: center;
//   & > i {
//     margin-right: 12px;
//   }
//   & > p {
//     margin-bottom: 0px;
//   }
//   margin-top: 4px;
//   margin-bottom: 24px;
// }
// .hero-main-img {
//   width: 100%;
//   margin-right: auto;
//   max-width: 600px;
//   @media (min-width: 960px) {
//     margin-left: auto;
//   }
//   @media (min-width: 600px) {
//     margin-left: auto;
//   }
// }
</style>
