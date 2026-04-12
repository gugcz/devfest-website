<template>
  <div class="text-center">
    <v-dialog v-if="badge.visible" v-model="dialog" width="350">
      <template v-slot:activator="{ on, attrs }">
        <div
          v-bind="attrs"
          v-on="on"
          class="white pb-3"
          style="border-radius: 12px"
        >
          <v-img
            style="width: 70%; margin-left: auto; margin-right: auto"
            :src="badge.image"
            :lazy-src="badge.image"
            :alt="badge.name"
          />
          <p class="mb-0" style="font-size: 90%">{{ badge.name }}</p>
        </div>
      </template>

      <v-card style="border-radius: 12px">
        <v-card-title
          style="border: 0"
          class="py-15 justify-end"
          v-bind:style="{
            'background-image':
              'url(' +
              require('@/assets/img/profile/badge_card_header.svg') +
              ')',
          }"
        >
          <v-btn
            fab
            small
            :href="badgeURL"
            target="_blank"
            depressed
            color="transparent"
          >
            <span> <v-icon color="#666666">mdi-open-in-new</v-icon></span>
          </v-btn>
        </v-card-title>

        <v-card-text class="text-center" style="border: 0">
          <v-img
            style="
              width: 60%;
              margin-left: auto;
              margin-right: auto;
              margin-top: -100px;
            "
            :src="badge.image"
            :alt="badge.name"
          ></v-img>

          <p style="font-size: 20px; font-weight: 500">{{ badge.name }}</p>

          <p v-if="badge.des.length > 0">{{ badge.des }}</p>
          <v-row>
            <v-col
              md="12"
              cols="12"
              class="px-md-10 px-5 d-flex align-center justify-center"
            >
              <p class="mb-0 font-weight-bold">Share:</p>
              <v-btn
                fab
                icon
                :href="facebookshare"
                target="_blank"
                small
                rel="noreferrer"
                color="#3b5998"
              >
                <v-icon>mdi-facebook</v-icon>
              </v-btn>
              <v-btn
                fab
                icon
                :href="twitterShare"
                target="_blank"
                small
                rel="noreferrer"
                color="#00acee"
              >
                <v-icon>mdi-twitter</v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <!-- {{badge}} -->
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="dialog = false"> Close </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  props: ["badge", "userInfo", "queryID"],
  data: () => ({
    dialog: false,
    badgeURL: "",
    baseURL: "",
    isLinkCopied: false,
    twitterBaseShare:
      "Discovered this super-cool “<badge>” DevFest badge! 🥳\n\nRegister for #DevFestIndia to unlock more badges.\n\n<link> \n\n#DevFest #LetsGrowTogether",
    facebookBaseShare:
      "Discovered this super-cool “<badge>” DevFest badge!\n\nRegister for #DevFestIndia to unlock more badges.\n\n#DevFest #LetsGrowTogether",
    facebookshare: "https://www.facebook.com/sharer/sharer.php?u=<link>&quote=",
    twitterShare: "https://twitter.com/intent/tweet?url=&text=",
  }),
  mounted() {
    if (this.$props.queryID == this.$props.badge.docid) {
      this.dialog = true;
    }
    this.badgeURL =
      "https://devfestindia.com/devfest-badges?badge=" +
      Buffer.from(this.$props.badge.docid).toString("base64");
    this.setSocialMediaShareURLs();
  },
  methods: {
    getRandomEle(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    },
    setSocialMediaShareURLs() {
      // Set Twitter URL
      this.twitterBaseShare = this.twitterBaseShare.replace(
        "<badge>",
        this.$props.badge.name
      );
      this.twitterShare += encodeURIComponent(
        this.twitterBaseShare.replace("<link>", this.badgeURL)
      );

      // Set Facebook URL
      this.facebookBaseShare = this.facebookBaseShare.replace(
        "<badge>",
        this.$props.badge.name
      );
      this.facebookshare = this.facebookshare.replace("<link>", this.badgeURL);
      this.facebookshare += encodeURIComponent(this.facebookBaseShare);
    },
  },
};
</script>
