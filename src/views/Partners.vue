<template>
  <v-main>
    <v-container fluid class="px-5 my-md-4">
      <v-row align="center" justify="center">
        <v-col md="11" lg="9" cols="12" class="google-font">
          <v-container fluid class="px-0 mx-0">
            <v-row justify="start" align="start">
              <v-col class="pr-md-5">
                <h1 class="h1-heading mt-0"><span style="color:#4184F7">Děkujeme</span> našim partnerům!</h1>
              </v-col>
            </v-row>
            <!-- <v-row>
              <v-col cols="12" sm="10" md="8" lg="6" class="">
                <p class="google-font mt-2" style="font-size:17px;line-height: 32px;">
                  We’ve partnered with  top companines to help our community members find jobs. Find the role that fits you best and apply.
                </p>
              </v-col>
            </v-row> -->
          </v-container>
        </v-col>
      </v-row>
    </v-container>
    <PartnersJobsListing />
  </v-main>
</template>

<script>
import PartnersJobsListing from "../components/Partners/PartnersJobsListing.vue";
export default {
  name: "Partners",
  data: () => ({
    loading: true,
  }),
  components: {
    PartnersJobsListing
  },
  created() {
    document.title = "Partneři | DevFest.cz 2021";
  },
  methods: {
    load() {
      // console.log("loaded");
      this.loading = false;
    },
  },
};
</script>

<style></style>
