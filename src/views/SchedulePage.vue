<template>
  <v-main>
    <v-container fluid>
      <v-row justify="center" align="center">
        <v-col md="11" sm="11" lg="9" class="google-font my-15 py-10">
            <!-- Content -->
            <v-container fluid v-if="SessionData != null && Object.keys(SessionData).length > 0">
                <v-row>
                    <v-col>
                        <router-link class="mb-10" style="text-decoration:none;color:black" to="/schedule"><v-icon>mdi-keyboard-backspace</v-icon> Zpátky na program</router-link>

                        <p class="h1-heading mt-2">
                            {{SessionData.title}}
                        </p>
                        <p style="font-size:110%" class="mt-n4">
                            <!-- <span class="mr-3">{{item.timeDuration}} Min</span> -->
                            <span v-if="SessionData.date.length" class="mr-3"><v-icon small>mdi-calendar-month</v-icon> {{SessionData.date}}</span>
                            <span v-if="SessionData.time.length"><v-icon small>mdi-clock-outline</v-icon> {{SessionData.time}}</span>
                        </p>
                        <p class="h1-subheading mt-10">Popis</p>
                        <p style="font-size:20px;opacity:0.8;white-space: pre-line;">
                            {{SessionData.description}}
                        </p>
                        
                        <div v-if="Speakers.length>0">
                            <p class="h1-subheading mt-10 mb-0">
                                <span>Přednášející</span>
                            </p>
                            <!-- {{Speakers}} -->
                            <v-container fluid class="ma-0 pa-0">
                                <v-row justify="start" align="start">
                                    <v-col cols="12" md="6" v-for="(item, index) in Speakers" :key="index" >
                                        <SpeakerDialog :speakerData="item"/>
                                    </v-col>
                                </v-row>
                            </v-container>
                            
                        </div>
                        
                    </v-col>
                </v-row>
            </v-container>
            <!-- Content -->
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script>
import SessionDetails from "@/assets/data/sessions.json";
import SpeakersDataTemp from "@/assets/data/speakers.json";
import SpeakerDialog from '../components/Schedule/ScheduleSpeakerDialog.vue'
export default {
    name:"SchedulePage",
    components:{
        SpeakerDialog
    },
    data:()=>({
        SessionData:{},
        isFound: false,
        Speakers:[]
    }),
    mounted(){
        this.SessionData = SessionDetails.filter(
            (res) => res.id == this.$route.params.id
        )[0];

        if (this.SessionData == null) {
            this.isFound = false;
            this.$router.push("/schedule");
        } else {
            this.isFound = true;
            document.title = this.SessionData.title + " Detail | DevFest.cz 2021";
            if(this.SessionData.speakers.length){
                this.Speakers = SpeakersDataTemp.filter(obj => this.SessionData.speakers.find(x => x.toString() === obj.id))
                // console.log(this.Speakers)
            }
        }
    }
}
</script>

<style>

</style>