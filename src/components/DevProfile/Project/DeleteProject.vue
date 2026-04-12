<template>
  <v-dialog v-model="dialog" max-width="400">
    <template v-slot:activator="{}">
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn fab x-small outlined class="mr-1" icon v-on="on" dark color="#4285f4" @click.stop="dialog = true">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
        <span>Remove {{ projectData.name }}</span>
      </v-tooltip>
    </template>

    <v-card v-if="dialog" style="border-radius:12px">
      <v-card-title class="google-font" style="font-size:20px;font-weight:600">Are you sure?</v-card-title>
      <v-card-text class="google-font" style="font-size:17px;color:black">Would you like to remove {{ projectData.name }} form the Projects?</v-card-text>
      <v-card-actions>
        <div class="flex-grow-1"></div>

        <v-btn color="green darken-1" text @click="dialog = false">Disagree</v-btn>

        <v-btn color="red darken-1" text :loading="loading" @click="deleteItem(projectData.docid)">Agree</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import ProjectService from "@/services/DevProfileProjectServices";
import FDK from "@/Config/firebase";
export default {
  name:"DeleteProjectComponent",
  props: ['projectData', 'userInfo'],
  data: () => ({
    dialog: false,
    loading: false
  }),
  methods: {
    async deleteItem(id) {
      this.loading = true;
      let user = FDK.auth.currentUser;
        if (user != null) {
            try {
                let res = await ProjectService.RemoveProjectByDocId(user.uid, id, this.userInfo.status)
                if(res.success){
                    this.$emit("projectRemoved");
                    this.loading = false
                    this.dialog = false
                }
            } catch (error) {
                this.$emit("errorInProjectDeletion");
                this.loading = false
                    this.dialog = false
            }
        }else{
            this.$emit("errorInProjectDeletion");
            this.loading = false
            this.dialog = false
        }
    }
  }
};
</script>