<template>
  <v-container fluid class="my-0 py-0">
    <v-row align="center" justify="center">
      <v-col md="12" class="px-0 pos-relative">
        <v-img
          :src="require('@/assets/img/home.jpg')"
          style="border-radius: 18px"
          :lazy-src="require('@/assets/img/home.jpg')"
          width="100%"
          class="mx-0 d-none d-sm-block"
        ></v-img>

        <v-img
          :src="require('@/assets/img/home-mobile.jpg')"
          style="border-radius: 18px"
          :lazy-src="require('@/assets/img/home-mobile.jpg')"
          width="100%"
          class="mx-0 d-block d-sm-none"
        ></v-img>

        <v-img
          :src="require('@/assets/img/Dots.png')"
          style="border-radius: 18px"
          :lazy-src="require('@/assets/img/Dots.png')"
          width="300px"
          class="mx-0 d-none d-sm-block dots-img-wrapper"
        ></v-img>
      </v-col>
    </v-row>
    <v-row align="center" justify="center" class="mt-4 mt-md-10">
      <v-col md="7" cols="12">
        <p class="h1-heading mb-0 google-font">
          DevFest.cz 2021 on-line <br />Pozor změna v organizaci!
        </p>
        <p style="font-size: 18px; line-height: 30px" class="google-font">
          Letošní ročník DevFestu jsme pro vás zamýšleli, a do poslední chvíle i plánovali s 
          možností zúčastnění se eventu offline. Bohužel, situace okolo pandemie je špatná a 
          zodpovědnost našeho týmu nám opět říká, že to prostě není dobrý nápad. Neradi 
          bychom ohrozili zdraví kteréhokoli účastníka jen kvůli tomu, že jsme opravdu moc 
          chtěli udělat offline konferenci.
          <br><br>
          DevFest.cz 2021 bude probíhat pouze online, na našem YouTube, bude tedy zdarma a 
          úplně pro všechny. Nemusíte se tedy již nikam registrovat. Všem, kteří si již 
          vstupenku (ať už offline nebo online) vrátíme peníze zpět v co nejkratším možném 
          čase. Workshopy však zůstávají a registrovaní zájemci mohou dorazit podle plánu.
          <br><br>
          Pokud byste se chtěli přesto vidět i s dalšími lidmi, můžete využít akcí DevFest 
          Connect. Ty jsou co do návštěvnosti drobné, takže v případě dodržování všech 
          nařízení a hygienických pravidel, není se zde čeho obávat, a tedy proběhnou podle 
          plánu.
          <br><br>
          Všem, kteří se na offline event těšili se tímto omlouváme. Věřte, že my jsme 
          zklamaní o to víc, že loňský ročník se kvůli pandemické situaci zrušil úplně. Letos
          tedy alespoň online. Budeme se na vás těšit na streamu.
        </p>
      </v-col>
      <v-col md="5" cols="12" class="mb-10 mb-md-0 mt-n4 mt-md-0">
        <v-container>
          <v-row>
            <v-col md="5" cols="6" class="google-font">
              <span
                class="px-4 py-1"
                style="
                  border-left: 12px solid #4184f7;
                  border-radius: 12px;
                  background: white;
                  font-size: 16px;
                "
              >
                Kdy
              </span>
              <p class="mt-5 mb-0">25 - 26. listopadu</p>
              <p>2021</p>
            </v-col>
            <v-col md="5" cols="6" class="google-font">
              <span
                class="px-4 py-1"
                style="
                  border-left: 12px solid #4184f7;
                  border-radius: 12px;
                  background: white;
                  font-size: 16px;
                "
              >
                Kde
              </span>
              <!-- <p class="mt-5 mb-0">Ostrava, Dolní Oblast Vítkovice</p> -->
              <a href="https://www.youtube.com/watch?v=dhRUrX6ScoY" target="_blank" style="text-decoration:none; color:rgba(0, 0, 0, 0.87);">
                <p class="mt-5 mb-0"><v-icon>mdi-youtube</v-icon> <span style="text-decoration: underline;">YouTube</span></p>
              </a>
            </v-col>
          </v-row>
          <v-row class="mt-n4">
            <v-col>
              <v-btn
                large
                color="#4285f4"
                href="https://ti.to/devfest-cz/devfest-cz-2021/with/e2-v5dcgupw"
                target="_blank"
                dark
                depressed
                rounded
                class="mr-2 mb-2"
                style="text-transform: capitalize"
              >
                Dobrovolné vstupné
              </v-btn>

              <v-btn
                large
                depressed
                rounded
                outlined
                class="mb-2"
                to="/registration"
                style="text-transform: capitalize"
              >
                Registrace na workshopy
              </v-btn>
            </v-col>
          </v-row>
          <v-row>
            <iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/dhRUrX6ScoY" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          </v-row>
        </v-container>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "HeroSection2",
};
</script>

<style scoped>
.dots-img-wrapper {
  position: absolute;
  bottom: -33%;
  left: -6%;
}
.pos-relative {
  position: relative;
}
</style>
