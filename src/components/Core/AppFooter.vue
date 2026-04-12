<template>
  <v-footer class="ma-0" height="auto" style="background:#CDDFFD">
    <v-container fluid
      style="background:#CDDFFD"
    >
      <v-row justify="center" align="center" class="pt-5">
        <v-col md="11" lg="9" cols="12">
          <v-card-text class="mx-0 px-0" style="height: 40px; position: relative">
            <v-fab-transition>
              <v-btn
                aria-label="FAB Button"
                style="margin-top:-30px"
                color="white"
                absolute
                top
                right
                fab
                @click="toTop"
              >
                <v-icon>mdi-chevron-up</v-icon>
              </v-btn>
            </v-fab-transition>
            <h1
              class="google-font mb-0"
            >DevFest.cz 2021 by GUG.cz & Techmeetup</h1>
          </v-card-text> 
        </v-col>
      </v-row>
      <v-row justify="center" align="center" class="pb-5">
        <v-col md="11" lg="9" cols="12" class="">
          <a href="https://2020.devfest.cz" target="_blank"
            rel="noreferrer"
            class="black--text mr-4 google-font"
            style="text-decoration:none;"
          >DevFest.cz 2020</a>
          <br class="hidden-md-and-up">
          <a href="https://2019.devfest.cz" target="_blank"
            rel="noreferrer"
            class="black--text mr-4 google-font"
            style="text-decoration:none;"
          >DevFest.cz 2019</a>
          <br class="hidden-md-and-up">
          <a href="https://developers.google.com/community/gdg" target="_blank"
            rel="noreferrer"
            class="black--text mr-4 google-font"
            style="text-decoration:none;"
          >O GDG Programu</a>
          <br class="hidden-md-and-up">
          <a href="https://www.womentechmakers.com/" target="_blank"
            rel="noreferrer"
            class="black--text mr-4 google-font"
            style="text-decoration:none;"
          >O WTM Programu</a>
          <br class="hidden-md-and-up">
          <router-link
            to="/faq"
            rel="noreferrer"
            class="mr-3 google-font black--text"
            style="text-decoration:none;"
          >FAQ</router-link>
          <br class="hidden-md-and-up">
           <a href="https://devfest.withgoogle.com/code-of-conduct" target="_blank"
            rel="noreferrer"
            class="mr-4 google-font black--text"
            style="text-decoration:none;"
          >Code of Conduct</a>
          <br class="hidden-md-and-up">
          <a href="https://developers.google.com/community-guidelines" target="_blank"
            rel="noreferrer"
            class="mr-4 google-font black--text"
            style="text-decoration:none;"
          >Community Guidelines</a>
          <br class="hidden-md-and-up">
          <a href="mailto:devfest@gug.cz" target="_blank"
            rel="noreferrer"
            class="mr-4 google-font black--text"
            style="text-decoration:none;"
          >Kontaktujte nás</a>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<script>
export default {
  name: "AppFooter",
  methods: {
    toTop() {
      this.$vuetify.goTo(0);
    }
  }
};
</script>