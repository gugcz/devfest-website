<template>
  <v-container fluid class="">
    <v-row class="">
      <v-col class="px-4">
        <p class="google-font mb-0 h1-heading">
          Často kladené dotazy
        </p>
        <p class="google-font mb-4" style="font-size:110%">
          Potřebujete odpovědi? Pokud nenajdete odpovědi níže, neváhejte nám dotaz napsat
          <router-link to="/faq" style="text-decoration:none">zde</router-link>.
        </p>
      </v-col>
    </v-row>
    <v-row>
      <v-col md="7" lg="8" sm="11" cols="12" class="pa-0 ma-0 px-4 mx-0 ">
        <v-expansion-panels accordion class="" flat>
          <v-expansion-panel
            v-for="(faq, i) in faqsData"
            :key="i"
            class="px-0 mx-0 "
            style="border-bottom:1px solid #CDDFFD;background:#EFF7FF"
          >
            <v-expansion-panel-header class="px-0">
              <p class="google-font" style="font-size:125%;margin:auto;">
                {{ faq.question }}
              </p>
            </v-expansion-panel-header>
            <v-expansion-panel-content class="px-0">
              <p
                class="google-font my-0 ma-0 ml-n6 mt-n1"
                style="font-size:110%;"
                v-html="faq.answer"
              ></p>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import data from "@/assets/data/faq.json";
export default {
  name: "Faqs",
  data: () => ({
    faqsData: [],
  }),
  mounted() {
    this.faqsData = data.slice(0, 5);
  },
};
</script>

<style scoped></style>
