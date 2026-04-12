<template>
  <div>
    <v-radio-group
      :rules="[(v) => !!v || 'This field is required.']"
      v-model="field"
      column
      class="mb-3"
    >
      <div
        class="google-font mb-3 mt-n2"
        style="font-size:105%;color:black !important"
      >
        {{ label }}
        <span style="color:#ff5252;">*</span>
        <br />
        <span style="color:#ff5252;font-size:70%" v-show="field === 0"
          >This field is required.</span
        >
      </div>

      <v-radio
        v-for="(item, index) in options"
        :tabindex="index"
        :key="index"
        color="#4285F4"
        :value="item"
        :label="item"
      >
      </v-radio>
    </v-radio-group>
    <v-text-field
      v-if="field==='Other Communities'"
      placeholder="Enter Community Name"
      v-model="ocField"
      autocomplete="off"
      :rules="[rules.required]"
      outlined
      class="my-0 mt-n5"
    ></v-text-field>
  </div>
</template>

<script>
export default {
  name: "GenderRadioFieldComponent",
  props: ["model", "options", "label","knownByOrtherCommunity"],
  data: () => ({
    rules: {
      radiobtn: (value) => {
        return value.length > 0 || "This field is required.";
      },
      required: (x) => !!x || "This field is required.",
    },
    
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
    ocField:{
      get: function() {
        return this.knownByOrtherCommunity;
      },
      set: function(value) {
        this.$emit("update:knownByOrtherCommunity", value);
      },
    }
  },
};
</script>

<style>
.v-input--selection-controls .v-input__slot > .v-label,
.v-input--selection-controls .v-radio > .v-label {
  color: black;
}
</style>
