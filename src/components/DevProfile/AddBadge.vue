<template>
  <v-dialog v-model="dialog" width="500">
    <template v-slot:activator="{ on }">
      <v-btn
        rounded
        color="#4285f4"
        style="text-transform: capitalize"
        depressed
        dark
        small
        v-on="on"
      >
        <v-icon left>mdi-plus</v-icon>
        Add New Badge</v-btn
      >
    </template>

    <div class="pa-0 white" v-if="dialog" style="border-radius:15px">
        
        <!-- <v-divider></v-divider> -->
        <v-container fluid>
          <v-row class="py-0 my-0" style="border-bottom: 1px solid #e0e0e0;">
            <v-col md="12" cols="12" class="py-3 px-5 my-0">
                <p class="google-font h1-subheading mb-0">Add New Badge</p>
                <p>Enter Code for Badge</p>
                <v-text-field
                    placeholder="Enter Code"
                    outlined
                ></v-text-field>
                <v-btn rounded depressed class="mt-n2" color="#4285f4" dark>Apply Code</v-btn>
            </v-col>
          </v-row>
        </v-container>
    </div>
  </v-dialog>
</template>

<script>
export default {
    name:'AddBadge',
    mounted(){
       
    },
    data:()=>({
        dialog: false,
    })
};
</script>

<style></style>
