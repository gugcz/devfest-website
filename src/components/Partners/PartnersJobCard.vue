<template>
  <v-card
    class="mx-auto"
    style="border-radius:14px;border-color:transparent;"
    outlined
    :href="partner.links.website"
    target="_blank"
  >
    <div  v-if="partner.imageOnly" style="height: 112px; text-align: center; display: flex;justify-content: center; align-items: center;">
      <v-img
          
            :src="getPartnerImgUrl(partner.logo)"
            :lazy-src="getPartnerImgUrl(partner.logo)"
            :alt="partner.name"
            max-height="90"
            contain
      ></v-img>
    </div>
    <v-list-item two-line v-if="!partner.imageOnly">
      <v-list-item-avatar
        size="80"
        rounded="0"
      >
        <v-img
          :src="getPartnerImgUrl(partner.logo)"
          :lazy-src="getPartnerImgUrl(partner.logo)"
          :alt="partner.name"
        ></v-img>
      </v-list-item-avatar>
      <v-list-item-content>
        <v-list-item-title class="mb-0 google-font" style="font-weight: bold;font-size:16px;line-height: 32px;">
          {{ partner.name }} 
        </v-list-item-title>
        <!-- <v-list-item-subtitle class="google-font" style="font-weight: light;font-size:14px;color:#aeaeae;line-height: 32px;">
          {{ jobs.length }} Open Roles
        </v-list-item-subtitle> -->
      </v-list-item-content>
    </v-list-item>
  </v-card>
</template>
<script>
export default {
  name: "PartnersJobCard",
  data: () => ({}),
  props: ["partner", "jobs"],
  mounted() {
    // console.log("PartnersJobCard", this.jobs, this.partner)
  }
}
</script>

<style lang="scss" scoped></style>
