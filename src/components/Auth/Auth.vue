<template>
  <v-container fluid class="my-0 py-0">
    <v-row>
      <v-col>
        <h3 v-if="!userLoggedInFound"  class="google-font"> Přihlašte se přes účet Google </h3>

        <!-- Check Auth -->
        <div
          v-if="
            Object.keys(userInfo).length == 0 &&
              checkingUserStatus &&
              !userLoggedInFound
          "
        >
          <v-progress-circular
            indeterminate
            color="primary"
          ></v-progress-circular>
        </div>

        <!-- Login Screen -->
        <div
          v-if="
            Object.keys(userInfo).length == 0 &&
              !checkingUserStatus &&
              !userLoggedInFound
          "
        >
          <v-btn
            class="mt-2"
            depressed
            style="text-transform: capitalize"
            v-on:click="signIn"
            dark
            rounded
            color="#4285f4"
          >
            <v-icon size="20px" left>mdi-google</v-icon>Přihlášení
          </v-btn>

          <br /><br />
          <p class="google-font mb-2">
            Nemáte Google účet? Registrujte se skrze vaší emailovou adresu.
          </p>
          <EmailPass />
        </div>

        <!-- User Info Screen -->
        <div
          v-if="
            Object.keys(userInfo).length > 0 &&
              !checkingUserStatus &&
              userLoggedInFound
          "
        >
          <v-list-item v-if="emailVerified" class="ml-0 pl-0">
            <v-list-item-avatar size="65" style="border:1px solid #e0e0e0">
              <v-img
                :src="
                  userInfo.photoURL
                    ? userInfo.photoURL
                    : 'https://raw.githubusercontent.com/DevFest-India/website-data/master/defaultavatar.png'
                "
              ></v-img>
            </v-list-item-avatar>

            <v-list-item-content>
              <v-list-item-title
                class="google-font"
                v-html="userInfo.displayName"
              ></v-list-item-title>
              <v-list-item-subtitle
                v-html="userInfo.email"
              ></v-list-item-subtitle>
              <v-list-item-subtitle
                v-on:click="logout"
                style="color:#4285f4;cursor: pointer"
              >
                <u>Logout as a {{ userInfo.email }}</u>
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <!-- Email Not Verified -->
          <div v-if="!emailVerified">
            <v-chip class="my-2">{{userInfo.email}}</v-chip>
            <p style="font-size:18px;color:red">
              Kindly verify your email by clicking on the link sent to your email
              address. Also, do refresh this page post verification to move ahead
              with the registration.
            </p>
            <v-btn v-on:click="logout" rounded dark depressed color="red">Logout</v-btn>
          </div>

        </div>

      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import FDK from "@/Config/firebase";
import EmailPass from "../Auth/EmailPass.vue";
export default {
  name:'emailpassComponent',
  components: {
    EmailPass,
  },
  data: () => ({
    userInfo: {},
    userLoggedInFound: false,
    checkingUserStatus: true,
    snackBarMessage: "",
    emailVerified: null
  }),
  mounted() {
    this.checkAuth();
  },
  methods: {
    checkAuth() {
      let self = this;
      self.checkingUserStatus = true;
      FDK.auth.onAuthStateChanged(function(user) {
        if (user) {
          if (user.emailVerified) {
            self.emailVerified = true
            self.userInfo = user;
            self.userLoggedInFound = true;
            self.getUserData(user)
          } else {
            self.userInfo = user;
            self.userLoggedInFound = true;
            self.emailVerified = false
            user
              .sendEmailVerification()
              .then(() => {
                self.emailVerified = false
                self.$emit('showSnackbar','Kindly verify your email by clicking on the link sent to your email')
              })
              .catch((e) => {
                console.log(e);
                self.$emit('showSnackbar', e.message)
              });
          }
        } else {
          self.userLoggedInFound = false;
        }
        self.checkingUserStatus = false;
      });
    },
    signIn() {
      //   var self = this;
      var provider = new FDK.firebase.auth.GoogleAuthProvider();
      FDK.firebase
        .auth()
        .signInWithPopup(provider)
        .then(function(result) {
          let user = result.user;
          self.snackBarMessage = "Signed In with " + user.email;
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    logout() {
      let self = this;
      FDK.auth
        .signOut()
        .then(function() {
          // console.log("Logout Done");
          self.userLoggedInFound = false;
          self.userInfo = {};
          self.$emit("showSnackbar", 'Logout Success');
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    async getUserData(user){
      try {
        let response = await FDK.firestore.collection("edata").doc(user.uid).get()
        // console.log(response)
        if(response.exists){
          // User already Registered
          this.$emit('userStatus', {
            userInfo: this.userInfo,
            userRegistered: true
          })
        }else{
          // console.log('User Not Registered')
          this.$emit('userStatus', {
            userInfo: this.userInfo,
            userRegistered: false
          })
        }
      } catch (error) {
        console.log(error)
      }
    }
  },
};
</script>

<style scoped></style>
