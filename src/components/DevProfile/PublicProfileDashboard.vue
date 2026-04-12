<template>
  <v-container fluid class="pa-0 ma-0 mb-8">
    <v-row justify="start" align="start" class="mt-md-n4">
      <!-- Col 1 -->
      <v-col md="6" lg="5" cols="12" class="pr-md-3 pr-lg-5">
        <p class="h1-heading mb-0">{{ userInfo.name }}</p>
        <p class="h2-subheading mt-0 mb-5">
          <span class="mr-4">
            <v-icon>mdi-account-circle-outline</v-icon> {{ userInfo.role }},
            {{ userInfo.org }}
          </span>
          <!-- <br class="d-block d-sm-none" /> -->
          <br>
          <v-icon>mdi-map-marker</v-icon> {{ userInfo.city }},
          {{ userInfo.country }}
        </p>
        <span class="mb-3"></span>
        <ProfileShare :userInfo="userInfo" />

        <!-- About -->
        <p
          class="mt-10 mb-1"
          v-if="userInfo.bio.length > 0"
          style="font-size: 22px;font-weight:600"
        >
          About Me
        </p>
        <p class="mt-3" style="font-size: 18px" v-if="userInfo.bio.length > 0">
          {{ userInfo.bio }}
        </p>
        <!-- About -->
        <!-- Social -->
        <SocialMediaBtns
          class="mt-5"
          v-if="userInfo.social != null"
          :data="userInfo.social"
        />
        <!-- Social -->
        <!-- Tech Skills -->
        <div v-if="userInfo.techstack.length > 0">
          <p class="mb-4 mt-md-8" style="font-size: 22px;font-weight:600">
            Technical Skills
          </p>
          <v-chip
            class="mr-2 mb-2"
            color="#EFF7FF"
            style="border:1px solid black"
            v-for="(item, index) in userInfo.techstack"
            :key="index"
          >
            {{ item }}
          </v-chip>
        </div>
        <!-- Tech Skills -->

        <!-- Interested in -->
        <div v-if="userInfo.interest.length > 0">
          <p class="mb-4 mt-md-8" style="font-size: 22px;font-weight:600">
            I am Interested In
          </p>
          <v-chip
            class="mr-2 mb-2"
            color="#EFF7FF"
            style="border:1px solid black;color:black"
            v-for="(item, index) in userInfo.interest"
            :key="index"
          >
            {{ item }}
          </v-chip>
        </div>
        <!-- Interested in -->
      </v-col>

      <!-- Col 2 -->
      <v-col md="6" lg="7" cols="12">
        <!-- My Badges -->
        <div class="mb-8">
          <p class="mb-0" style="font-size: 22px;font-weight:600">
            My Badges
            <!-- <AddBadge /> -->
          </p>
          <p>You can earn more badges by attending more sessions.</p>

          <DevProfileBadges
            v-if="Object.keys(userInfo).length > 0"
            :userInfo="userInfo"
            :admin="false"
          />
        </div>
        <PublicProfileCommunityShowcase
            v-if="userInfo.projects.length"
            :projects="userInfo.projects"
          />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import DevProfileBadges from "../DevProfile/DevProfileBadges.vue";
import PublicProfileCommunityShowcase from "../DevProfile/PublicProfileCommunityShowcase.vue";
import ProfileShare from "../DevProfile/ProfileShare.vue";
import SocialMediaBtns from "../DevProfile/SocialMediaBtns.vue";
export default {
  name: "PublicProfileDashboard",
  props: ["userInfo"],
  data: () => ({}),
  components: {
    DevProfileBadges,
    PublicProfileCommunityShowcase,
    ProfileShare,
    SocialMediaBtns,
  },
  methods: {},
};
</script>

<style scoped></style>
