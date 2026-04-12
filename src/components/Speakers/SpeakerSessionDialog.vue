<template>
  <v-dialog v-model="dialog" width="800">
    <template v-slot:activator="{ on, attrs }">
      <div
        v-on="on"
        v-bind="attrs"
        style="cursor: pointer;background: white;"
        class="py-2 ma-0 fill-height"
      >
        <p
          class="mb-0"
          style="text-align: left;font-size:20px;font-weight:500;color:black"
        >
          {{ item.title }}
        </p>
        <p class="mb-0" style="font-size:90%">
            <!-- <span class="mr-3">{{item.timeDuration}} Min</span> -->
            <span v-if="item.date.length" class="mr-3"><v-icon small>mdi-calendar-month</v-icon> {{item.date}}</span>
            <span v-if="item.time.length"><v-icon small>mdi-clock-outline</v-icon> {{item.time}}</span>
        </p>
      </div>
    </template>
    <!-- Card -->
    <v-card class="white" v-if="dialog" style="border-radius:12px">
      <v-card-text class="pa-0">
        <v-container fluid class="py-8 px-md-8 py-md-10 google-font">
          <v-row>
            <v-col>
              <p
                class="mb-4"
                style="color:black;font-size:28px;font-weight:500"
              >
                {{ item.title }} details
              </p>
              <p style="font-size:110%">
                <!-- <span class="mr-3">{{item.timeDuration}} Min</span> -->
                <span v-if="item.date.length" class="mr-3"><v-icon small>mdi-calendar-month</v-icon> {{item.date}}</span>
                <span v-if="item.time.length"><v-icon small>mdi-clock-outline</v-icon> {{item.time}}</span>
              </p>
              <p class="mt-10" style="font-size:22px;color:black;font-weight:500">Info</p>
              <p style="font-size:17px;color:black;opacity:0.9">{{item.description}}</p>

              <v-btn :to="'/schedule/'+item.id" target="_blank" depressed outlined rounded style="text-decoration:none;text-transform: capitalize;">Otevřít v nové záložce <v-icon right>mdi-open-in-new</v-icon></v-btn >

              <!-- {{item}} -->
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions class="white">
        <v-spacer></v-spacer>
        <v-btn
          aria-label="close"
          class="px-5"
          color="black"
          text
          @click="dialog = false"
          >Zavřít</v-btn
        >
      </v-card-actions>
    </v-card>
    <!-- Card -->
  </v-dialog>
</template>

<script>
export default {
  name: "SpeakerSessionDialog",
  props: ["item"],
  data: () => ({
    dialog: false,
  }),
  methods:{
  }
};
</script>

<style></style>
