<template>
  <v-dialog v-model="dialog" width="800" scrollable>
    <template v-slot:activator="{ on }">
      <div v-on="on" style="cursor: pointer" class="py-3 ma-1 fill-height">
        <p class="mb-0 h1-subheading google-font">{{ data.title }}</p>

        <span v-if="data.tag && data.tagColor">
          <v-chip pill class="mt-2 mr-2" :color="data.tagColor" small>
            {{ data.tag }}
          </v-chip> 
        </span>   

        <span v-for="(itemp, indexp) in speakers" :key="indexp">
          <v-chip pill class="mt-2 mr-2" outlined small >
            <v-avatar left>
              <img :src="getImgUrl(itemp.image)" class="image-wrapper" />
            </v-avatar>
            {{ itemp.name }}
          </v-chip>
        </span>

        <!-- <span class="mt-5">{{ data.timeDuration }} min</span> -->
      </div>
    </template>

    <v-card class="pa-0 white" v-if="dialog" style="border-radius:12px">
      <iframe
        v-if="data.link"
        class="ma-0 pa-0"
        width="100%"
        height="315"
        style="border: none"
        :src="data.link"
      >
      </iframe>
      <v-card-title
        class="google-font pa-md-5 px-md-8"
        style="background-position: right bottom"
      >
        <p
          class="mb-0"
          style="text-align: left;font-size:25px;font-weight:500;color:black;word-break: keep-all;"
        >
          {{ data.title }}
        </p>
        <v-spacer></v-spacer>
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-bind="attrs"
              v-on="on"
              fab
              text
              :to="'/schedule/' + data.id"
              target="_blank"
              ><v-icon>mdi-open-in-new</v-icon></v-btn
            >
          </template>
          <span>Otevřít v nové záložce</span>
        </v-tooltip>
      </v-card-title>
      <v-card-text class="px-5 google-font mt-n8">
        <v-container fluid>
          <v-row>
            <v-col md="12" cols="12">
              <p style="font-size:110%">
                <!-- <span class="mr-3">{{item.timeDuration}} Min</span> -->
                <span v-if="data.date.length" class="mr-3"
                  ><v-icon small>mdi-calendar-month</v-icon>
                  {{ data.date }}</span
                >
                <span v-if="data.time.length" class="mr-3"
                  ><v-icon small>mdi-clock-outline</v-icon>
                  {{ data.time }}</span
                >

                <span class="mr-3">{{ data.timeDuration }} Min</span>
                <a class="mr-3" v-if="data.place.length > 0" :href="data.placeLink" style="color: rgba(0, 0, 0, 0.6)" target="_blank">{{ data.place }}</a>
                <span class="mr-3" v-if="data.company.length >0">{{ data.company }}</span>
              </p>

              <p class="mt-10" style="font-size:22px;color:black;font-weight:500">Popis</p>
              <p class="google-font" style="font-size:17px;color:black;opacity:0.9;white-space: pre-line;">{{data.description}}</p>

              <!-- <v-chip small pill>{{ data.format }}</v-chip> -->
              
              <v-chip
                v-if="data.slide"
                :href="data.slide"
                color="indigo"
                outlined
                target="_blank"
                class="mt-2 mr-2"
                label
              >
                <v-avatar left>
                  <v-icon small>mdi-note-outline</v-icon>
                </v-avatar>
                Prezentace
              </v-chip>
              <v-container fluid class="px-0 mx-0">
                <v-row
                  class="pa-0 ma-0"
                  v-for="(itemp, indexp) in speakers"
                  :key="indexp"
                >
                  <v-col class="pa-0 ma-0">
                    <router-link target="_blank" style="text-decoration:none" :to="'/speakers/' + itemp.id">
                    <v-list
                      two-line
                      subheader
                      class="pa-0 ma-0 white"
                    >
                      <v-list-item class="my-0 py-0">
                        <v-list-item-avatar size="50">
                          <img
                            :src="getImgUrl(itemp.image)"
                            class="image-wrapper"
                          />
                        </v-list-item-avatar>
                        <v-list-item-content>
                          <v-list-item-title class="google-font" style="font-size:22px;font-weight:500">{{
                            itemp.name
                          }}</v-list-item-title>
                          <v-list-item-subtitle
                            class="google-font text-wrap"
                            style="font-size:17px;"
                            v-if="itemp.company.designation"
                          >
                            {{ itemp.company.designation }}
                            <span v-if="itemp.company.name">,</span>
                            {{ itemp.company.name }}
                          </v-list-item-subtitle>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list>
                    </router-link>
                  </v-col>
                </v-row>
              </v-container>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn aria-label="close" text @click="dialog = false">Zavřít</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import SpeakersData from "@/assets/data/speakers.json";
export default {
  components: {},
  inject: ["theme"],
  props: ["data"],
  data() {
    return {
      dialog: false,
      SpeakersData: SpeakersData,
      speakers: [],
    };
  },
  mounted() {
    this.speakers = [];
    this.speakers = this.SpeakersData.filter(obj => this.data.speakers.find(x => x.toString() === obj.id))
  },
  filters: {
    summary: (val, num) => {
      if (val.length > num) return val.substring(0, num) + "..";
      else return val;
    },
  },
};
</script>
<style scoped>
.image-wrapper {
  object-fit: cover;
  object-position: center;
}
</style>
