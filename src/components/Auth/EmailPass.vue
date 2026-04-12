<template>
  <v-dialog v-model="dialog" width="500" scrollable>
    <template v-slot:activator="{ on }">
      <v-btn color="#4285f4" rounded outlined style="text-transform: capitalize" depressed dark v-on="on">
        <v-icon left>mdi-account</v-icon>
        Přihlášení/Registrace</v-btn
      >
    </template>

    <v-card class="pa-0 white" v-if="dialog" style="border-radius:15px">
      <v-card-text class="px-0">
        <v-divider></v-divider>
        <v-container fluid>
          <v-row class="py-0 my-0" style="border-bottom: 1px solid #e0e0e0;">
            <v-col md="12" cols="12" class="py-0 my-0">
              <v-tabs grow v-model="section" color="#4285f4" slider-color="#4285f4">
                <v-tab href="#signup">
                  Registrace
                </v-tab>
                <v-tab href="#signin">
                 Přihlášení
                </v-tab>
              </v-tabs>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-tabs-items v-model="section">
                <v-tab-item value="signup" class="px-4 py-5">
                  <v-form ref="signupform">
                    <p class="google-font mb-0" style="font-size:130%">
                      <b>DevFest.cz 2021 registrace</b>
                    </p>
                    <p class="google-font my-0">
                      Registrujte se na #DevFestCZ
                    </p>
                    <br />
                    <p style="font-size:105%;color:black" class="py-0 my-0">
                      Email
                      <span style="color:#ff5252;">*</span>
                    </p>
                    <!--   -->
                    <v-text-field
                      v-model="email"
                      placeholder="Email"
                      class="my-0"
                      outlined
                      :rules="[rules.required]"
                    ></v-text-field>

                    <p style="font-size:105%;color:black" class="py-0 my-0">
                      Heslo
                      <span style="color:#ff5252;">*</span>
                    </p>
                    <v-text-field
                      v-model="password"
                      class="my-0"
                      :type="show1 ? 'text' : 'password'"
                      placeholder="Password"
                      :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                      outlined
                      :rules="[rules.required, rules.min]"
                      @click:append="show1 = !show1"
                    ></v-text-field>

                    <p style="font-size:105%;color:black" class="py-0 my-0">
                      Potvrzení hesla
                      <span style="color:#ff5252;">*</span>
                    </p>
                    <v-text-field
                      v-model="cpassword"
                      class="my-0"
                      :rules="[rules.required, rules.min]"
                      :type="show1 ? 'text' : 'password'"
                      :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                      @click:append="show1 = !show1"
                      placeholder="Confirm Password"
                      outlined
                    ></v-text-field>
                    <v-btn
                      depressed
                      dark
                      v-on:click="signup"
                      color="#4285f4"
                      block
                      large
                      :loading="signuploading"
                      >Registrace</v-btn
                    >
                  </v-form>
                </v-tab-item>
                <v-tab-item value="signin">
                  <v-container>
                    <v-row>
                      <v-col>
                        <v-form ref="signinform">
                        <p class="google-font mb-0" style="font-size:130%">
                          <b>DevFest.cz 2021 registrace</b>
                        </p>
                        <p class="google-font my-0">
                          Registrujte se na #DevFestCZ
                        </p>
                        <br />
                        <p style="font-size:105%;color:black" class="py-0 my-0">
                          Email
                          <span style="color:#ff5252;">*</span>
                        </p>
                        <!-- ,  -->
                        <v-text-field
                          v-model="email"
                          placeholder="Email"
                          class="my-0"
                          outlined
                          :rules="[rules.required, rules.gmailmatch]"
                        ></v-text-field>

                        <p style="font-size:105%;color:black" class="py-0 my-0">
                          Heslo
                          <span style="color:#ff5252;">*</span>
                        </p>
                        <v-text-field
                          v-model="password"
                          class="my-0"
                          :type="show1 ? 'text' : 'password'"
                          placeholder="password"
                          :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                          outlined
                          :rules="[rules.required, rules.min]"
                          @click:append="show1 = !show1"
                        ></v-text-field>
                        <v-btn
                          depressed
                          dark
                          v-on:click="signin"
                          color="#4285f4"
                          block
                          large
                          :loading="signinloading"
                          >Přihlášení</v-btn
                        >
                        </v-form>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-tab-item>
              </v-tabs-items>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="grey lighten-3">
        <v-spacer></v-spacer>
        <v-btn aria-label="close" color="#4285f4" text @click="dialog = false"
          >Zavřít</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import FDK from "@/Config/firebase";
export default {
  name: "CustomEmailPassAuthComponent",
  components: {},
  data() {
    return {
      show1: false,
      signuploading:false,
      signinloading:false,
      rules: {
        required: (value) => !!value || "Nutné zadat.",
        min: (v) => v.length >= 6 || "Minimálně 6 znaků",
        emailMatch: () => "Email nebo heslo které jste zadal bylo zadáno špatně",
      },
      section: "signup",
      signupscreen: true,
      email: "",
      password: "",
      cpassword: "",
      dialog: false,
      userCreated: false,
      user: {},
    };
  },
  methods: {
    signup() {
      if (this.$refs.signupform.validate()) {
        if (this.password == this.cpassword) {
          this.signuploading = true
          FDK.auth
            .createUserWithEmailAndPassword(this.email, this.password)
            .catch((e) => {
              // console.log(e);
              this.signuploading = false
              alert(e.message)
            });
          this.signuploading = false
          this.dialog = false
        } else {
          alert("Password Not Match");
          this.signuploading = false
        }
      }
    },
    signin() {
      if (this.$refs.signinform.validate()) {
        if (this.email.length > 0 && this.password.length > 0) {
          // console.log('calling login')
          this.signinloading = true
          FDK.auth
            .signInWithEmailAndPassword(this.email, this.password)
            .catch((e) => {
              // console.log(e);
              this.signinloading = false
              alert(e.message);
            });
          this.signinloading = false
        }
      }
    },
  },
};
</script>