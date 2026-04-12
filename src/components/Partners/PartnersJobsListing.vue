<template>
  <v-container fluid class="px-5 pb-16">
    <v-row align="center" justify="center">
        <v-col md="11" lg="9" cols="12" class="google-font">
          <!-- <PartnersFilterSection /> -->
          <v-container fluid class="px-0">
            <v-row md="12">
              <v-col
                cols="12"
                lg="3"
                md="4"
                sm="6"
                class="px-3 py-4 google-font"
                v-for="partner in PartnersData"
                :key="partner.cid"
              >
                <PartnersJobCard :partner="partner" :jobs="getJobsForPartnerId(partner.jobs)" />
              </v-col>
              <v-col>
                <v-card
                  class="mx-auto"
                  style="border-radius:14px;border-color:transparent;"
                  href="mailto:devfest@gug.cz" target="_blank"
                  rel="noreferrer"
                  outlined
                >
                  <v-list-item two-line>
                    <v-list-item-content style="height: 112px;">
                      <v-list-item-title class="mb-0 google-font" style="font-weight: bold;font-size:16px;line-height: 32px;">
                        Chcete se stát partnerem? Kontaktujte nás zde
                      </v-list-item-title>
                      <!-- <v-list-item-subtitle class="google-font" style="font-weight: light;font-size:14px;color:#aeaeae;line-height: 32px;">
                        {{ jobs.length }} Open Roles
                      </v-list-item-subtitle> -->
                    </v-list-item-content>
                  </v-list-item>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-col>
      </v-row>
  </v-container>
</template>

<script>
import PartnersDataJSON from "@/assets/data/partners.json";
import JobsDataJSON from "@/assets/data/jobs.json";
export default {
  name: "PartnersJobsListing",
  components: {
    PartnersJobCard: () => import("./PartnersJobCard.vue"),
    // PartnersFilterSection: () => import("./PartnersFilterSection.vue"),
  },
  data: () => ({
    PartnersData: [],
    JobsData: []
  }),
  mounted() {
    this.PartnersData = PartnersDataJSON.filter(partner => partner.visible);
    this.JobsData = JobsDataJSON.filter(job => job.active);
  },
  methods: {
    getJobsForPartnerId(jobsIds) {
      return this.JobsData.filter((job) => jobsIds.includes(job.jid));
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
