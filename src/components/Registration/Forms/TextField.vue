<template>
  <div>
    <p style="font-size:105%;color:black" class="mb-1">
      {{ label }}
      <span v-if="required" style="color:#ff5252;">*</span>
    </p>
    <v-text-field
      :placeholder="label"
      v-model="field"
      autocomplete="off"
      :rules="[required?rules.required : []]"
      outlined
      :disabled="disabled"
      class="my-0"
    ></v-text-field>
  </div>
</template>

<script>
export default {
  name: "TextFieldComponent",
  props: ["model", "required", "label", "disabled"],
  data: () => ({
    rules: {
      required: (x) => !!x || "This field is required.",
    },
  }),
  computed: {
    field: {
        get: function() {
            return this.model
        },
        set: function(value) {
            this.$emit('update:model', value)
        }
    }
  },
};
</script>
