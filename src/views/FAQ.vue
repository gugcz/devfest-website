<template>
  <v-main>
    <v-container fluid class="">
      <v-row justify="center" align="center">
        <v-col md="11" sm="11" lg="9" class="google-font my-10 py-10">
          <v-container fluid>
            <v-row align="start" justify="start">
              <v-col md="11" lg="9">
                <p class="mb-0 h1-heading">Často kladené dotazy</p>
                <p class="my-0 mb-8 h1-subheading">
                  Potřebujete odpovědi? Pokud nenajdete odpovědi níže, neváhejte nám dotaz  <a href="mailto:devfest@gug.cz" target="_blank"
            rel="noreferrer"
            class="mr-4 google-font black--text"
            style="text-decoration:none;"
          >napsat</a>.
                </p>
                <v-expansion-panels flat accordion class="">
                  <v-expansion-panel
                    v-for="(faq, i) in faqsData"
                    :key="i"
                    class="px-0 mx-0"
                    style="border-bottom:1px solid #CDDFFD;background:#EFF7FF"
                  >
                    <v-expansion-panel-header class="px-0">
                      <p
                        class="google-font"
                        style="font-size:125%;font-weight:500;margin:auto;"
                      >
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
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script>
import data from "../assets/data/faq.json";
export default {
  name: "FAQComponent",
  data: () => ({
    faqsData: data,
  }),
  created(){
    document.title = 'FAQ | DevFest.cz 2021'
  }
};
</script>

<style scoped></style>