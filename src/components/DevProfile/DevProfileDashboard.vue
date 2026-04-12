<template>
  <v-container fluid class="pa-0 ma-0 mb-8">
    <v-overlay :value="AddBadgeOverlay" class="text-center">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
      <br /><br />
      Redeem badge....
    </v-overlay>
    <!-- New -->
    <v-row justify="start" align="start">
      <v-col md="12" lg="12" cols="12" class="text-right">
        <EditProfile
          :data="userInfo"
          @ProfileUpdateSuccess="$emit('ProfileUpdateSuccess')"
        />
        
      </v-col>
    </v-row>
    <v-row justify="start" align="start" class="mt-md-n4">
      <!-- Col 1 -->
      <v-col md="6" lg="5" cols="12" class="pr-md-3 pr-lg-5">
        <p class="h1-heading mb-0">{{ userInfo.name }}</p>
        <p class="h2-subheading mt-0 mb-5">
          <span class="mr-4">
            <v-icon>mdi-account-circle-outline</v-icon> {{ userInfo.role }},
            {{ userInfo.org }}
          </span>
          <!-- class="d-block d-sm-none" -->
          <br >
          <v-icon>mdi-map-marker</v-icon> {{ userInfo.city }},
          {{ userInfo.country }}
        </p>
        <span class="mb-3"></span>
        <v-chip color="green" outlined class="mt-n3 mr-2 py-4 px-5"
          ><v-icon left> mdi-check-outline </v-icon>Registered</v-chip
        >
        <v-chip
          :color="userInfo.status ? 'green' : 'red'"
          outlined
          class="mt-n3 mr-2 py-4 px-5"
        >
          <v-icon left>mdi-account-circle-outline</v-icon>
          {{ userInfo.status ? "Public" : "Private" }}
        </v-chip>
        <ProfileShare :userInfo="userInfo" />
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

        <SocialMediaBtns
          class="mt-5"
          v-if="userInfo.social != null"
          :data="userInfo.social"
        />

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
            :admin="true"
          />
        </div>
        <CommunityShowcase :userInfo="userInfo" />

        
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import DevProfileBadges from "../DevProfile/DevProfileBadges.vue";
import CommunityShowcase from "../DevProfile/CommunityShowcase.vue";
import SocialMediaBtns from "../DevProfile/SocialMediaBtns.vue";
// import AddBadge from "../DevProfile/AddBadge.vue";
import ProfileShare from "../DevProfile/ProfileShare.vue";
import EditProfile from "../DevProfile/EditProfile.vue";

import devProfileService from "@/services/DevProfileService";

export default {
  name: "DevFestProfileDashboard",
  props: ["userInfo"],
  data: () => ({
    AddBadgeOverlay: false,
  }),
  created() {
    document.title = this.userInfo.name + " Profile | DevFest.cz 2021";
  },
  mounted() {
    if (Object.keys(this.$route.query) == "redeem-badge") {
      if (this.$route.query["redeem-badge"].length > 5) {
        this.addBadgeFromURL(this.$route.query["redeem-badge"]);
      }
    }
  },
  components: {
    DevProfileBadges,
    CommunityShowcase,
    // AddBadge,
    EditProfile,
    ProfileShare,
    SocialMediaBtns,
  },
  methods: {
    async addBadgeFromURL(code) {
      // Logic for add Bade by Code
      this.AddBadgeOverlay = true;
      // console.log(code);
      const codeDetails = await devProfileService.findBadgeExists(code);
      // console.log(codeDetails);
      if (!codeDetails.isExist) {
        // alert("Code Does not exist");
        this.$emit("BadgesSuccess", "Code Does not exist");
        this.AddBadgeOverlay = false;
        this.$router.replace("/profile/");
        return;
      }

      const redeem = await devProfileService.redeemBadge(
        this.userInfo.docid,
        codeDetails.data.codeDocId,
        this.userInfo.status
      );
      // console.log(redeem);
      this.$emit("BadgesSuccess", redeem.message);
      // alert(redeem.message)
      this.$router.replace("/profile/");
      this.AddBadgeOverlay = false;
    },
  },
};
</script>

<style scoped></style>
