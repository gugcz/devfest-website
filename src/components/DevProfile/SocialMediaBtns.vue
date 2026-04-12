<template>
  <div>
    <v-chip
      class="mr-2 px-4 mb-2"
      v-if="data.linkedin.length > 0"
      :href="data.linkedin"
      color="#333"
      outlined
      target="_blank"
    >
      <v-icon left>
        mdi-linkedin
      </v-icon>
      LinkedIn
    </v-chip>

     <v-chip
      class="mr-2 px-4 mb-2"
      color="#333"
      outlined
      v-if="data.twitter.length > 0"
      :href="data.twitter"
      target="_blank"
    >
      <v-icon left>
        mdi-twitter
      </v-icon>
      Twitter
    </v-chip>

    <v-chip
      class="mr-2 px-4 mb-2"
      color="#333"
      outlined
      v-if="data.github.length > 0"
      :href="data.github"
      target="_blank"
    >
      <v-icon left>
        mdi-github
      </v-icon>
      GitHub
    </v-chip>

    <v-chip
      class="mr-2 px-4 mb-2"
      color="#333"
      outlined
      v-if="data.blog.length > 0"
      :href="data.blog"
      target="_blank"
    >
      <v-icon left>
        mdi-note-text-outline
      </v-icon>
      Blog
    </v-chip>

    <v-chip
      class="mr-2 px-4 mb-2"
      color="#333"
      outlined
      v-if="data.youtube.length > 0"
      :href="data.youtube"
      target="_blank"
    >
      <v-icon left>
        mdi-youtube
      </v-icon>
      YouTube
    </v-chip>

    <v-chip
      class="mr-2 px-4 mb-2"
      color="#333"
      outlined
      v-if="data.website.length > 0"
      :href="data.website"
      target="_blank"
    >
      <v-icon left>
        mdi-web
      </v-icon>
      Website
    </v-chip> 
  </div>
</template>

<script>
export default {
    name:"SocailMediaBtnsDevProfile",
    props:["data"]
};
</script>

<style></style>
