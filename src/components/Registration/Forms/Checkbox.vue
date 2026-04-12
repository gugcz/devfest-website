<template>
  <div>
    <div  class="google-font mb-3" style="font-size:105%;color:black">
      {{label}}
      <br />
      <span style="font-size:80%;color:black"
        >Můžete vybrat více jak jednu možnost</span
      >
    </div>

    <div v-for="(item, index) in options" :key="index">
      <v-checkbox
        class="my-1"
        v-model="field"
        hide-details="false"
        :rules="[]"
        :label="item"
        :id="item"
        :value="item"
        color="#4285F4"
      >
      </v-checkbox>
      <div > {{ optionsInfo[index] }} </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "CheckboxComponent",
  props: ["model", "options", "label", "optionsInfo"],
  data: () => ({
  }),
  computed: {
    field: {
      get: function() {
        return this.model;
      },
      set: function(value) {
        this.$emit("update:model", value);
      },
    },
  },
  methds: {
    getSessionData(id) {
      return this.SessionsData.filter((sd) => sd.id == id)[0];
    },
  }
};
</script>

<style>
.v-input--selection-controls .v-input__slot > .v-label,
.v-input--selection-controls .v-radio > .v-label {
  color: black;
}
</style>
