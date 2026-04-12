<template>
  <v-container fluid>
    <v-row justify="center" align="center">
      <v-col md="7" sm="12" cols="12" class="black--text">
        <p class="google-font h1-heading" style="">
          DevFest.cz pořádají vývojáři a tech nadšenci ze všech koutů Česka
        </p>
        <p class="google-font" style="font-size:18px;line-height: 30px;">
          Od roku 2012, kdy komunita GUG.cz přinesla do Česka první DevFest, jsme tuto 
          konferenci posunuli na úroveň, kterou si každoročně užívají stovky účastníků. 
          Původně jsme pro vás chtěli připravit offline konferenci, kterou by v hybridním 
          režimu doprovázel livestream, aby se mohli na naše talky podívat i ti, kteří 
          jednoduše dorazit na místo nemohou. Jenže pak začala čísla růst...
          <br><br>
          Přišlo tedy rychlé rozhodnutí. Offline event udělat nemůžeme. Zodpovědnost za 
          životy účastníků si jednoduše na hrb nevezme nikdo z nás. A proto jsme vše 
          začali vymýšlet od začátku.
          <br><br>
          Rozhodli jsme, že online stream zpřístupníme úplně každému, zdarma. A celý 
          stream uděláme ještě zajímavější. Zapojíme do streamu hru, abyste zaměstnali 
          mozek v každé chvilce. Na konci dne vylosujeme výherce a ten získá nějakou 
          odměnu. No není to super? Stačí prostě jen přijít na YouTube GUG.cz a sledovat 
          odkudkoli jen budete chtít.
          <br><br>
          Samozřejmě můžete stále využít menších doprovodných eventů DevFest 
          Connect, které se chystají v Brně, Praze, Jihlavě a Chomutově. Jelikož se jedná o 
          eventy s relativně nízkou očekávanou návštěvností, velké riziko zde nehrozí, 
          pokud budou dodržena hygienická pravidla. Takže pokud stále chcete být mezi 
          lidmi, na webu GUG.cz si najděte svůj Connect.
          </p>
        <p class="google-font mt-5">
          <v-chip
            v-for="item in hashtags"
            :key="item"
            style="color:black;font-size:14px"
            depressed
            target="_blank"
            rel="noreferrer"
            :href="'https://twitter.com/hashtag/' + item"
            color="#CDDFFD"
            class="mr-2 mb-2 px-5"
          >
            <v-icon left>mdi-twitter</v-icon>
            #{{ item }}
          </v-chip>
        </p>
      </v-col>
      <v-col md="5" sm="12" cols="12" class=" text-center">
        <v-img
          alt="Vuetify Logo"
          contain
          :src="require('@/assets/img/overview.png')"
          width="80%"
          style="margin-left:auto;margin-right:auto"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "Overview",
  data: () => ({
    hashtags: ["DevFestCZ"],
  }),
  mounted() {},
};
</script>

<style scoped>
/* .v-chip.v-chip--outlined.v-chip.v-chip {
      background: #CDDFFD !important;
    margin-top: 8px;
} */
</style>
