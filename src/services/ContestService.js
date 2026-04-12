import firebase from "@/Config/firebase";

let ContestService = {

  /**
   * @description Check Submission for Contest
   * @param uid
   * @returns Promise
   * @author Vrijraj Singh
   **/

   checkSubmission: (uid) =>
    new Promise(async (resolve, reject) => {
      try {
        
        let res = await firebase.firestore
          .collection('contestData')
          .doc(uid)
          .get();
        if(res.exists){
          resolve({
            success: true,
          });
        }else{
          resolve({
            success: false,
          });
        }
        
      } catch (e) {
        reject(e);
      }
    }),

  /**
   * @description Create Public Profile
   * @param userId
   * @returns Promise
   * @author Vrijraj Singh
   **/
   createUserPublicProfile: (uid) =>
   new Promise(async (resolve, reject) => {
     // console.log(uid)
     try {
       let res = firebase.firestore.collection('edata').doc(uid);
       let publicUserData = await res.get();
       publicUserData = publicUserData.data();
       let projects = await res.collection("projects").get();
       let badges = await res.collection("badges").get();

       // Logic for Public Profile Obj
       delete publicUserData.email;
       delete publicUserData.experience;
       delete publicUserData.knowAbout;
       delete publicUserData.share;
       delete publicUserData.theme;

       publicUserData.projects = projects.docs.map((doc) => doc.data());
       publicUserData.badges = badges.docs.map((doc) => doc.data());

       // console.log(publicUserData);
       // Remove previous user Data
       await firebase.firestore
         .collection("publicProfile")
         .doc(uid)
         .delete();
       // Adding new User Data
       await firebase.firestore
         .collection("publicProfile")
         .doc(uid)
         .set(publicUserData);

       resolve({
         success: true,
       });
     } catch (e) {
         console.log(e)
       reject(e);
     }
   }),

 /**
  * @description Check User Profile Badge Already Exist
  * @param uid
  * @param codeid
  * @returns Promise
  * @author Vrijraj Singh
  **/

 checkAlreadyExist: (uid, codeId) =>
   new Promise(async (resolve, reject) => {
     try {
       const result = await firebase.firestore
         .collection("edata")
         .doc(uid)
         .collection("badges")
         .doc(codeId)
         .get();
       resolve({
         success: true,
         isExist: result.exists,
       });
     } catch (e) {
       reject(e);
     }
   }),
   
  /**
   * @description Participat Into Contest
   * @param uid
   * @param email
   * @param isPublic
   * @param timestamp
   * @param participantCodeId
   * @param contestName
   * @param code
   * @returns Promise
   * @author Vrijraj Singh
   **/

  participateIntoContest: (
    uid,
    email,
    isPublic,
    timestamp,
    participantCodeId,
    contestName,
    code
  ) =>
    new Promise(async (resolve, reject) => {
      try {
        const isAlradyExist = await ContestService.checkAlreadyExist(
          uid,
          participantCodeId
        );
        if(isAlradyExist.isExist){
          resolve({
            status: false,
            success: false
          })
        }

        // Not Exist then add Participant Badge
        await firebase.firestore
            .collection("edata")
            .doc(uid)
            .collection("badges")
            .doc(participantCodeId)
            .set({
              time: timestamp,
              codeId: participantCodeId,
            });

        if (isPublic) await ContestService.createUserPublicProfile(uid);

        let res = await firebase.firestore
          .collection('contestData')
          .doc(uid)
          .set({
            decodedCode: code,
            createdAt: timestamp,
            uid: uid,
            email: email,
            contestName: contestName
          });
        resolve({
          status: true,
          success: true,
        });
      } catch (e) {
        reject(e);
      }
    }),


};

export default ContestService;
