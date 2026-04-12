<template>
  <div class="text-center">
    <v-dialog v-model="dialog" width="500">
      <template v-slot:activator="{ on }">
        <v-btn color="#1a1b1b" icon text v-on="on" aria-label="Push Notification">
          <v-icon v-if="!isAllowed">mdi-bell</v-icon>
          <v-icon v-else>mdi-bell-check</v-icon>
        </v-btn>
      </template>

      <v-card style="border-radius:12px" >
        <v-card-title class="google-font px-md-10 pt-md-10" style="font-size:25px;font-weight:600">Povolte nám zasílání oznámení</v-card-title>

        <v-card-text class="px-md-10">
          <p style="font-size:16px">Nebojte, nebudeme vás spamovat zbytečnostmi</p>
          <p class="google-font" style="font-size:18px">
            <span class="font-weight-bold text--primary">Status:</span>
            {{ token }}
          </p>
        </v-card-text>
        <!-- <v-divider></v-divider> -->

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            text
            :loading="isLoading"
            :disabled="isAllowed"
            @click="requestPermission"
            >{{ buttonText }}</v-btn
          >
          <v-btn color="error" text @click="dialog = false">Zavřít</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import FDK from "@/Config/firebase";
// import { mapState } from "vuex";
import generalConfig from "@/Config/ServerKeys";
export default {
  name: "PushNotification",
  data() {
    return {
      dialog: false,
      isLoading: false,
      token: "Není povoleno",
      buttonText: "Povolit",
      isAllowed: false
    };
  },
  methods: {
    requestPermission() {
      try {
        if (FDK.notificationSupported && Notification) {
          this.isLoading = true;
          this.token = "Vyčkejte...";
          Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
              let token = localStorage.getItem("pushNotificationToken");
              if (token == null || token.length <= 0) {
                FDK.messaging
                  .getToken({vapidKey:`${generalConfig.vapidKey}`})
                  .then((currentToken) => {
                    if (currentToken) {
                      FDK.firestore
                        .collection("pushNotificationTokens")
                        .add({
                          token: currentToken,
                        })
                        .then(() => {
                          this.token = "Úspěšně přidáno k odběru";
                          this.displayNotificaion();
                          localStorage.setItem(
                            "pushNotificationToken",
                            currentToken
                          );
                          this.isLoading = false;
                          this.buttonText = "Povoleno";
                        })
                        .catch((err) => {
                          this.token = err;
                          this.isLoading = false;
                        });
                    } else {
                      this.isLoading = false;
                      this.token =
                        "No Instance ID token available. Request permission to generate one.";
                    }
                  })
                  .catch((err) => {
                    this.isLoading = false;
                    this.token = err;
                  });
              } else {
                this.token = "Úspěšně přidáno k odběru";
                this.isLoading = false;
                this.buttonText = "Allowed";
              }
            } else {
              this.isLoading = false;
              this.token = "Práva byly získány neúspěšně";
            }
          });
        } else {
          this.isLoading = false;
          this.token = "Nepodporujeme aktuální prohlížeč";
        }
      } catch (err) {
        // alert(err);
        this.isLoading = false;
        this.token = err;
      }
    },
    displayNotificaion() {
      if ("serviceWorker" in navigator) {
        var options = {
          body: "Úspěšně odebíráš notifikace",
          icon: "img/icons/favicon-32x32.png",
          dir: "ltr",
          badge: "img/icons/favicon-32x32.png",
          tag: "NewSubscription",
          renotify: true,
          actions: [
            {
              action: "open",
              title: "Otevřít",
            },
          ],
        };
        navigator.serviceWorker.ready.then(function (swreg) {
          swreg.showNotification("Úspěšně přidáno k odběru", options);
        });
      }
    },
  },
  mounted() {
    let token = localStorage.getItem("pushNotificationToken");
    this.isAllowed = false
    if (token && token.length > 0) {
      this.token = "Notifikace odebírány";
      this.buttonText == "Povoleno";
      this.isAllowed = true
    }
  },
};
</script>