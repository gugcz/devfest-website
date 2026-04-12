<template>
  <v-main>
    <v-container fluid class="mb-8 px-5">
      <v-row align="center" justify="center">
        <v-col md="11" lg="9" cols="12" class="google-font my-0 my-md-12">
          <v-container fluid class="px-0 mx-0">
            <v-row justify="start" align="start">
              <v-col md="12" cols="12" class="pr-md-5">
                <h1 class="h1-heading mt-0">DevFest Badges</h1>
                <p
                  class="google-font mt-2"
                  style="font-size: 17px; line-height: 32px"
                >
                  This year you can earn cool badges by attending different
                  sessions, participating in contests and quizzes! What more?
                  <br />
                  These badges can also be shared on different social media
                  platforms like Facebook and Twitter 🤩 Sounds cool, go ahead
                  and grab yours now!
                </p>
              </v-col>
            </v-row>
            <v-row align="start" justify="start" v-if="loader">
              <v-col align="center">
                <v-progress-circular
                  indeterminate
                  color="primary"
                ></v-progress-circular>
              </v-col>
            </v-row>

            <v-row align="start" justify="start" v-if="!loader">
              <v-col
                md="3"
                lg="2"
                sm="4"
                cols="6"
                class="text-center px-md-1 mx-md-1"
                v-for="(item, index) in badges.data"
                :key="index"
              >
                <badgeDialog :badge="item" :queryID="query" />
              </v-col>
            </v-row>
          </v-container>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script>
import DevFestBadgeService from "../services/DevFestBadgeService.js";
import badgeDialog from "../components/DevProfile/BadgeDialoge.vue";

export default {
  name: "ViewAllBadgesComponent",
  data: () => ({
    badges: [],
    loader: false,
    query: "",
  }),
  methods: {
    async getAllBadges() {
      this.loader = true;
      this.badges = await DevFestBadgeService.getAllPublicProfileBadges();
      this.loader = false;
    },
    checkURL() {
      if (this.$route.query.badge) {
        // Decode URL param
        this.query = Buffer.from(this.$route.query.badge, "base64").toString();

        // Encode URL
        // this.query = Buffer.from(this.$route.query.badge).toString("base64");
      }
    },
  },
  components: {
    badgeDialog,
  },
  created() {
    document.title = "DevFest Badges | DevFest.cz 2021";
    this.checkURL();
  },
  mounted() {
    this.getAllBadges();
  },
};
</script>