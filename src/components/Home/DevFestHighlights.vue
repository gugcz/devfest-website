<template>
  <v-container class="py-10 google-font ma-0 px-0">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="12" md="7" lg="7">
        <div
          class="pa-md-10 pa-4"
          style="border: 1px solid #e0e0e0; border-radius: 12px"
        >
          <p class="h1-subheading">DevFest India 2020</p>
          <p style="font-size: 18px">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ullam
            laboriosam tempore quasi! Doloribus, consequatur tenetur, non nobis
            repellat blanditiis animi perferendis mollitia explicabo error vel
            eum possimus facere, consequuntur officiis.
          </p>

          <v-btn
            class="mr-2"
            rounded
            color="#4d4d4d"
            depressed
            dark
            href="https://www.youtube.com/playlist?list=PLlaYvYzhTrYkZNBk6tXFepXnyispDs3IK"
            target="_blank"
            rel="noreferrer"
          >
            <v-icon left>mdi-youtube</v-icon>
            Watch Now</v-btn
          >
          <v-btn
            depressed
            outlined
            rounded
            href="https://2020.devfestindia.com/"
            target="_blank"
            rel="noreferrer"
          >
            <v-icon left>mdi-open-in-new</v-icon>
            Learn More</v-btn
          >
        </div>
      </v-col>
      <v-col cols="12" sm="12" md="5" lg="5">
        <v-container fluid>
          <v-row>
            <v-col
              cols="4"
              md="4"
              class="text-center"
              v-for="(item, index) in stats"
              :key="index"
            >
              <p class="mb-0" style="font-size: 28px; font-weight: 600">
                {{ item.value }}
              </p>
              <p class="my-0" style="font-size: 95%">{{ item.name }}</p>
            </v-col>
          </v-row>
        </v-container>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "DevFestHighlightsComponent",
  data: () => ({
    stats: [
      {
        name: "Registrations",
        value: "40K+",
      },
      {
        name: "Women Registration",
        value: "23.83%",
      },
      {
        name: "Total Viewers",
        value: "86K+",
      },
      {
        name: "Days",
        value: "3",
      },
      {
        name: "Sessions",
        value: "15+",
      },
      {
        name: "Women Speakers",
        value: "50%",
      },
    ],
  }),
};
</script>
