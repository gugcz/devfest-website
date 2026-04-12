<template>
<v-main>
  <Snackbar
      :message="snackBarMessage"
      :isShow.sync="isSnackBarVisible"
      :color="snackBarColor"
      :timeout="snackBarTimeOut"
    />
  <v-container fluid  >
    <v-row justify="center" align="center">
      <v-col md="11" sm="11" lg="9" class="google-font my-md-7 my-2 py-md-8 py-1">
        <v-container fluid>
          
          <!-- Loader -->
          <v-row
            justify="center"
            align="center"
            v-if="!isLoggedinUser && MainViewLoader && !isDevProfile"
          >
            <v-col md="4" lg="4" cols="12" sm="5" class="my-md-15 py-15 text-center">
              <v-progress-circular
                :size="70"
                :width="5"
                color="#4285fa"
                indeterminate
              ></v-progress-circular>
            </v-col>
          </v-row>
          <!-- Loader -->

          <!-- DevProfile Intro Section -->
          <v-row justify="center" align="center" v-if="!isLoggedinUser && !MainViewLoader && !isDevProfile">
            <v-col md="7" lg="7" cols="12" sm="12" class="pb-4 pb-md-0">
              <p class="h1-heading">DevFest India Contest</p>
              <p style="font-size:20px" class="mb-5">
                  Login with your registered email id
              </p>
              <Auth loginSubContent='Sign in and participate in the contest'/>
            </v-col>
            <v-col md="5" lg="5">
                  <v-img
              alt="Vuetify Logo"
              contain
              :src="require('@/assets/img/overview.png')"
              width="100%"
              style="margin-left:auto;margin-right:auto"
            />
            </v-col>
          </v-row>
          <!-- DevProfile Intro Section -->

          <!-- DevProfile Section -->
          <v-row justify="center" align="center" v-if="isLoggedinUser && !MainViewLoader && isDevProfile">
            <v-col md="7" >
                <ContestScreen v-if="Object.keys(userInfo).length>0" :userInfo="userInfo"/>
            </v-col>
          </v-row>
          <!-- DevProfile Section -->

        </v-container>
      </v-col>
    </v-row>
  </v-container>
  </v-main>
</template>

<script>
import FDK from "@/Config/firebase";
import DevProfileService from '@/services/DevProfileService'
import Snackbar from "@/components/Common/Snackbar.vue";
import Auth from "../components/Auth/DevProfileAuth.vue";
import ContestScreen from '../components/Contest/ContestScreen.vue'
export default {
  name:"ContestViewComponent",
  components:{
    Auth,
    Snackbar,
    ContestScreen
  },
  data:()=>({
    // Snackbar
    snackBarMessage: "",
    isSnackBarVisible: false,
    snackBarColor: "green",
    snackBarTimeOut: 5000,
    //
    isLoggedinUser: false,
    MainViewLoader: true,
    isDevProfile:false,
    userInfo:{},
  }),
  created(){
    document.title = 'Contest | DevFest.cz 2021'
    this.checkStatus()
  },
  methods:{
    async checkStatus(){
      this.isDevProfile = false
      this.MainViewLoader = true
      await FDK.auth.onAuthStateChanged(async (user) => {
        if(user){
          await DevProfileService.getUserProfileInfo(user.uid).then(async (res)=>{
            if (res.success) {
              // User Profile Found
              // console.log('User Profile Found from DB')
              this.userInfo = res.data
              this.userInfo.docid = user.uid
              this.MainViewLoader = false
              this.isDevProfile = true
            }else{
              // User Profile Not Found
              // console.log('User Profile Found Not from DB')
              this.isDevProfile = false
              this.MainViewLoader = false
              this.$router.push('/registration')
            }
            this.isLoggedinUser = true;
          }).catch(e=>{
            this.MainViewLoader = false
          })
        }else{
          // console.log('User Profile Not Found')
          //User Profile Not Found
          this.MainViewLoader = false
          this.isLoggedinUser = false
          this.isDevProfile = false
        }
      })
    }
  }
};
</script>

<style lang="scss" scoped></style>
