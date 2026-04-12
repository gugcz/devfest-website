<template>
  <v-container fluid class="google-font white" style="border-radius:18px">
    <v-row class="my-0 pa-5 px-6" align="center" justify-md="center">
      <v-col md="4" lg="4" sm="4" cols="12" class="my-0 py-md-5 py-0 product-cards">
          <v-card
            outlined
            color="#FBE9E7"
            style="border-radius:18px"
            to="/profile"
            class="pa-6"
          >
            <v-icon x-large class="my-2" color="#202124"
              >mdi-account-child</v-icon
            >
            <p style="font-size: 22px; font-weight: 600; margin-bottom: 10px">
              DevFest Profile
            </p>
            <p style="font-size: 16px">
              Create your DevFest Profile and Earn more Badges through attending the events.
            </p>
            <v-card-actions class="ml-n2">
              <router-link class="px-0 py-0" style="text-transform: capitalize;font-weight:600;text-decoration: none;color:#202124" text to="/profile">Create Now</router-link>
            </v-card-actions>
          </v-card>
      </v-col>
      <v-col md="4" lg="4" sm="4" cols="12" class="my-0 py-5 product-cards">
          <v-card
            outlined
            color="#C7EFEE"
            style="border-radius:18px"
            to="/badge"
            class="pa-6"
          >
            <v-icon x-large class="my-2" color="#202124"
              >mdi-book-account</v-icon
            >
            <p style="font-size: 22px; font-weight: 500; margin-bottom: 10px">
              Create Your Badge
            </p>
            <p style="font-size: 16px">
              Create your Digital Profile Badge and share on social media with #DevFestIndia. 
            </p>
            <v-card-actions class="ml-n2 mb-0">
              <router-link class="px-0 py-0" style="text-transform: capitalize;font-weight:600;text-decoration: none;color:#202124" dark text to="/badge">Create Now</router-link>
            </v-card-actions>
          </v-card>
      </v-col>
      <v-col md="4" lg="4" sm="4" cols="12" class="my-0 py-5 product-cards">
          <v-card
            outlined
            color="#FFE8CD"
            style="text-decoration: none;border-radius:18px"
            href="https://gdg.community.dev/"
            target="_blank"
            rel="noreferrer"
            class="pa-6"
          >
            <v-icon x-large class="my-2" color="#202124"
              >mdi-account-multiple-check</v-icon
            >
            <p style="font-size: 22px; font-weight: 500; margin-bottom: 10px">
              Connect with us!
            </p>
            <p style="font-size: 16px">
              Follow us on our Social Media handles and join your nearest GDG Community.
            </p>
            <v-card-actions class="ml-n2 mb-0">
              <a
                color="#E38D28"
                text
                class="px-0 py-0"
                style="text-transform: capitalize;font-weight:600;text-decoration: none;color:#202124"
                href="https://gdg.community.dev/"
                rel="noreferrer"
                target="_blank"
                >Join GDG Community</a
              >
            </v-card-actions>
          </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "Products",
  data: () => ({}),
};
</script>

<style lang="scss" scoped>
.product-cards {
  border-radius: 12px;
  & > div {
    padding: 25px 0px;
    i,
    p {
      padding: 0px 20px;
    }
    i {
      padding-bottom: 10px;
    }
  }
}
</style>
