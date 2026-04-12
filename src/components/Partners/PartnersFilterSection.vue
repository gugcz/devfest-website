<template>
  <v-container fluid class="px-0 mx-0">
    <v-row md="12">
      <v-col cols="12" class="google-font mt-2 px-4" style="font-weight: bold;font-size:17px;line-height: 32px;">
          Search by roles:
      </v-col>
      <v-col cols="12" class="d-flex px-4 flex-wrap">
          <v-chip
            class="mr-2 px-4 mb-2"
            color="#333"
            outlined
          >
            Full-Stack
          </v-chip>
          <v-chip
            class="mr-2 px-4 mb-2"
            color="#333"
            outlined
          >
            Cloud
          </v-chip>
          <v-chip
            class="mr-2 px-4 mb-2"
            color="#333"
            outlined
          >
            UX Design
          </v-chip>
          <v-chip
            class="mr-2 px-4 mb-2"
            color="#333"
            outlined
          >
            Cloud Architecture
          </v-chip>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>

export default {
  name: "PartnersFilterSection"
}
</script>
