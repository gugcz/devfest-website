<template>
  <div>
    <p style="font-size: 105%; color: black" class="mb-1">
      {{ label }}
      <span v-if="required" style="color: #ff5252">*</span>
    </p>
    <p>
      Kindly Add your country code with Mobile Number; Example +91xxxxxxxxxx
    </p>
    <v-text-field
      :placeholder="label"
      v-model="field"
      autocomplete="off"
      :rules="mobileRule"
      outlined
      :disabled="disabled"
      class="my-0"
      type="number"
    ></v-text-field>
  </div>
</template>

<script>
export default {
  name: "MobileNumberComponent",
  props: ["model", "required", "label", "disabled"],
  data: () => ({
    mobileRule: [
      (v) => {
        return (
          /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im.test(
            v
          ) || "Not a valid Phone Number"
        );
      },
    ],
  }),
  computed: {
    field: {
      get: function () {
        return this.model;
      },
      set: function (value) {
        this.$emit("update:model", value);
      },
    },
  },
};
</script>