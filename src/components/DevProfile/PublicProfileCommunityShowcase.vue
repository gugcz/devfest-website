<template>
  <v-container fluid class="ma-0 pa-0">
    <v-row>
      <v-col>
        <p class="mb-0" style="font-size: 22px;font-weight:600">Community Showcase</p>
        <p class="mb-0">Top 3 Projects</p>
      </v-col>
    </v-row>

    <v-row
      align="start"
      v-if="projects.length > 0"
      justify="start"
      class=""
    >
      <v-col
        md="4"
        cols="12"
        sm="4"
        class="pa-0 ma-0 project-details mb-8"
        v-for="(project, item) in projects"
        :key="item"
      >
        <ProjectDialog
          :projectData="project"
        />
      </v-col>
    </v-row>
    
    <v-row align="start"
      v-if="projects.length===0"
      justify="start"
      class="mt-0">
      <v-col class="mt-0"><p>No Projects Found</p></v-col>
    </v-row>

  </v-container>
</template>

<script>
import ProjectDialog from "../DevProfile/ProjectDailoge.vue";
export default {
  name: "CommunityShowcase",
  components: {
    ProjectDialog
  },
  props:['projects'],
  data: () => ({
  }),
  mounted() {
  },
  methods: {
  },
};
</script>

<style></style>
