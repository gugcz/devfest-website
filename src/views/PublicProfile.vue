<template>
  <v-main>
    <v-container fluid>
      <v-row justify="center" align="center">
        <v-col md="11" sm="11" lg="9" class="google-font my-15 py-10">
          <v-container fluid>
            <!-- Loader -->
            <v-row
              justify="center"
              align="center"
              v-if="
                MainViewLoader && Object.keys(userInfo).length == 0 && !isFound
              "
            >
              <v-col
                md="4"
                lg="4"
                cols="12"
                sm="5"
                class="my-md-15 py-15 text-center"
              >
                <v-progress-circular
                  :size="70"
                  :width="5"
                  color="#4285fa"
                  indeterminate
                ></v-progress-circular>
              </v-col>
            </v-row>
            <!-- Loader -->

            <!-- DevProfile Intro Section -->
            <v-row
              justify="start"
              align="start"
              v-if="
                !isFound && !MainViewLoader && Object.keys(userInfo).length == 0
              "
            >
              <v-col md="8">
                <p class="h1-heading">DevFest Profile Not Found</p>
                <p style="font-size:20px">
                  It seems that the user you are trying to reach has either not created their DevFest profile or has decided to keep their profile private.
                  <br> <br>
                  <b>Want to create your DevFest profile? Register Now. </b>

                </p>
                <v-btn
                  class="mt-2"
                  depressed
                  style="text-transform: capitalize"
                  to="/registration"
                  dark
                  rounded
                  color="#4285f4"
                >
                  Register Now
                </v-btn>
              </v-col>
              <v-col md="6"> </v-col>
            </v-row>
            <!-- DevProfile Intro Section -->

            <!-- DevProfile Section -->
            <v-row
              justify="center"
              align="center"
              v-if="!MainViewLoader && Object.keys(userInfo).length && isFound"
              class=""
            >
              <v-col md="12">
                <PublicProfileDashboard v-if="Object.keys(userInfo).length>0" :userInfo="userInfo"/>
              </v-col>
            </v-row>
            <!-- DevProfile Section -->
          </v-container>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script>
import DevProfileService from "@/services/DevProfileService";
import PublicProfileDashboard from '../components/DevProfile/PublicProfileDashboard.vue'
export default {
  name: "PublicProfileComponent",
  components: {
    PublicProfileDashboard
  },
  data: () => ({
    MainViewLoader: true,
    isFound: false,
    userInfo: {},
  }),
  created() {
    this.getUserData();
  },
  methods: {
    async getUserData() {
      this.MainViewLoader = true;
      this.isFound = false;
      this.userInfo = {};
      try {
        let res = await DevProfileService.getAllUserProfileInfo(
          this.$route.params.id
        );
        if (res.success) {
          this.userInfo = res.data;
          this.isFound = true;
          document.title = this.userInfo.name + " Profile | DevFest.cz 2021";
        } else {
          this.isFound = false;
          this.userInfo = {};
        }
      } catch (error) {
        console.log(error);
      }
      this.MainViewLoader = false;
    },
  },
};
</script>

<style lang="scss" scoped></style>
