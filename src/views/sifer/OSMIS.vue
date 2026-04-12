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
             <div class="table">
            <div class="radek">
                <span class="google-font" v-on:click="test">R</span>
                <span class="google-font" v-on:click="test">N</span>
                <span class="google-font" v-on:click="test">A</span>
                <span class="google-font" v-on:click="test">S</span>
                <span class="google-font" v-on:click="test">H</span>
                <span class="google-font" v-on:click="test">E</span>
                <span class="google-font" v-on:click="test">L</span>
                <span class="google-font" v-on:click="test">L</span>
            </div>
            <div class="radek">
                <span class="google-font" v-on:click="test">A</span>
                <span class="google-font" v-on:click="test">C</span>
                <span class="google-font" v-on:click="test">D</span>
                <span class="google-font" v-on:click="test">O</span>
                <span class="google-font" v-on:click="test">A</span>
                <span class="google-font" v-on:click="test">M</span>
                <span class="google-font" v-on:click="test">E</span>
                <span class="google-font" v-on:click="test">P</span>
            </div>
            <div class="radek">
                <span class="google-font" v-on:click="test">W</span>
                <span class="google-font" v-on:click="test">I</span>
                <span class="google-font" v-on:click="test">E</span>
                <span class="google-font" v-on:click="test">A</span>
                <span class="google-font" v-on:click="test">R</span>
                <span class="google-font" v-on:click="test">R</span>
                <span class="google-font" v-on:click="test">A</span>
                <span class="google-font" v-on:click="test">Y</span>
            </div>
            <div class="radek">
                <span class="google-font" v-on:click="test">L</span>
                <span class="google-font" v-on:click="test">I</span>
                <span class="google-font" v-on:click="test">V</span>
                <span class="google-font" v-on:click="test">E</span>
                <span class="google-font" v-on:click="test">D</span>
                <span class="google-font" v-on:click="test">R</span>
                <span class="google-font" v-on:click="test">O</span>
                <span class="google-font" v-on:click="test">N</span>
            </div>
            <div class="radek">
                <span class="google-font" v-on:click="test">S</span>
                <span class="google-font" v-on:click="test">O</span>
                <span class="google-font" v-on:click="test">F</span>
                <span class="google-font" v-on:click="test">T</span>
                <span class="google-font" v-on:click="test">W</span>
                <span class="google-font" v-on:click="test">A</span>
                <span class="google-font" v-on:click="test">R</span>
                <span class="google-font" v-on:click="test">E</span>
            </div>
            <div class="radek">
                <span class="google-font" v-on:click="test">B</span>
                <span class="google-font" v-on:click="test">A</span>
                <span class="google-font" v-on:click="test">E</span>
                <span class="google-font" v-on:click="test">I</span>
                <span class="google-font" v-on:click="test">A</span>
                <span class="google-font" v-on:click="test">G</span>
                <span class="google-font" v-on:click="test">A</span>
                <span class="google-font" v-on:click="test">A</span>
            </div>
            <div class="radek">
                <span class="google-font" v-on:click="test">U</span>
                <span class="google-font" v-on:click="test">O</span>
                <span class="google-font" v-on:click="test">S</span>
                <span class="google-font" v-on:click="test">T</span>
                <span class="google-font" v-on:click="test">R</span>
                <span class="google-font" v-on:click="test">A</span>
                <span class="google-font" v-on:click="test">V</span>
                <span class="google-font" v-on:click="test">A</span>
            </div>
            <div class="radek">
                <span class="google-font" v-on:click="test">G</span>
                <span class="google-font" v-on:click="test">I</span>
                <span class="google-font" v-on:click="test">T</span>
                <span class="google-font" v-on:click="test">I</span>
                <span class="google-font" v-on:click="test">E</span>
                <span class="google-font" v-on:click="test">M</span>
                <span class="google-font" v-on:click="test">A</span>
                <span class="google-font" v-on:click="test">G</span>
            </div>
        </div>
        
        <div class="slova">
            <span class="google-font" v-on:click="test">software</span>
            <span class="google-font" v-on:click="test">hardware</span>
            <span class="google-font" v-on:click="test">wifi</span>
            <span class="google-font" v-on:click="test">array</span>
            <span class="google-font" v-on:click="test">devfest</span>
            <span class="google-font" v-on:click="test">ostrava</span>
            <span class="google-font" v-on:click="test">raw</span>
            <span class="google-font" v-on:click="test">dron</span>
            <span class="google-font" v-on:click="test">rel</span>
            <span class="google-font" v-on:click="test">var</span>
            <span class="google-font" v-on:click="test">game</span>
            <span class="google-font" v-on:click="test">nas</span>
            <span class="google-font" v-on:click="test">git</span>
            <span class="google-font" v-on:click="test">bug</span>
            <span class="google-font" v-on:click="test">shell</span>
        </div>
        </v-col>      
      </v-row>
    </v-container>
  </v-main>
</template>

<script>
export default {
  created(){
    document.title = 'Šifra | DevFest.cz 2021'
  },
  methods: {
    test: function(ele) {
      ele.target.classList.toggle("skrt");
    }
  }
};
</script>

<style scoped>
.table {
                float: left;
            }
            .radek span {
                display: inline-block;
                width: 25px;
                height: 25px;
                cursor: pointer;
            }
            .slova span {
                display: block;
                font-size: 25;
                cursor: pointer;
            }
            .slova {
                float: right;
                width: 50%;
                columns: 2;
                line-height: 1.5;
            }
            .skrt {
                text-decoration: line-through;
            }
</style>