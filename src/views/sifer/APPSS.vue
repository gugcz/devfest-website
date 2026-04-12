<template>
  <v-main>
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
          <p class="h1-heading">Šifra</p>
              <v-btn
                large
                color="#4285f4"
                href="https://forms.gle/JBE1XB8bcE3pUG4S6"
                target="_blank"
                dark
                depressed
                rounded
                class="mr-2 mb-2"
                style="text-transform: capitalize"
              >
                Výsledkový formulář
              </v-btn>

        </v-col>
      </v-row>
      <v-row justify="center" align="center">
        <v-col
          md="11"
          lg="6"
          class="google-font mt-0 mt-md-2 mb-15 pt-3 py-md-10 px-4 px-md-0"
        >
            <embed type="text/html" src="./sfr-apps.html" width="100%" height="400">
        </v-col>      
      </v-row>
    </v-container>
  </v-main>
</template>

<script>
export default {
  created(){
    document.title = 'Šifra | DevFest.cz 2021'
  }
};
</script>

<style scoped>
</style>