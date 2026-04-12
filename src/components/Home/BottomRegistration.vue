<template>
  <v-container fluid class="py-md-10">
    <v-row align="center" justify="center">
      <v-col class="google-font text-center">
          <!-- WebsiteBadge.png -->
          <v-img :src="require('@/assets/img/WebsiteBadge.png')" :lazy-src="require('@/assets/img/WebsiteBadge.png')" class="bottom-reg-img mx-auto"></v-img>
        <p class="h1-heading text-center pb-0 mb-4 mx-auto font-weight-medium bottom-reg-heading">{{ heading }}</p>
        <!-- <p>{{ subHeading }}</p> -->
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
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'BottomRegistrationComponent',
  data: () => ({
    heading: 'Keep me updated about events, discussions and news from GDG DevFest 2021',
    // subHeading: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quod qui explicabo at blanditiis eum ess'
  })
};
</script>

<style lang="scss" scoped>
  .bottom-reg-img {
    width: 12%;
    @media (min-width: 960px) and (max-width: 1264px) {
      width: 14%;
    }
    @media (min-width: 600px) and (max-width: 960px) {
      width: 18%;
    }
    @media (max-width: 600px){
      width: 22%;
    }
  }
  .bottom-reg-heading {
    width: 70%;
    @media (min-width: 960px) and (max-width: 1264px) {
      width: 80%;
    }
    @media (min-width: 600px) and (max-width: 960px) {
      width: 90%;
    }
    @media (max-width: 600px){
      width: 100%;
    }
  }
</style>
