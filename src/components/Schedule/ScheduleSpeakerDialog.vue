<template>
  <!-- border: 1px solid #e0e0e0;
          border-radius: 5px; -->
  <v-dialog v-model="dialog" width="700" scrollable>
    <template v-slot:activator="{ on, attrs }">
      <div
        v-on="on"
        v-bind="attrs"
        style="
          cursor: pointer;
          background: white;
        "
        class="py-2 ma-0 fill-height"
      >
        <v-list class="pa-0 ma-0">
          <v-list-item class="pa-0 ma-0">
            <v-list-item-avatar size="70">
              <v-img
                :src="getImgUrl(speakerData.image)"
                :lazy-src="getImgUrl(speakerData.image)"
                :alt="speakerData.name"
              ></v-img>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title
                class="google-font mb-0"
                style="font-size: 25px;font-weight: 600;"
                >{{ speakerData.name }}</v-list-item-title
              >
              <v-list-item-subtitle
                class="google-font mb-0"
                style="font-size: 110%;color:black"
                >{{ speakerData.company.designation }}</v-list-item-subtitle
              >
              <v-list-item-subtitle
                v-if="speakerData.company.name"
                class="google-font mb-0"
                style="font-size: 110%;color:black"
              >
                {{ speakerData.company.name }}</v-list-item-subtitle
              >
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </div>
    </template>
    <v-card class="white" v-if="dialog" style="border-radius:12px">
      <v-card-text class="pa-0">
        <v-container fluid class="py-8">
          <v-row>
            <v-col md="12" cols="12" class="px-md-10 px-3">
              <!-- Header -->
              <v-container fluid class="pa-0 ma-0">
                <v-row class="pa-0 ma-0">
                  <v-col md="10" class="pa-0 ma-0">
                    <v-list class="pa-0 ma-0">
                      <v-list-item class="pa-0 ma-0">
                        <v-list-item-avatar size="70">
                          <v-img
                            :src="getImgUrl(speakerData.image)"
                            :lazy-src="getImgUrl(speakerData.image)"
                            :alt="speakerData.name"
                          ></v-img>
                        </v-list-item-avatar>
                        <v-list-item-content>
                          <v-list-item-title
                            class="google-font mb-0"
                            style="font-size: 25px;font-weight: 600;"
                            >{{ speakerData.name }}</v-list-item-title
                          >
                          <v-list-item-subtitle
                            class="google-font mb-0"
                            style="font-size: 110%;color:black"
                            >{{
                              speakerData.company.designation
                            }}</v-list-item-subtitle
                          >
                          <v-list-item-subtitle
                            v-if="speakerData.company.name"
                            class="google-font mb-0"
                            style="font-size: 110%;color:black"
                          >
                            {{ speakerData.company.name }}</v-list-item-subtitle
                          >
                        </v-list-item-content>
                      </v-list-item>
                    </v-list>
                  </v-col>
                  <v-col md="2" class="text-right d-none d-sm-block">
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn
                          v-bind="attrs"
                          v-on="on"
                          fab
                          text
                          :to="'/speakers/' + speakerData.id"
                          target="_blank"
                          ><v-icon>mdi-open-in-new</v-icon></v-btn
                        >
                      </template>
                      <span>Otevřít v nové záložce</span>
                    </v-tooltip>
                  </v-col>
                </v-row>
              </v-container>
            </v-col>
          </v-row>
          <v-row>
            <v-col md="12" cols="12" class="px-md-10 px-5">
              <!-- <p class="google-font mb-0" style="font-size: 110%"><b>Bio</b></p> -->
              <p class="google-font" style="font-size: 120%;color:black">
                {{ speakerData.bio }}
              </p>

              <socialMediaDetails
                class="pl-0 ml-0 mb-2"
                :socialInfo="speakerData.social"
              />
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <!-- <v-divider></v-divider> -->

      <v-card-actions class="white">
        <v-spacer></v-spacer>
        <v-btn aria-label="close" class="px-10" text @click="dialog = false"
          >Zavřít</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import socialMediaDetails from "@/components/Common/PersonSocialInfo";
export default {
  name: "SpeakerDetails",
  components: {
    socialMediaDetails,
  },
  props: ["speakerData"],
  data: () => ({
    dialog: false,
  }),
  methods: {},
};
</script>

<style scoped></style>
