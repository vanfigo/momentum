import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {Scrambler} from "./scrambler.class";

admin.initializeApp();

exports.createUser = functions.auth.user().onCreate((userRecord) => {
  return admin.firestore().doc(`/users/${userRecord.uid}`).set({
    email: userRecord.email,
  });
});

exports.findPlayer = functions.firestore.document("lobbies/{uid}")
    .onCreate((snapshot) => {
      const {roomType, user} = snapshot.data();
      return admin.firestore().collection("lobbies")
          // TODO based on roomType, add a filter for ranked times
          .orderBy("user.uid")
          .where("user.uid", "!=", user.uid)
          .where("roomType", "==", roomType)
          .orderBy("creation")
          .get().then((querySnapshot: any) => {
            // Opponent found!
            if (querySnapshot.docs.length > 0) {
              const opponent = querySnapshot.docs.pop();
              const opponentUser = opponent.data().user;
              // Creates a room for the matched players
              admin.firestore().collection("rooms").add({
                users: [opponentUser.uid, user.uid],
                roomType,
                creation: new Date().getTime(),
                scrambles: new Scrambler().getPlayableScrambles(),
              }).then((room) => {
                // Updates user's room and deletes their lobby waiting documents
                const batch = admin.firestore().batch();
                const usersCol = admin.firestore().collection("users");
                const lobbisesCol = admin.firestore().collection("lobbies");
                batch.delete(lobbisesCol.doc(snapshot.id));
                batch.delete(lobbisesCol.doc(opponent.id));
                batch.update(usersCol.doc(user.uid),
                    {rankedRoomUid: room.id});
                batch.update(usersCol.doc(opponentUser.uid),
                    {rankedRoomUid: room.id});
                return batch.commit();
              });
            }
            return null;
          });
    });
