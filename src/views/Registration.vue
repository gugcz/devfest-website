<template>
  <v-main>
    <Snackbar
      :message="snackBarMessage"
      :isShow.sync="isSnackBarVisible"
      :color="snackBarColor"
      :timeout="snackBarTimeOut"
    />
    <!-- v-bind:style="{ 'background-image': 'url(' +require('@/assets/img/profile/proheader.png') + ')', 'backgroundSize':'100%' }" -->
    <v-container fluid class="mt-3">
      <v-row justify="center" align="center">
        <v-col md="11" lg="9" class="">
          <v-img
            :src="require('@/assets/img/reg.jpg')"
            style="border-radius:18px"
            :lazy-src="require('@/assets/img/reg.jpg')"
            width="100%"
            height="200px"
            class="mx-0 d-none d-sm-block"
          ></v-img>

          <v-img
            :src="require('@/assets/img/home-mobile.jpg')"
            style="border-radius:18px"
            :lazy-src="require('@/assets/img/home-mobile.jpg')"
            width="100%"
            class="mx-0 d-block d-sm-none"
          ></v-img>
        </v-col>
      </v-row>
      
      <v-row justify="center" align="center">
        <v-col
          md="11"
          lg="6"
          class="google-font mt-0 mt-md-2 mb-15 pt-3 py-md-10 px-4 px-md-0"
        >
          <p class="h1-heading">Registrace</p>
          <!-- <p style="font-size:19px" >
            <b>Online</b> - 100,- Kč - Přístup k online streamu po celou dobu akce
            <br/>
            <b>Offline</b> - 500,- Kč - Přístup k online streamu, vstup na akci v Dolních Vítkovicích
          </p>-->

          <p style="font-size:19px" >
            Děkujeme za váš zájem zúčastnit se workshopů, které jsou součástí akce DevFest.cz 2021! 
            Registrace již byly <b>ukončeny</b>
          </p> 

          <v-container fluid class="mt-8">

            <!-- Auth -->
            <!-- <v-row align="start" justify="start">
              <v-col md="2" cols="2" class="text-center">
                <v-avatar color="#202124">
                  <v-icon dark>mdi-account-circle</v-icon>
                </v-avatar>
              </v-col>
              <v-col md="10" class="google-font pl-0" cols="10">
                <Auth
                  @showSnackbar="showSnackbar"
                  @userStatus="checkUserStatus"
                />
              </v-col>
            </v-row> -->

            <!-- Registration From -->
            <!-- <v-row
              class="my-8"
              align="start"
              justify="start"
              v-if="userInfo != null && userRegistered != null"
            >
              <v-col md="2" cols="2" class="text-center">
                <v-avatar color="#202124">
                  <v-icon dark>mdi-format-align-justify</v-icon>
                </v-avatar>
              </v-col>
              <v-col md="10" class="google-font pl-0" cols="10">
                <RegistrationForm
                  v-if="userInfo != null"
                  :user="userInfo"
                  @registerSuccess="userRegisterSuccess = true"
                />
              </v-col>
            </v-row> -->
            <!-- Registration From -->

            <!-- Registration From Success -->
            <!-- <v-row
              class="my-8"
              align="start"
              justify="start"
              v-if="
                userRegistered != null &&
                  !userRegistered &&
                  userInfo != null &&
                  userRegisterSuccess != null &&
                  userRegisterSuccess
              "
            >
              <v-col md="2" cols="2" class="text-center">
                <v-avatar color="#202124">
                  <v-icon dark>mdi-playlist-check</v-icon>
                </v-avatar>
              </v-col>
              <v-col md="10" class="google-font " cols="10">
                 <h3 class="google-font">
                  Děkujeme za vyplnění informací
                </h3> -->
                <!-- <p class="google-font mt-3" style="font-size:110%">
                  Chybí už jen poslední krok, a to zakoupení vstupenky. Vstupenky na
                  <b>#DevFestCZ</b> naleznete zde. 
                  <b>Je nutné zadat stejnou emailovou adresu jako při registraci. </b>
                  <br/>
                   <br/>
                  <b v-if="haveTicket" style="color: green;"> Vstupenka zakoupena </b>
                  <b v-if="!haveTicket" style="color: red;"> Vstupenka nezakoupena </b>
                   <br/>
                        <v-btn
                  depressed
                  dark
                  rounded
                  class="mt-3"
                  large
                  target="_blank"
                  href="https://ti.to/devfest-cz/devfest-cz-2021"
                  color="#4285F4"
                  >Vstupenky</v-btn
                >
                </p> -->
                <!-- <RegistrationSuccessCard/>
              </v-col>
            </v-row> -->
            <!-- Registration From Success -->

            <!-- Already Registered -->
            <!-- <v-row
              class="my-8"
              align="start"
              justify="start"
              v-if="
                userRegistered != null && userRegistered && userInfo != null
              "
            >
              <v-col md="2" cols="2" class="text-center">
                <v-avatar color="#202124">
                  <v-icon dark>mdi-playlist-check</v-icon>
                </v-avatar>
              </v-col>
              <v-col md="10" class="google-font " cols="10">
                <h3 class="google-font">
                  Děkujeme za vyplnění informací
                </h3> -->
                <!-- <p class="google-font mt-3" style="font-size:110%">
                  Chybí už jen poslední krok, a to zakoupení vstupenky. Vstupenky na
                  <b>#DevFestCZ</b> naleznete zde. 
                  <b>Je nutné zadat stejnou emailovou adresu jako při registraci. </b>
                  <br/>
                   <br/>
                  <b v-if="haveTicket" style="color: green;"> Vstupenka zakoupena </b>
                  <b v-if="!haveTicket" style="color: red;"> Vstupenka nezakoupena </b>
                   <br/>
                  <v-btn
                    depressed
                    dark
                    rounded
                    class="mt-3"
                    large
                    target="_blank"
                    href="https://ti.to/devfest-cz/devfest-cz-2021"
                    color="#4285F4"
                    >Vstupenky</v-btn
                  >
                </p> -->
                <!-- <RegistrationSuccessCard/>
              </v-col>
            </v-row> -->
            <!-- Already Registered -->
          </v-container>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script>
