<template>
  <v-dialog v-model="dialog" width="700" scrollable>
      <template v-slot:activator="{}">
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn fab x-small outlined class="mr-1" icon v-on="on" dark color="#4285f4" @click.stop="dialog = true">
            <v-icon>mdi-lead-pencil</v-icon>
          </v-btn>
        </template>
        <span>Edit {{ projectData.name }}</span>
      </v-tooltip>
      </template>
    <v-card class="white google-font" v-if="dialog" style="border-radius:12px">
      <v-card-title
        class="px-md-10 px-5 py-md-5"
      >
        <p class="mb-0" style="font-size:25px;font-weight:550;color:black">
          Edit Project
        </p>
      </v-card-title>
      <v-card-text class="pa-0">
        <v-container fluid class="pb-8 py-0">
          <v-row>
            <v-col md="12" cols="12" class="px-md-10 px-5">
              <p style="color:#d93025">* Required</p>
              <v-form ref="form" v-model="valid" lazy-validation>
                <!-- Project Name -->
                <div>
                  <p style="font-size:105%;color:black" class="mb-1">
                    Enter Project Name
                    <span style="color:#ff5252;">*</span>
                  </p>
                  <v-text-field
                    placeholder="Enter Project Name"
                    :counter="20"
                    :rules="nameRules"
                    v-model="UpdatedProjectData.name"
                    outlined
                  ></v-text-field>
                </div>
                <!-- Project Name -->

                <!-- Project Description -->
                <div>
                  <p style="font-size:105%;color:black" class="mb-1">
                    Enter Project Description
                    <span style="color:#ff5252;">*</span>
                  </p>
                  <v-textarea
                    outlined
                    name="input-7-4"
                    :counter="300"
                    :rules="descRules"
                    v-model="UpdatedProjectData.desc"
                  ></v-textarea>
                </div>
                <!-- Project Descritpion -->

                <!-- Project Technologies -->
                <div>
                  <p style="font-size:105%;color:black" class="mb-1">
                    Technologies/Programming Language Used:
                    <span style="color:#ff5252;">*</span><br />
                    <!-- <span style="font-size:95%;color:black"
                      >Example: Mention HTML and then press Enter</span
                    > -->
                  </p>
                  <v-autocomplete
                    v-model="UpdatedProjectData.technologies"
                    :items="['Android','Angular','HTML','CSS','JavaScript','PHP','Firebase','React','Flutter', 'Google Cloud Platform','Actions on Google','PHP','UI UX Design','Machine Learning/TensorFlow','Python','Express','Java','Kotlin','Vue','AMP','PWA','Dart', 'Node','MongoDB','MySQL','React Native']"
                    chips
                    multiple
                    outlined
                    :rules="technologiesRules"
                    deletable-chips
                  ></v-autocomplete>

                </div>
                <!-- Project Technologies -->

                <!-- GitHub URL -->
                <div>
                  <p style="font-size:105%;color:black" class="mb-1">
                    GitHub URL
                  </p>
                </div>
                <v-text-field
                  placeholder="Enter GitHub Repo URL"
                  outlined
                  v-model="UpdatedProjectData.github"
                  :rules="urlRule"
                ></v-text-field>
                <!-- GitHub URL -->

                <!-- Live Demo Link -->
                <div>
                  <p style="font-size:105%;color:black" class="mb-1">
                    Live Demo URL
                  </p>
                  <v-text-field
                    placeholder="Enter Live Demo URL"
                    outlined
                    :rules="urlRule"
                    v-model="UpdatedProjectData.demo"
                  ></v-text-field>
                </div>
                <!-- Live Demo Link -->
              </v-form>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <v-card-actions class="white">
        <v-spacer></v-spacer>

        <v-btn rounded aria-label="close" class="px-10" text @click="dialog = false"
          >Close</v-btn
        >
        <v-btn
          color="#4285f4"
          depressed
          rounded
          dark
          :loading="loader"
          class="mr-4"
          @click="editProject"
        >
          Edit Project
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import ProjectService from "@/services/DevProfileProjectServices";
import FDK from "@/Config/firebase";
export default {
  name: "EditProjectComponent",
  props:['projectData','userInfo'],
  data: () => ({
    dialog: false,
    loader: false,
    valid: true,
    UpdatedProjectData: {
      name: "",
      desc: "",
      technologies: [],
      github: "",
      demo: "",
    },
    nameRules: [
      (v) => !!v || "Name is required",
      (v) => (v && v.length <= 20) || "Name must be less than 20 characters",
    ],
    descRules: [
      (v) => !!v || "Project Description is required",
      (v) =>
        (v && v.length <= 300) ||
        "Project Description must be less than 300 characters",
    ],
    technologiesRules: [
      (v) => !(v.length===0) || "Technical Stack is required",
      (v) => (v && v.length < 6) || "Technical Stack must be less then 6",
    ],
    urlRule:[
      (v) => {
        if(v.length===0){
          return true
        }
        else if(v.length>0){
          return /^(www\.|http:\/\/|https:\/\/|ftp:\/\/)\w+\.\w+/.test(v) ||
          "URL must be valid"
        }else{
          return true
        }
      } 
    ]
  }),
  created(){
    this.UpdatedProjectData.name = this.projectData.name
    this.UpdatedProjectData.desc = this.projectData.desc
    this.UpdatedProjectData.technologies = this.projectData.technologies
    this.UpdatedProjectData.github = this.projectData.github
    this.UpdatedProjectData.demo = this.projectData.demo
  },
  methods: {
    remove(item) {
      this.UpdatedProjectData.technologies.splice(
        this.UpdatedProjectData.technologies.indexOf(item),
        1
      );
      this.UpdatedProjectData.technologies = [...this.UpdatedProjectData.technologies];
    },
    async editProject() {
      this.loader = true;
      if (this.$refs.form.validate()) {
        // Logic for Adding data
        let user = FDK.auth.currentUser;
        if (user != null) {
          try {
            let res = await ProjectService.UpdateProjectByDocId(
              user.uid,
              this.projectData.docid,
              this.UpdatedProjectData,
              this.userInfo.status
            );
            if (res.success) {
              this.$emit("projectUpdated");
              this.loader = false;
              this.dialog = false;
            }
          } catch (error) {
            console.log(error)
            this.$emit("errorInProjectUpdation");
            this.loader = false;
            this.dialog = false;
          }
        }
      } else {
        alert("Please fill the required fields before submitting the form :)");
        this.loader = false
      }
    },
  },
};
</script>
