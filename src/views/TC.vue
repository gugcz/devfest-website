<template>
   <v-main>
    <v-container fluid class="">
      <v-row justify="center" align="center">
        <v-col md="11" lg="9" class="google-font my-5 py-5 px-6 mb-8">
            <p class="google-font" style="font-size:28px;font-weight:600">
                Participation Terms & Privacy Policy
            </p>
            <p>I agree to let DevFest India 2021 Organisers use the information collected in this form to be used for my participation in "DevFest India 2021 Event". This information and any information that the organisers collects from me during my participation in this program will be maintained in accordance with Conference Privacy Policy</p>

            <p>I acknowledge that my contact information can be used to send communications about program updates and related details</p>

            <div v-for="(item, index) in tcdata" :key="index">
                <p style="font-size:18px;font-weight:600" class="mb-0">{{item.question}}</p>
                <p v-html="item.ans"></p>
            </div>
        </v-col>
      </v-row>
    </v-container>
   </v-main>
</template>

<script>
export default {
    name: "TCComponent",
    data:()=>({
        tcdata:[
            {
                "question":"What data will the DevFest 2021 website collect?",
                "ans":"DevFest 2021 website collects the following data: <br><ul><li> Personal Information(name, email, city and country of residence etc.)</li><li> Professional Information(company/institute name, role/designation, years of experience etc.)</li></ul>"
            },
            {
                "question":"How does DevFest India 2021 website collect your data?",
                "ans":"The data is collected when you: <br><ul><li> Fill in your details while registering on the DevFest India 2021 website</li></ul>"
            },
            {
                "question":"How does DevFest India 2021 website use your data?",
                "ans":"<ul><li> Your data will only be shared with the community leaders associated with Google Developer Groups.</li><li>Your data will not be shared with any company that shows interest to post job openings on the DevFest India 2021 website.</li> <li>DevFest India 2021 organising team is not/will not be responsible for any data that an attendee shares with a company for recruitment purposes.</li></ul>"
            },
            {
                "question":"Is it guaranteed that I will get a job by attending DevFest 2021?",
                "ans":"While we are inviting recruiters to DevFest 2021, we do not guarantee that you will get a job or an internship. DevFest India 2021 organising team is not responsible for any offers made during or after the DevFest. The main motive behind inviting recruiters is to connect them with attendees who might have the skills they are looking for."
            }
        ]
    }),
    created() {
        document.title = "Participation Terms & Privacy Policy | DevFest.cz 2021";
    },
}
</script>

<style>

</style>