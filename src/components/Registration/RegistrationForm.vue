<template>
  <v-container fluid class="my-0 py-0">
    <v-row>
      <v-col>
        <h3 class="google-font">Detail</h3>
        <p class="mb-8">Povinná pole jsou označena hvězdičkou</p>
      </v-col>
    </v-row>

    <v-row class="my-0 py-0">
      <v-col class="my-0 py-0" md="9">
        <v-form ref="form" autocomplete="off">
          <!-- Email Id -->
          <TextField
            :model.sync="user.email"
            label="Email"
            :required="true"
            :disabled="true"
          />
          <!-- Email Id -->

          <!-- Full Name -->
          <TextField
            :model.sync="response.name"
            label="Jméno"
            :required="true"
            :disabled="false"
          />
          <!-- Full Name -->

          <!-- City -->
          <!-- <TextField
            :model.sync="response.city"
            label="City"
            :required="true"
            :disabled="false"
          /> -->
          <!-- City -->

          <!-- Country -->
          <!-- <CountrySelect :model.sync="response.country" /> -->
          <!-- Country -->

          <!-- Company/Org -->
          <TextField
            :model.sync="response.org"
            label="Společnost"
            :required="true"
            :disabled="false"
          />
          <!-- Company/Org -->

          <!-- Role -->
          <!-- <TextField
            :model.sync="response.role"
            label="Role"
            :required="true"
            :disabled="false"
          /> -->
          <!-- Role -->

          <!-- Gender -->
          <!-- <RadioBtn
            label="Pohlaví"
            :model.sync="response.gender"
            :options="['Žena', 'Muž', 'Nechci sdělovat']"
          /> -->
          <!-- Gender -->

          <!-- Experience -->
          <!-- <RadioBtn
            class="mt-5"
            label="Roky zkušeností"
            :model.sync="response.experience"
            :options="[
              '0 - 2 roky',
              '3 - 5 let',
              '6 - 10 let',
              '11+ let',
            ]"
          /> -->
          <!-- Experience -->

          <!-- Area of Interest -->
          <!-- <Checkbox
            label="Tracks / themes you are interested to attend."
            :model.sync="response.theme"
            :options="['Mobile', 'Cloud', 'Web', 'Machine Learning','Cross Platform', 'Professional skills']"
          /> -->
          <!-- Area of Interest -->

          <!-- Networking Session -->
          <!-- <RadioBtn
            class="mt-5"
            label="Are you interested to be a part of Networking sessions?"
            :model.sync="response.networking"
            :options="['Yes', 'No']"
          /> -->
          <!-- Networking Session -->

          <!-- Networking session types -->
          <!-- <Checkbox
            v-if="response.networking === 'Yes'"
            class="mb-10"
            label="What type of networking session will you be interested in"
            :model.sync="response.networkingType"
            :options="[
              'Networking with Android Experts',
              'Networking with Web Experts',
              'Networking with Flutter Experts',
              'Network with Google Cloud Experts',
              'Networking with Machine Learning Experts',
              'Networking with Talent Acquisition team /HRs',
              'Networking with community organisers',
              'Product Showcase',
            ]"
          /> -->
          <!-- Networking session types -->

          <!-- Networking Session -->
          <!-- <RadioBtn
            class="mt-5"
            label="Are you looking for a Job opportunity which will be"
            :model.sync="response.isJobLooking"
            :options="[
              'Full Time Job',
              'Internship',
              'Internship followed by Full time Job',
              'No',
            ]"
          /> -->
          <!-- Networking Session -->


          <!-- CommunitySelect -->
          <!-- <CommunitySelect
            :model.sync="gdgCommunity"
            :otherCommunity.sync="otherCommunity"
          /> -->
          <!-- CommunitySelect -->

          <!-- KnowAbout  -->
          <!-- <KnowAboutRadio
            label="How did you get to know about this event?"
            class="mt-4"
            :model.sync="knownByGoogleProgram"
            :knownByOrtherCommunity.sync="knownByOrtherCommunity"
            :options="[
              'Women Techmakers',
              'Google Developer Groups',
              'Google Developer Student Clubs',
              'Google Developers Experts',
              'Google Crowdsource Community',
              'Other Communities',
            ]"
          /> -->
          <!-- KnowAbout  -->

          <!-- WhatsApp Contact -->
          <!-- <RadioBtn
            class="mt-5"
            label="Would you like to get notifications on WhatsApp during the event?"
            :model.sync="response.whatsAppContactStatus"
            :options="['Yes', 'No']"
          /> -->
          <!-- WhatsApp Contact -->

          <!-- WhatsApp Mobile Number -->
          <!-- <MobileNumberComponent
            label="Your WhatsApp number for sharing event update and announcement?"
            :required="true"
            v-if="response.whatsAppContactStatus === 'Yes'"
            :model.sync="response.whatsAppNumber"
          /> -->
          <!-- WhatsApp Mobile Number -->

          <!-- Workshop session types -->
          <Checkbox
            class="mb-10"
            label="Máte v plánu se zůčastnit workshopů? Jakých?"
            :model.sync="response.workshop"
            :options="[
              'Workshop Certicon',
              'Workshop Y Soft',
              'Workshop SDE/3Pillar Global Czechia',
            ]"
            :optionsInfo="[
              '25.11 16:30 - online',
              '25.11 16:30 - online',
              '25.11 16:30 - online'
            ]"
          />
          <!-- Networking session types -->

          <!-- Share -->
          <v-textarea
            outlined
            class="mt-3"
            placeholder="Chcete nám něco sdělit?"
            v-model="response.share"
          ></v-textarea>
          <!-- Share -->

          <!-- Accepts TC -->
          <div v-if="!previousloaded">
            <v-checkbox
              color="#4285F4"
              v-model="istcChecked"
              :rules="[(v) => !!v || 'Musíte souhlasit pro úspěšnou registraci!']"
              label="Zaškrtnutím tohodle checkboxu"
            ></v-checkbox>
            <p class="mt-3">
              Souhlasíte s tím, že DevFest.cz organizátoři mohou použít tyto informace
              získáné pomocí formuláře výše k mojí účasti na akci "DevFest.cz 2021" a k dodatečné
              komunikaci.
            </p>
            <p>
              
              
              <a href="https://devfest.withgoogle.com/code-of-conduct" target="_blank"
                >Code of conduct</a
              >
              &
              <a
                href="https://developers.google.com/community-guidelines"
                rel="“noreferrer”"
                target="_blank"
                >Community Guidelines</a
              >
            </p>
          </div>
          <!-- Accepts TC -->

          <v-btn
            depressed
            dark
            rounded
            class="mt-3"
            large
            :loading="loader"
            @click="saveData"
            color="#4285F4"
            >Uložit</v-btn
          >
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import FDK from "../../Config/firebase";
import TextField from "../Registration/Forms/TextField.vue";
// import RadioBtn from "../Registration/Forms/GenderRadio.vue";
import Checkbox from "../Registration/Forms/Checkbox.vue";
// import CommunitySelect from "../Registration/Forms/CommunitySelect.vue";
// import KnowAboutRadio from "../Registration/Forms/KnowAbout.vue";
// import CountrySelect from "../Registration/Forms/CountorySelect.vue";
// import MobileNumberComponent from "../Registration/Forms/MobileNumber.vue";
export default {
  name: "",
  props: ["user"],
  components: {
    TextField,
    // RadioBtn,
    Checkbox,
    // CommunitySelect,
    // CountrySelect,
    // KnowAboutRadio,
    // MobileNumberComponent,
  },
  data: () => ({
    istcChecked: "",
    loader: false,
    previousloaded: false,
    response: {
      name: "",
      email: "",
      role: "",
      org: "",
      gender: null,
      experience: "",
      share: "",
      photoURL: "",
      status: false,
      workshop: [],
      registrationConfirmationEmail: false,
    },
    rules: {
      required: (value) => !!value || "This field is required.",
      radiobtn: (value) => {
        return value.length > 0 || "This field is required.";
      },
      socialcheckboxbtn: (value) => {
        return value.length > 0 || "Alespoň jedno musí být zaškrtnuto";
      },
    },
  }),
  async created() {
    FDK.auth.onAuthStateChanged(async (user) => {
        if (user) {
          this.response.name = user.displayName;
          this.response.email = user.email;
          this.response.photoURL = user.photoURL
            ? user.photoURL
            : "https://raw.githubusercontent.com/DevFest-India/website-data/master/defaultavatar.png";

          if (user.uid != undefined) {
            var data = await FDK.firestore
                  .collection("edata")
                  .doc(user.uid)
                  .get();
            if (data.exists){
              this.previousloaded = true;
              this.response = data.data();     
            }
            
          }  
        }
     });
  },
  methods: {
    async saveData() {
      if (this.$refs.form.validate()) {
        this.loader = true;
        // Logic of Data Adding
        // this.response['city'] = this.checkData(this.response['city'])
        this.response["registeredTimestamp"] =
          FDK.firebase.firestore.FieldValue.serverTimestamp();
        // if (this.gdgCommunity === "Others") {
        //   this.response.community = this.otherCommunity.toUpperCase();
        // } else {
        //   this.response.community = this.gdgCommunity.toUpperCase();
        // }

        // if (this.knownByGoogleProgram === "Other Communities") {
        //   this.response.knowAbout = this.knownByOrtherCommunity.toUpperCase();
        // } else {
        //   this.response.knowAbout = this.knownByGoogleProgram.toUpperCase();
        // }

        if (Object.keys(this.$route.query) == "code") {
          if (this.$route.query["code"].length > 5) {
            this.response.code = this.$route.query["code"];
          }
        }

        try {
          await FDK.firestore
            .collection("edata")
            .doc(this.user.uid)
            .set(this.response);
          await FDK.firestore
            .collection("edata")
            .doc(this.user.uid)
            .collection("badges")
            .doc("sNrynvmbLdKbMm1Z3mZt")
            .set({
              codeId: "sNrynvmbLdKbMm1Z3mZt",
              timestamp: FDK.firebase.firestore.FieldValue.serverTimestamp(),
            }, {merge: true,});

          this.loader = false;
          this.previousloaded =true;
          this.$emit("registerSuccess");
        } catch (error) {
          console.log(error);
        }
      } else {
        this.loader = false;
        alert("Please fill the required fields before submitting the form :)");
      }
    },
    checkData(data) {
      return data.length > 0 ? data.toUpperCase() : null;
    },
  },
};
</script>

<style>
/* .unstyled, .v-input > .v-input-control > .v-input-slot > .v-text-field__slot > input > ::-webkit-inner-spin-button, ::-webkit-calendar-picker-indicator {
      display: none;
      -webkit-appearance: none;
    } */
    /* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
-webkit-appearance: none;
margin: 0;
}

/* Firefox */
input[type=number] {
-moz-appearance: textfield;
}
</style>
