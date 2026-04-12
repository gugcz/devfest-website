<template>
  <v-container fluid class="ma-0 pa-0">
    <Snackbar
      :message="snackBarMessage"
      :isShow.sync="isSnackBarVisible"
      :color="snackBarColor"
      :timeout="snackBarTimeOut"
    />
    <v-row>
      <v-col>
        <p class="mb-0" style="font-size: 22px;font-weight:600">Community Showcase</p>
        <p>Add your top 3 Projects</p>
        <!-- {{projects.length<4 || projects.length==3}} -->
        <AddProject
          v-if="!(projects.length > 3 || projects.length === 3)"
          :userInfo="userInfo"
          @projectAdded="showSnackbar('Project Added Successfully')"
          @errorInProjectAddition="showSnackbar('Error in Adding Project. Please try again in a few minutes')"
        />
      </v-col>
    </v-row>
    <v-row align="start" justify="start" v-if="projectsLoader">
      <v-col>
        <v-progress-circular
          :size="50"
          color="primary"
          indeterminate
        ></v-progress-circular>
      </v-col>
    </v-row>

    <v-row
      align="start"
      v-if="!projectsLoader && projects.length > 0"
      justify="start"
      class=""
    >
      <v-col
        md="6"
        lg="4"
        cols="12"
        sm="4"
        class="pa-0 ma-0 project-details mb-8"
        v-for="(project, item) in projects"
        :key="item"
      >
        <ProjectDialog
          :projectData="project"
          :admin="true"
          :userInfo="userInfo"
          @projectRemoved="showSnackbar('Project Removed Successfully')"
          @projectUpdated="showSnackbar('Project Edited Successfully')"
          @errorInProjectDeletion="showSnackbar('Error in Removing Project. Please try again in a few minutes')"
          @errorInProjectUpdation="showSnackbar('Error in updating Project. Please try again in a few minutes')"
        />
      </v-col>
    </v-row>

    <v-row
      align="start"
      justify="start"
      v-if="!projectsLoader && projects.length === 0"
    >
      <v-col md="4" cols="12">
        <p class="my-1" style="font-size:17px;font-weight:500">
          <v-icon size="30"> mdi-note-outline </v-icon> No Projects Found
        </p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import ProjectService from "@/services/DevProfileProjectServices";
import Snackbar from "@/components/Common/Snackbar.vue";
import ProjectDialog from "../DevProfile/ProjectDailoge.vue";
import AddProject from "../DevProfile/Project/AddProject.vue";
export default {
  name: "CommunityShowcase",
  components: {
    ProjectDialog,
    AddProject,
    Snackbar,
  },
  props: ["userInfo"],
  data: () => ({
    // Snackbar
    snackBarMessage: "",
    isSnackBarVisible: false,
    snackBarColor: "green",
    snackBarTimeOut: 5000,
    //
    projectsLoader: false,
    projects: [],
  }),
  mounted() {
    this.getProjectsData();
  },
  methods: {
    async showSnackbar(msg) {
      this.snackBarMessage = msg;
      this.isSnackBarVisible = true;
      window.location.reload()
      await this.getProjectsData();
    },
    async getProjectsData() {
      this.projectsLoader = true;
      let res = await ProjectService.GetAllProjects(this.userInfo.docid);
      if (res.success) {
        this.projects = res.data;
      }
      this.projectsLoader = false;
    },
  },
};
</script>

<style>
.project-details  p {
  -webkit-box-orient: vertical;
    height: 45px;
    word-break: break-all;
    overflow: hidden;
    -webkit-line-clamp: 2;
    white-space: normal;
    text-overflow: ellipsis
}
</style>
