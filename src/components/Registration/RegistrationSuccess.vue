<template>
  <v-container fluid class="px-0">
    <!-- <v-row>
      <v-col md="12">
        <v-btn to="/profile" color="primary" class="mt-2 mr-3" depressed rounded style="text-transform: capitalize;border:1px solid black">
          <v-icon left>mdi-account-child</v-icon>Create
          DevFest Profile
        </v-btn>
        
        <v-btn
          outlined
          to="/badge"
          rounded
          rel="noreferrer"
          color="#4285f4"
          style="text-transform: capitalize;"
          class="google-font mt-2 mr-2"
        >
          <v-icon size="20px" left>mdi-inbox</v-icon>Generate Profile Badge
        </v-btn>
        <br>

        <p style="font-size:18px;font-weight:600" class="mb-2 mt-10">Share with your Friends</p>
        <v-btn
          :href="facebookshare"
          target="_blank"
          rel="noreferrer"
          style="text-transform: capitalize;"
          dark
          rounded
          depressed
          color="#3b5998"
          class="google-font mt-1 mr-2"
        >
          <v-icon size="20px" left>mdi-facebook</v-icon>Facebook
        </v-btn>

        <v-btn
          :href="twitterShare"
          target="_blank"
          rel="noreferrer"
          style="text-transform: capitalize;"
          dark
          rounded
          depressed
          color="#1DA1F2"
          class="google-font mt-1 mr-2"
        >
          <v-icon size="20px" left>mdi-twitter</v-icon>Twitter
        </v-btn>

      </v-col>
    </v-row> -->
  </v-container>
</template>

<script>
export default {
  name: "RegistrationSuccessComponent",
  data: () => ({
    fbPosts:["asd", 'asd2',"asd3","asd5", "asd6"],
    twitterPost:['zx1','zx2','zx3','zx4'],
    facebookshare:
      "https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fdevfestindia.com%2F&quote=Do%20you%20know%3F%0A%0AI%20just%20registered%20myself%20for%20%23DevFestIndia%20and%20will%20be%20attending%20%23DevFestIndia2021%20from%2022nd%20-%2024th%20Oct.%0A%0ADon%27t%20miss%20the%20chance%20of%20connecting%20with%20the%20experts%20and%20fellow%20learners.%0A%0ASee%20More%20Info%3A%20devfestindia.com",
    twitterShare:"https://twitter.com/intent/tweet?url=&text=Do%20you%20know%3F%0A%0AI%20just%20registered%20myself%20for%20%23DevFestIndia%20and%20will%20be%20attending%20%23DevFestIndia2021%20from%2022nd%20-%2024th%20Oct.%0A%0ADon%27t%20miss%20the%20chance%20of%20connecting%20with%20the%20experts%20and%20fellow%20learners.%0A%0A%F0%9F%94%97devfestindia.com",
    linkedInShare:""
  }),
  methods:{
    getRandomEle(arr){
      console.log(arr[Math.floor(Math.random() * arr.length)])
      return arr[Math.floor(Math.random() * arr.length)]
    }
  }
};
</script>

<style></style>
