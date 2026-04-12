<template>
  <v-container fluid>
    <v-row md="12">
      <v-col
        cols="12"
        md="12"
        class="px-0 my-0 py-0 google-font"
        v-for="itemp in speakerData.sessionId"
        :key="itemp.id"
      >
        <v-container fluid class="">
          <v-row align="center" justify="start">
              <!-- style="border-bottom:1px solid #e0e0e0" -->
            <v-col
              :md="small?12:6"
              class="px-0"
              
              v-for="item in binarySearchSession(itemp)"
              :key="item.id"
            >
              <SpeakerSessionDialog :item="item"/> 
            </v-col>
          </v-row>
        </v-container>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import SpeakerSessionDialog from '../Speakers/SpeakerSessionDialog.vue'
export default {
  name: "SpeakerSessionCards",
  data: () => ({}),
  props: ["speakerData", "SessionDetails", 'small'],
  components:{
    SpeakerSessionDialog
  },
  mounted(){
    // console.log('Seesion card Calling')
  },
  methods: {
    binarySearchSession(id) {
      // return this.SessionDetails.;
      return [this.SessionDetails.filter((one) => one.id == id)[0]];
      // let low = 0;
      // let high = this.SessionDetails.length;
      // while (low <= high) {
      //   let mid = Math.floor(low + (high - low) / 2);
      //   if (this.SessionDetails[mid].id == id) {
          
      //     return [this.SessionDetails[mid]];
      //   } else if (this.SessionDetails[mid].id > id) {
      //     high = mid - 1;
      //   } else {
      //     low = mid + 1;
      //   }
      // }
    },
  },
};
</script>

<style></style>
