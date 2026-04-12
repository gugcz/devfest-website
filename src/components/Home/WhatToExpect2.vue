<template>
  <v-container fluid class="white" style="border-radius:18px">
    <v-row class="my-0 pa-5 px-6" justify="center" align="center">
      <v-col md="7" sm="12" cols="12" class="border-right">
        <p class="h1-heading mb-0 google-font">
          Letošní DevFest si užijete po svém 
        </p>
      </v-col>
      <v-col md="5" sm="12" cols="12" class="">
        <v-row justify="center" align="center">
          <v-col md="3" sm="3" cols="3" class="text-center" v-for="(item, index) in stats" :key="index">
            <p class="h1-heading mb-0" >
              {{item.value}}
            </p>
            <p style="font-size: 95%;">
              {{item.name}}
            </p>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-row justify="end" align="end" class="my-0 pa-5 pt-0 mt-n5 px-6 pr-0">
      <v-col md="12" lg="12" sm="12" cols="12" class="pa-0 px-2 custom-padding">
        <v-sheet class="mx-auto" elevation="0" max-width="100%">
          <v-slide-group
            v-model="model"
            class="pa-0"
            mobile-breakpoint="100"
            show-arrows
          >
            <v-slide-item
              v-for="(item, index) in imgs"
              :key="index"
            >
              <v-card
                outlined
                :color="item.color"
                class="ml-1"
                min-height="260"
                min-width="320"
                max-height="260"
                max-width="320"
                style="border-radius:7px"
              >
                <v-row class="fill-height pa-3 pt-0" align="start">
                  <v-col md="12" sm="12" cols="12" class="custom-padding">
                    <v-icon color="black" class="ml-2 pa-1" size="35">{{item.img}}</v-icon>
                    <p class="google-font text--white px-2 ma-0" style="font-size:22px;font-weight:600">
                      {{ item.name }}
                    </p>
                    <p class="google-font text--white pa-2 ft-10 ma-0">
                      {{ item.desc }}
                    </p>
                  </v-col>
                </v-row>
              </v-card>
            </v-slide-item>
          </v-slide-group>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
export default {
  name: "WhatToExpect2",
  data: () => ({
    model: null,
    stats:[
      {
        "name":"Hodin",
        "value":"8"
      },
      {
        "name":"Stream",
        "value":"1"
      },
      {
        "name":"Lokalita",
        "value":"1+"
      },
      {
        "name":"Talků",
        "value":"10+"
      },
    ],
    imgs: [
      {
        name: "Workshopy z Ostravě",
        img: "mdi-map-marker",
        color: "#C7EFEE",
        desc:
          "V Ostravě zůstaneme alespoň s workshopy. Vzhledem k tomu, že každý se koná jinde, počet účastníků se hezky rozprostřel a workshopům tedy nic nebrání.",
      },
      {
        name: "Online stream",
        img: "mdi-web",
        color: "#FFE8CD",
        desc:
          "Víme, jak dělat online streamy na profesionální úrovni. Takže i když se nebudete moct zúčastnit akce offline, přineseme vám skvělý zážitek ze sledování i domů.",
      },
      {
        name: "DevFest.cz Connect",
        img: "mdi-account-group",
        color: "#E0F0FF",
        desc:
          'Chcete si udělat vlastní minikonferenci ve vašem městě? Napište nám na devfest@gug.cz a poradíme vám co vše potřebujete k naplánování lokálního eventu s vlastní komunitou.',
      },
      {
        name: "Spolupráce dvou komunit",
        img: "mdi-account-multiple",
        color: "#FBE9E7",
        desc:
          "DevFest vždycky byl a bude o lidech. Proto jsme oslovili Techmeetup Ostrava, abychom vám přinesli z obou komunit to nejlepší a mohli jsme vám přinést jedinečný event.",
      },
      {
        name: "Next level of conference?",
        img: "mdi-lightbulb-on",
        color: "#C7EFEE",
        desc:
          "Náš claim, který jsme v roce 2019 poprvé použili, si rozhodně necháme i letos. Protože tohle bude opravdu další level.",
      }
    ],
  }),
  mounted() {},
};
</script>

<style scoped>
.v-application .elevation-4 {
  box-shadow: none !important;
  position: relative;
}
.border-right {
  border-right: 1px solid lightgrey;
}
.v-slide-group /deep/ .v-slide-group__prev {
  right: 10%;  
  bottom: -20%;
  background: #EFF7FF;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  min-width: auto;
  justify-content: center;
  align-items: center;
  z-index: 1;
  position: absolute;
  opacity: 1;
}
.v-slide-group /deep/ .v-slide-group__next {
  right: 5%;
  bottom: -20%;
  background: #EFF7FF;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  min-width: auto;
  justify-content: center;
  align-items: center;
  z-index: 1;
  position: absolute;
  opacity: 1;
}

.v-slide-group /deep/ .v-slide-group__next .v-icon, .v-slide-group /deep/ .v-slide-group__prev .v-icon {
  color: #88B7F8 !important;
  font-size: 35px;
}

/* .v-slide-group /deep/ .v-slide-group__next--disabled, .v-slide-group /deep/ .v-slide-group__prev--disabled {
  opacity: 0 !important;
} */

.v-card {
  width: 50px;
  height: 50px;
  margin: 24px 24px 10px 10px;
  background: rgba(255, 255, 255, 0.68);
}

.custom-padding {
  padding-top: 47px;
}
@media only screen and (max-width: 1295px) { 
  .v-card {
    width: 425px !important;
  }
 }
@media only screen and (max-width: 768px) { 
  .v-slide-group /deep/ .v-slide-group__prev {
    right: 14%;
  }

}

@media only screen and (max-width: 660px) {
  .v-slide-group /deep/ .v-slide-group__prev { 
    right: 21%;
  }
}
</style>
