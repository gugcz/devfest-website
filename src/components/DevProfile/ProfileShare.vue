<template>
  <v-dialog v-model="dialog" width="700" scrollable>
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        v-on="on"
        v-if="userInfo.status"
        class="mt-n3 py-4"
        outlined
        small
        v-bind="attrs"
        style="border: 1px solid black"
        rounded
      >
        <v-icon left>mdi-share</v-icon> Share</v-btn
      >
    </template>
    <v-card class="white google-font" v-if="dialog" style="border-radius: 12px">
      <v-card-text class="pa-0">
        <v-container fluid class="py-8">
          <v-row>
            <v-col md="12" cols="12" class="px-md-10 px-5">
              <p style="font-size: 25px; font-weight: 550; color: black">
                {{ userInfo.name }} Public Profile
              </p>
            </v-col>
          </v-row>
          <v-row>
            <v-col md="12" cols="12" class="px-md-10 px-5">
              <!-- {{ userInfo }} -->

              <!-- <a target="_blank" style="font-size:17px" :href="baseURL+'/u/'+userInfo.docid">{{baseURL}}/u/{{userInfo.docid}}</a> -->
              <p class="google-font mb-8" style="font-size: 18px">
                Here is Your DevFest Profile's Public URL
              </p>
              <v-row justify="center" align="center" class="px-3">
                <v-text-field
                  label="Outlined"
                  disabled
                  full-width
                  v-model="baseURL"
                  placeholder="Placeholder"
                  outlined
                ></v-text-field>
                <v-btn
                  @click="CopyText()"
                  dark
                  large
                  class="py-7 ml-2 mt-n8"
                  depressed
                  color="#4285f4"
                >
                  <span v-if="isLinkCopied"><v-icon>mdi-check</v-icon></span>
                  <span v-else><v-icon>mdi-content-copy</v-icon></span>
                </v-btn>
                <v-btn
                  :href="baseURL"
                  target="_blank"
                  dark
                  large
                  class="py-7 ml-2 mt-n8"
                  depressed
                  color="#4285f4"
                >
                  <span><v-icon>mdi-open-in-new</v-icon></span>
                </v-btn>
              </v-row>
            </v-col>
          </v-row>
          <v-row>
            <v-col md="12" cols="12" class="px-md-10 px-5">
              <v-btn
                :href="facebookshare"
                target="_blank"
                rel="noreferrer"
                style="text-transform: capitalize"
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
                style="text-transform: capitalize"
                dark
                rounded
                depressed
                color="#1DA1F2"
                class="google-font mt-1 mr-2"
              >
                <v-icon size="20px" left>mdi-twitter</v-icon>Twitter
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <v-card-actions class="white">
        <v-spacer></v-spacer>
        <v-btn aria-label="close" class="px-10" text @click="dialog = false"
          >Close</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "ProfileShareComponent",
  props: ["userInfo"],
  data: () => ({
    dialog: false,
    baseURL: "",
    isLinkCopied: false,
    twitterBaseShare: [
      "Developer Profile by #DevFestIndia is super cool🤩 \nHave a look at my #DevFestProfile at <link> \nCreate yours at devfestindia.com \n#DevFest #LetsGrowTogether",
      "Developer Profile by #DevFestIndia is super cool🤩 \nCheckout my #DevFestProfile at <link> \nCreate yours at devfestindia.com\n#DevFest #LetsGrowTogether",
      "Excited to share some of my cool stuff by creating my profile with the #DevFestIndia website🤩 \nHave a look at my #DevProfile at <link> \nCreate yours at devfestindia.com \n#DevFest #LetsGrowTogether",
      "You can now track my projects with the coolest feature available at #DevFestIndia website🤩 \nHave a look at my #DevProfile at <link> \nCreate yours at devfestindia.com \n#DevFest #LetsGrowTogether",
    ],
    facebookBaseShare: [
      "Developer Profile by #DevFestIndia is super cool \nHave a look at my #DevFestProfile at <link> \nCreate yours at devfestindia.com \n#DevFest #LetsGrowTogether",
      "Developer Profile by #DevFestIndia is super cool \nCheckout my #DevFestProfile at <link> \nCreate yours at devfestindia.com\n#DevFest #LetsGrowTogether",
      "Excited to share some of my cool stuff by creating my profile with the #DevFestIndia website \nHave a look at my #DevProfile at <link> \nCreate yours at devfestindia.com \n#DevFest #LetsGrowTogether",
      "You can now track my projects with the coolest feature available at #DevFestIndia website \nHave a look at my #DevProfile at <link> \nCreate yours at devfestindia.com \n#DevFest #LetsGrowTogether",
    ],
    facebookshare:
      "https://www.facebook.com/sharer/sharer.php?u=https://devfestindia.com&quote=",
    twitterShare: "https://twitter.com/intent/tweet?url=&text=",
    linkedInShare: "http://www.linkedin.com/shareArticle?mini=true&url=",
  }),
  mounted() {
    this.baseURL = window.location.origin + "/u/" + this.userInfo.docid;
    this.setSocialMediaShareURLs();
  },
  methods: {
    CopyText(e) {
      document.addEventListener("copy", (e) => {
        e.clipboardData.setData("text/plain", this.baseURL);
        e.preventDefault();
        document.removeEventListener("copy", null);
      });
      document.execCommand("copy");

      this.isLinkCopied = true;
      setTimeout(() => {
        this.isLinkCopied = false;
      }, 3000);
    },
    getRandomEle(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    },
    setSocialMediaShareURLs() {
      this.twitterShare += encodeURIComponent(
        this.getRandomEle(this.twitterBaseShare).replace("<link>", this.baseURL)
      );
      this.facebookshare += encodeURIComponent(
        this.getRandomEle(this.facebookBaseShare).replace(
          "<link>",
          this.baseURL
        )
      );
    },
  },
};
</script>
