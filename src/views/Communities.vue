<template>
  <v-main>
    <v-container fluid class="mb-12 pb-4">
      <v-row align="center" justify="center">
        <v-col md="11" lg="9" cols="12" class="google-font my-0 my-12">
          <v-container fluid class="px-0 mx-0">
            <v-row justify="start" align="start">
              <v-col md="4" cols="12" class="pr-md-5">
                <h1 class="h1-heading mt-0">Tech komunity v Česku spojily síly</h1>
                <p class="google-font mt-2" style="font-size:17px;line-height: 32px;">
                  Od začátku DevFest pořádá komunita GUG.cz, která spojuje dobrovolníky a nadšence do technologií po celém Česku. V rámci měst pořádáme lokální komunitní setkání a eventy na různá témata. Společně máme za cíl vzdělávat veřejnost a ukázat prospěch technologií.
                  <br />
                  <br />
                  V letošním roce se k nám přidala naše spřátelená komunita TechMeetup Ostrava, která dává dohromady front-endisty, PHPkáře, Javisty, UX designéry atd., a společně pořádají menší meetupy po celé Ostravě se zaměřením na aktuální technická témata.
                  <br />
                  <br />
                  Díky tomuto spojení máme nejen dvakrát více zkušeností s pořádáním akcí, ale taky tím podporujeme myšlenku, že komunity a akce jsou především o lidech.
                </p>
              </v-col>
              <v-col md="8" cols="12">
                <div v-if="loading" class="my-md-15 text-center pa-15">
                  <v-progress-circular
                    indeterminate
                    color="#4184F7"
                    :width="5"
                    :size="50"
                  >
                  </v-progress-circular>
                </div>

                <iframe
                  v-show="!loading"
                  @load="load"
                  src="https://www.google.com/maps/d/u/1/embed?mid=1-LGYH365oBFDJTuIfQ8-ZuYIMycz3PNb&z=6"
                  width="100%"
                  height="580"
                  style="border-radius:18px;border:0"
                ></iframe>
              </v-col>
            </v-row>
          </v-container>
        </v-col>
        
      </v-row>

      <v-row align="center" justify="center" v-if="communitiesList.length">
        <v-col md="11" lg="9" cols="12" class="google-font">
          <h3 class="google-font mb-12">
            Komunity
          </h3>
          <v-row class="-px-4">
            <v-col
              lg="3"
              md="6"
              sm="4"
              cols="12"
              v-for="(item, index) in communitiesList"
              :key="index"
            >
              <v-card :href="item.externalLink" target="_blank" flat class="d-flex px-2 py-2" rounded="lg">
                <v-row justify="center" align="center" class="py-2">
                  <v-col cols="3" class="pl-md-6">
                    <!-- <v-avatar> -->
                    <v-img
                      width="50px"
                      height="50px"
                      :src="getCommunityImage(item.image)"
                      :lazy-src="getCommunityImage(item.image)"
                      :alt="item.title"
                    />
                    <!-- </v-avatar> -->
                  </v-col>
                  <v-col cols="9">
                    <p style="font-size:18px;font-weight:600" class="mb-0">{{item.title}}</p>
                    <p class="mx-0 my-0 caption text--secondary" v-if="item.externalLink">Více o komunitě <v-icon size="15px">mdi-chevron-right</v-icon></p>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script>
import communitiesList from "@/assets/data/communities.json";

export default {
  name: "Communities",
  data: () => ({
    loading: true,
    communitiesList: communitiesList,
  }),
  created() {
    document.title = "Komunity  | DevFest.cz 2021";
    this.communitiesList = communitiesList.sort((a, b) => {
      return a.id > b.id ? 1 : -1;
    });
  },
  methods: {
    load() {
      this.loading = false;
    },
    getCommunityImage: (name) => {
      return require('@/assets/img/communities/' + name)
    }
  }
};
</script>

<style></style>
