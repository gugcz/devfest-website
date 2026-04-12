<template>
  <v-container fluid class="ma-0 pa-0">
    <v-row align="start" justify="start" v-if="loader">
      <v-col>
        <v-progress-circular
          indeterminate
          color="primary"
        ></v-progress-circular>
      </v-col>
    </v-row>

    <v-row align="start" justify="start" v-if="!loader">
      <v-col
        md="3"
        lg="3"
        cols="4"
        class="text-center px-1 mx-0 px-md-1"
        v-for="(item, index) in badges"
        :key="index"
      >
        <badgeDialog :badge="item" :userInfo="userInfo" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import devProfileService from "../../services/DevProfileService";
import badgeDialog from "../DevProfile/BadgeDialoge.vue";
export default {
  name: "DevProfileBadges",
  props:["userInfo", "admin"],
  data: () => ({
    badges: [],
    loader: false,
  }),
  components: {
    badgeDialog,
  },
  mounted() {
    this.getAllSubscribeBadges();
  },
  methods: {
    async getAllSubscribeBadges() {
      this.loader = true;
      this.badges = [];
      if (this.admin) {
        this.badges = await devProfileService.getAllUserBadges(
          this.userInfo.docid
        );
        if (this.badges.success) {
          this.badges = this.badges.data;
        }
      } else {
        this.badges = await devProfileService.getAllUserPublicProfileBadges(
          this.userInfo.badges
        );
        if (this.badges.success) {
          this.badges = this.badges.data;
        }
      }
      this.loader = false;
    },
  },
};
</script>

<style></style>
