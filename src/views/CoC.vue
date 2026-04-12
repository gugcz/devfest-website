<template>
  <v-main>
    <v-container fluid class="">
      <v-row justify="center" align="center">
        <v-col md="11" lg="9" class="google-font my-10 py-10">
          <v-container fluid>
            <v-row align="start" justify="start">
              <v-col md="11" lg="11">
                <p class="mb-0 h1-heading">Code of Conduct</p>
                <p class="my-0 mb-8 h1-subheading">
                  All participants of DevFest India 2021 event, online
                  attendees, event staff, and speakers, must abide by the
                  following policy:
                </p>
                <v-container fluid class="ma-0 pa-0">
                  <v-row align="start" justify="start">
                    <v-col
                      md="4"
                      cols="12"
                      v-for="(item, index) in cocData"
                      :key="index"
                    >
                      <p class="google-font" style="font-size:1.2em;">
                        <b>{{ item.name }}</b>
                      </p>
                      <p class="google-font" style="font-size:110%">
                        {{ item.des }}
                      </p>
                    </v-col>
                  </v-row>
                </v-container>
              </v-col>
            </v-row>
          </v-container>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script>
export default {
  name: "CoCComponent",
  data: () => ({
    cocData: [
      {
        name: "Be nice to the other attendees",
        des:
          "We're all part of the same community, so be friendly, welcoming, and generally a nice person. Be someone that other people want to be around. ",
      },
      {
        name: "Be respectful and constructive",
        des:
          "Remember to be respectful and constructive with your communication in discussions to fellow attendees. Don't get into flame wars, make personal attacks, vent, or rant unconstructively. Everyone should take responsibility for the community and take the initiative to diffuse tension and stop a negative thread as early as possible.",
      },
      {
        name: "Be collaborative",
        des:
          "We are here to learn a lot from each other. Share knowledge, and help each other out. You may disagree with ideas, not people.",
      },
      {
        name: "Participate",
        des:
          "Be a good listener.  Be mentally present in the sessions you are interested in. Join in on discussions, show up for the sessions on time, offer feedback on your event experience, and help us get better in our community engagements.",
      },
      {
        name: "Basic etiquette for online discussions",
        des:
          "Keep off topic conversations to a minimum. Don’t be spammy by advertising or promoting personal projects which are off topic.",
      },
    ],
  }),
  created() {
    document.title = "Code of Conduct | DevFest.cz 2021";
  },
};
</script>

<style scoped></style>
