<template>
  <v-dialog v-model="dialog" width="700" scrollable>
    <template v-slot:activator="{ on, attrs }">
      <div
        v-on="on"
        v-ripple
        v-bind="attrs"
        style="
          cursor: pointer;
          background: white;
          border-radius:12px 
        "
        class="pa-5 mb-2 mx-1"
      > 
        <p class="mb-1" style="font-size:130%;font-weight:600">
          {{ projectData.name }}
        </p>
        <p style="font-size:90%">{{ projectData.desc.substring(0, 90) + "..." }}</p>

        <p v-if="!admin" class="mb-0" style="font-size:95%;font-weight:600">Go to Project</p>

        <UpdateProjectComponent
          v-if="admin"
          :userInfo="userInfo"
          :projectData="projectData"
          @projectUpdated="$emit('projectUpdated')"
          @errorInProjectUpdation="$emit('errorInProjectUpdation')"
        />

        <DeleteProjectComponent 
          v-if="admin"
          :userInfo="userInfo"
          :projectData="projectData"
          @projectRemoved="$emit('projectRemoved')"
          @errorInProjectDeletion="$emit('errorInProjectDeletion')"
        />
      </div>
    </template>
    <v-card class="white google-font" v-if="dialog" style="border-radius:12px" >
      <v-card-text class="pa-0">
        <v-container fluid class="py-8">
          <v-row>
            <v-col md="12" cols="12" class="px-md-10 px-5">
              <p style="font-size:25px;font-weight:550;color:black">
                {{ projectData.name }} Details
              </p>
            </v-col>
          </v-row>
          <v-row>
            <v-col md="12" cols="12" class="px-md-10 px-5">
              <p class="google-font" style="font-size: 110%;color:black">
                {{ projectData.desc }}
              </p>

              <p class="mt-5" style="font-size:18px;font-weight:500">Technical Stacks</p>
              <v-chip
                outlined
                v-for="(tech, index) in projectData.technologies"
                :key="index"
                color="black"
                class="mr-1"
                small
                >{{ tech }}</v-chip
              >
              <br><br> <br><br>


              <v-btn
                v-if="projectData.github!=null && projectData.github.length"
                color="grey darken-3"
                dark
                :href="projectData.github"
                target="_blank"
                depressed
                rounded
                ><v-icon left>mdi-github</v-icon>GitHub</v-btn
              >

              <v-btn
                v-if="projectData.demo!=null && projectData.demo.length"
                :href="projectData.demo"
                target="_blank"
                color="#4285fa"
                :class="projectData.github.length==0?'':'ml-3'"
                dark
                depressed
                rounded
                ><v-icon left>mdi-eye-outline</v-icon>Demo</v-btn
              >
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <v-card-actions class="white">
        <v-spacer></v-spacer>
        <v-btn aria-label="close" class="px-10" text @click="dialog = false"
          >Close</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import DeleteProjectComponent from '../DevProfile/Project/DeleteProject.vue'
import UpdateProjectComponent from '../DevProfile/Project/EditProject.vue'
export default {
  name: "ProjectDialogComponent",
  props: ["projectData","admin", "userInfo"],
  components:{
    DeleteProjectComponent,
    UpdateProjectComponent
  },
  data: () => ({
    dialog: false,
  }),
  methods: {},
};
</script>
