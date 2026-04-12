import firebase from "@/Config/firebase";

let DevFestBadgeService = {
  /**
   * @description Get All Badges
   * @returns Promise
   * @author Kartik Derasari
   **/
  getAllPublicProfileBadges: () =>
    new Promise(async (resolve, reject) => {
      try {
        // Get All Badges
        let AllBadgesData = await firebase.firestore.collection("badges").get();
        AllBadgesData = await AllBadgesData.docs.map((doc) => {
          if (doc.data().visible) {
            return {
              ...{
                des: doc.data().desc,
                docid: doc.data().docid,
                image: doc.data().image,
                name: doc.data().name,
                visible: doc.data().visible,
              },
              ...{ docid: doc.id },
            };
          }
        });

        resolve({
          success: true,
          data: AllBadgesData,
        });
      } catch (e) {
        reject(e);
      }
    }),
};

export default DevFestBadgeService;