import FDK from "@/Config/firebase";
// import Auth from "../components/Auth/Auth.vue";
import Snackbar from "../components/Common/Snackbar.vue";
// import RegistrationForm from "../components/Registration/RegistrationForm.vue";
// import RegistrationSuccessCard from '../components/Registration/RegistrationSuccess.vue'
export default {
  data: () => ({
    // Snackbar
    snackBarMessage: "",
    isSnackBarVisible: false,
    snackBarColor: "green",
    snackBarTimeOut: 5000,
    userInfo: {},
    haveTicket: false,
    userRegistered: null,
    userRegisterSuccess: false,
  }),
  components: {
    // Auth,
    Snackbar,
    // RegistrationForm,
    // RegistrationSuccessCard
  },
  created() {
    document.title = "Registrace | DevFest.cz 2021";
     FDK.auth.onAuthStateChanged(async (user) => {
        if (user) {
          this.userRegistered = true
        } 
        if (user.uid != undefined) {
            var data = await FDK.firestore
                  .collection("edata")
                  .doc(user.uid)
                  .get();
            if (data.exists){
              this.haveTicket = data.data().ticketRef != null && data.data().ticketRef.length > 0;     
            }
        } else {
          this.haveTicket = false;
        }
      });
  },
  methods: {
    showSnackbar(event) {
      this.isSnackBarVisible = true;
      this.snackBarMessage = event;
      this.userInfo = {}
      this.userRegistered = null
    },
    checkUserStatus(user) {
      // console.log(user);
      this.userInfo = user.userInfo;
      this.userRegistered = user.userRegistered;
     
    },
  },
};
</script>

<style scoped></style>
