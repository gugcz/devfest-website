<template>
  <v-container fluid class="" v-if="data">
    <v-row
      justify="center"
      align="center"
      v-for="(item, index) in data['schedule']"
      :key="index"
      class="pa-0 my-0 row-border-white"
    >
      <v-col md="2" cols="3" class="text-right my-0 py-0">
        <p v-if="item.startTime.length == 0" style="font-size:130%" class="mb-0 google-font">
          TBA
        </p>  
        <p style="font-size:130%" class="mb-0 google-font">
          {{ item.startTime }}
        </p>
        <p style="font-size:80%" class="ma-0 google-font">{{ item.endTime }}</p>
        <p class="mt-1 google-font" style="font-size:70%">
          <b style="color:grey" v-if="item.startTime.length > 0">GMT (+02:00)</b>
        </p>
      </v-col>
      <v-col
        class="my-0 schedule-details-white col-border-white"
        cols="9"
        md="10"
      >
        <ScheduleDialog :data="getSessionData(item.session)" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import ScheduleDialog from "@/components/Schedule/ScheduleDialog";
import SessionsData from "@/assets/data/sessions.json";
export default {
  props: ["data"],
  components: {
    ScheduleDialog,
  },
  data: () => ({
    SessionsData: SessionsData,
  }),
  methods: {
    getSessionData(id) {
      return this.SessionsData.filter((sd) => sd.id == id)[0];
    },
  },
};
</script>

<style scoped>
.schedule-details-white:hover {
  background: #fafafa;
}
.row-border-white {
  border-bottom: 1px solid #e0e0e0;
}
.col-border-white {
  border-left: 1px solid #e0e0e0;
}
</style>