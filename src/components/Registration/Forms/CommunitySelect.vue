<template>
  <div>
    <p style="font-size:105%;color:black">
      Which community are you associated with?
      <span style="color:#ff5252;">*</span>
      <br />
      <span style="font-size:80%"
        >Choose others if the community is not in the list.</span
      >
    </p>
    <v-combobox
      v-model="field"
      :items="gdgcommunities"
      :rules="[rules.community]"
      label="Which community are you associated with?"
      outlined
    ></v-combobox>

    <p
      style="font-size:95%;color:black"
      v-if="field && field.toLowerCase() === 'others'"
    >
      Enter 'NA' if this is your first community event
      <span style="color:#ff5252;">*</span>
    </p>
    <v-text-field
      v-if="field && field.toLowerCase() === 'others'"
      label="Others"
      v-model="ocField"
      placeholder="Community Name"
      :rules="[rules.required]"
      outlined
    ></v-text-field>
  </div>
</template>

<script>
let communities= [
  "GDG Ahmedabad",
  "GDG Bangalore",
  "GDG Bhilai",
  "GDG Bhopal",
  "GDG Bhubaneswar",
  "GDG Blrdroid ",
  "GDG Chandigarh",
  "GDG Chennai",
  "GDG Cloud Ahmedabad",
  "GDG Cloud Bengaluru",
  "GDG Cloud Bhubaneswar",
  "GDG Cloud Chennai",
  "GDG Cloud Coimbatore",
  "GDG Cloud Indore",
  "GDG Cloud Mumbai",
  "GDG Cloud New Delhi",
  "GDG Cloud Hyderabad",
  "GDG Cloud Pune",
  "GDG Cochin",
  "GDG Coimbatore ",
  "GDG Gandhinagar",
  "GDG Goa",
  "GDG Gwalior",
  "GDG Hubli",
  "GDG Hyderabad",
  "GDG Indore",
  "GDG Jaipur",
  "GDG Jammu",
  "GDG Jalandhar",
  "GDG Kolkata",
  "GDG Kozhikode",
  "GDG Lucknow",
  "GDG MAD",
  "GDG Madurai",
  "GDG Nagpur",
  "GDG Nashik",
  "GDG New Delhi",
  "GDG Patna",
  "GDG Rajkot",
  "GDG Ranchi",
  "GDG Siliguri",
  "GDG Srinagar",
  "GDG Thiruvananthapuram",
  "GDG Udaipur",
  "GDG Mysuru",
  "GDG Vizag",
  "GDG Kolkata",
  "GDG Surat",
  "GDG Pune",
  "GDG Jodhpur",
  "GDG Baroda",
  "GDG Cloud Jaipur",
  "GDG Salem",
  "Others",
];
export default {
  name: "CommunitySelect",
  props: ["model", 'otherCommunity'],
  created(){
  },
  data: () => ({
    gdgcommunities: communities,
    rules: {
      required: (value) => !!value || "This field is required.",
      community: (value) => {
        return (
          communities.indexOf(value) >= 0 ||
          "Please choose the community you are associated with."
        );
      },
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
            return this.otherCommunity;
        },
        set: function(value) {
            this.$emit("update:otherCommunity", value);
        },
    }
  },
};
</script>

<style></style>
