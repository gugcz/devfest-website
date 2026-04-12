<template>
  <v-container fluid class="google-font">
    <v-row>
      <v-col md="12" class="text-center">
        <p class="mb-0 h1-heading" style="color:#202124">
          Sledujte nás skrze <span style="color:#4184F7">#DevFestCZ</span>, ať vám neunikne žádná novinka
        </p>
        <p class="h2-subheading mb-8 mt-5" style="">
          Postupně budeme na všech sociálních sítích přidávat oznámení ke konferenci, tak si zkontrolujte, že máte nastavený odběr novinek.
        </p>

        <v-tooltip bottom v-for="(item, index) in links" :key="index">
          <template v-slot:activator="{ on }">
            <v-btn
              text
              icon
              style="background:#202124"
              class="mx-3"
              dark
              large
              v-on="on"
              rel="noreferrer"
              :href="item.link"
              target="_blank"
              slot="activator"
            >
              <v-icon>{{ item.icon }}</v-icon>
            </v-btn>
          </template>
          <span>{{ item.name }}</span>
        </v-tooltip>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "SocialMediaComponent",
  data: () => ({
    links: [
      {
        name: "Facebook",
        link: "https://www.facebook.com/DevFestCZ",
        icon: "mdi-facebook",
      },   
      {
        name: "Twitter",
        link: "https://twitter.com/GUGcz",
        icon: "mdi-twitter",
      },
      {
        name: "YouTube",
        link: "https://www.youtube.com/c/gugczgroup",
        icon: "mdi-youtube",
      },
      {
        name: "Instagram",
        link: "https://www.instagram.com/gug.cz/",
        icon: "mdi-instagram",
      },
      {
        name: "Linkedin",
        link: "https://www.linkedin.com/company/gugcz/",
        icon: "mdi-linkedin",
      },
    
    ],
  }),
  methods: {},
};
// {
//         name: "Linkedin",
//         link:
//           "https://www.linkedin.com/events/devfestindia6717758014834696192/",
//         icon: "mdi-linkedin",
//       },

</script>


