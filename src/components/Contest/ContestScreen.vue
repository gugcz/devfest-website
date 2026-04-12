<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <p class="h1-heading">Let's Decode | Contest</p>
        <p class="mt-n3" style="font-size:18px"><b>Submission ends at 5:00 PM IST Sept 5, 2021</b></p>
        
        <p style="font-size:17px">
          Welcome to DevFest India 2021. Thank you for showing your interest and
          participating in the first contest by #DevFestIndia. You are just a
          step away from winning the contest, so be hurry.
        </p>
        <p style="font-size:17px">
          Earn your badge by entering the correct code below.
          <br /><br />
          Note: Winners will be announced on first come first serve basis.
        </p>
        <!-- {{CheckingLoader}} -->

        <!-- Loader -->
        <v-progress-circular
          :size="50"
          color="primary"
          v-if="CheckingLoader"
          indeterminate
        ></v-progress-circular>

        <div v-if="!CheckingLoader">
          <!-- Form -->
          <div v-if="!userSubmitted && !alreadySubmitted">
            <v-form ref="form" v-model="form">
              <v-text-field
                label="Enter Code to redeem badge"
                class="mb-4 mt-8"
                placeholder="Enter Code to redeem badge"
                autocomplete="off"
                :rules="codeRule"
                v-model="code"
                style="max-width:450px"
                outlined
              ></v-text-field>
            </v-form>

            <v-btn
              rounded
              large
              dark
              color="#4285f4"
              style="text-transform: capitalize"
              depressed
              class="mt-n5"
              :loading="loader"
              @click="participateNow()"
              >Submit</v-btn
            >
          </div>

           <!-- Form Submitted -->
        <div v-if="userSubmitted === true && !alreadySubmitted && !CheckingLoader" class="pa-md-7 pa-5" style="background:white;border-radius:12px">
          <p style="font-size:17px">
            Thank you for participating in <b>Let's Decode</b> Contest by #DevFestIndia.
          </p>
          <p style="font-size:17px">We will announce the result from <a href="https://twitter.com/gdgindia" target="_blank">GDG India twitter</a> account on <b>Sept 5, 2021</b></p>
          
        <v-btn to="/profile" color="#4285f4" dark class="mt-2 mr-3" depressed rounded style="text-transform: capitalize;">
            <v-icon left>mdi-account-child</v-icon>
            Get Your New Badge
        </v-btn>
        </div>

        <!-- Already Submission -->
        <div v-if="!userSubmitted && alreadySubmitted && !CheckingLoader" class="pa-md-7 pa-5" style="background:white;border-radius:12px">
          <h3 class="google-font mb-3">
                  You have already submitted this form
                </h3>
          <p style="font-size:17px">
            
            Thank you for participating in <b>Let's Decode</b> Contest by #DevFestIndia.
          </p>
          <p style="font-size:17px">We will announce the result from <a href="https://twitter.com/gdgindia" target="_blank">GDG India twitter</a> account on <b>Sept 5, 2021</b></p>
          
          <v-btn to="/profile" color="#4285f4" dark class="mt-2 mr-3" depressed rounded style="text-transform: capitalize;">
              <v-icon left>mdi-account-child</v-icon>
              Get Your New Badge
          </v-btn>
        </div>
        </div>

        

       

        <p class="mt-md-15 mt-6" style="font-size:17px">Let's get connected so that we can reach out to each other via a simple notification. Stake out <span style="color:#4184F7">#DevFestIndia</span> for the updates and news.</p>
        <v-tooltip bottom v-for="(item, index) in links" :key="index">
          <template v-slot:activator="{ on }">
            <v-btn
              text
              icon
              style="background:#202124"
              class="mx-2"
              dark
              v-on="on"
              rel="noreferrer"
              :href="item.link"
              target="_blank"
              slot="activator"
            >
              <v-icon>{{ item.icon }}</v-icon>
            </v-btn>
          </template>
          <span>{{ item.name }}</span>
        </v-tooltip>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import FDK from "../../Config/firebase";
import ContestService from "../../services/ContestService";
export default {
  name: "ContestScreen",
  props: ["userInfo"],
  data: () => ({
    links: [
      {
        name: "Twitter",
        link: "https://twitter.com/gdgindia",
        icon: "mdi-twitter",
      },
      {
        name: "YouTube",
        link: "https://www.youtube.com/c/gdgindia",
        icon: "mdi-youtube",
      },
      {
        name: "Instagram",
        link: "https://www.instagram.com/gdgindia/",
        icon: "mdi-instagram",
      },
      
    ],
    CheckingLoader: true,
    form: false,
    loader: false,
    code: "",
    ContestParticipantBadgeCode: "GeIaVgabX7Emx7sufrFj",
    userSubmitted: false,
    ContestName: "letsdecode",
    alreadySubmitted: false,
    codeRule: [
      (v) => !!v || "Code is required",
      (v) => (v && v.length === 6) || "Code must be in 6 Digit",
    ],
  }),
  mounted(){
    this.checkUserSubmission()
  },
  methods: {
    async checkUserSubmission(){
     let res= await ContestService.checkSubmission(this.userInfo.docid)
     if(res.success){
       this.alreadySubmitted = true
       this.CheckingLoader = false
     }else{
       this.alreadySubmitted = false
       this.CheckingLoader = false
     }
     
    },
    async participateNow() {
      this.loader = true;
      this.alreadySubmitted = false
      this.userSubmitted = false
      if (this.$refs.form.validate()) {
        // this.ContestParticipantBadgeCode
        // Check participants badge

        this.code= this.code.toUpperCase()
        
        let res = await ContestService.participateIntoContest(
          this.userInfo.docid,
          this.userInfo.email,
          this.userInfo.status,
          FDK.firebase.firestore.FieldValue.serverTimestamp(),
          this.ContestParticipantBadgeCode,
          this.ContestName,
          this.code
        );
        if (res.success && res.status) {
          this.userSubmitted = true;
          this.loader = false;
        }else if(!res.success && !res.status){
          this.userSubmitted = true;
          this.loader = false;
        }
        //
      } else {
        this.loader = false;
      }
    },
  },
};
</script>

<style></style>
