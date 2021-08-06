import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {Scrambler} from "./scrambler.class";

admin.initializeApp();

exports.createUser = functions.auth.user().onCreate((userRecord, context) => {
  return admin.firestore().doc(`/users/${userRecord.uid}`).set({
    email: userRecord.email,
    username: userRecord.displayName || userRecord.email,
    photoUrl: userRecord.photoURL || "",
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
                users: [opponentUser, user],
                roomType,
                status: 0,
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

exports.roomCompleted = functions.firestore.document("rooms/{uid}")
    .onUpdate(async (snapshot) => {
      if (snapshot.before.data().status !== snapshot.after.data().status) {
        const room = snapshot.after.data();
        room.uid = snapshot.after.id;
        const roomRef = snapshot.after.ref;
        const userOne = room.users[0];
        const userTwo = room.users[1];
        const userOneSnapshot = await roomRef.collection(userOne.uid)
            .orderBy("creation", "asc").get();
        const userTwoSnapshot = await roomRef.collection(userTwo.uid)
            .orderBy("creation", "asc").get();
        let userOneRecords =
            userOneSnapshot.docs.map((snapshot) => {
              return {...snapshot.data(), uid: snapshot.id};
            });
        let userTwoRecords =
            userTwoSnapshot.docs.map((snapshot) => {
              return {...snapshot.data(), uid: snapshot.id};
            });
        // Get avarage and mark as partOfAverage on each case
        const userOneAverage = calculateAverage(userOneRecords);
        userOneRecords = userOneRecords.map((record: any) => {
          record.partOfAverage = !!userOneAverage.averageRecords
              .find((_record) => record.uid === _record.uid);
          return record;
        });
        const userTwoAverage = calculateAverage(userTwoRecords);
        userTwoRecords = userTwoRecords.map((record: any) => {
          record.partOfAverage = !!userTwoAverage.averageRecords
              .find((_record) => record.uid === _record.uid);
          return record;
        });
        await generateRegistryForUser(userOne.uid, userTwo, room,
            evaluateAverageTime(userOneAverage.time, userTwoAverage.time,
                userOneRecords, userTwoRecords), userOneAverage.time,
            userTwoAverage.time, userOneRecords, userTwoRecords);
        await generateRegistryForUser(userTwo.uid, userOne, room,
            evaluateAverageTime(userTwoAverage.time, userOneAverage.time,
                userTwoRecords, userOneRecords), userTwoAverage.time,
            userOneAverage.time, userTwoRecords, userOneRecords);
        await updateUserAverage(userOne.uid, room.roomType);
        await updateUserAverage(userTwo.uid, room.roomType);
      }
    });

const updateUserAverage = async (userUid: string, roomType: number) => {
  const snapshot = await admin.firestore().collection("registries")
      .where("userUid", "==", userUid).where("roomType", "==", roomType).get();
  const averageSum = snapshot.docs.reduce(
      (previous, document) => document.data().average + previous, 0);
  const newAverage = averageSum / snapshot.docs.length;
  const update: any = {rankedRoomUid: null, unrankedRoomUid: null};
  if (roomType === 1) {
    update["unrankedAverage"] = newAverage;
  } else {
    update["rankedAverage"] = newAverage;
  }
  return admin.firestore().collection("users").doc(userUid).update(update);
};

const evaluateAverageTime = (time: number|null, opponentTime: number|null,
    userOneRecords: any[], userTwoRecords: any[]) => {
  if (time === null) {
    return false;
  } else if (opponentTime === null) {
    return true;
  }
  if (time === opponentTime) {
    for (let i = 0; i < userOneRecords.length; i++) {
      if (userOneRecords[i].time !== userTwoRecords[i].time) {
        return userOneRecords[i].time < userOneRecords[i].time ? true : false;
      }
    }
    return false;
  }
  return time < opponentTime ? true : false;
};

const generateRegistryForUser = (userUid: string, opponentUser: any,
    room: any, won: boolean, average: number | null,
    opponentAverage: number | null, records: any[], opponentRecords: any[]) => {
  return admin.firestore().collection("registries").doc().create({
    opponentUsername: opponentUser.username,
    opponentPhotoUrl: opponentUser.photoUrl,
    roomType: room.roomType,
    roomUid: room.uid,
    userUid, won, average, opponentAverage, records, opponentRecords,
  });
};

const calculateAverage = (records: any[], range?: number) => {
  range = range || records.length;
  const trim = range < 20 ? 1 : Math.trunc(range * 0.05);
  const dnfRecords = records.reduce(
      (prev, currentRecord) => currentRecord.dnf ? ++prev : prev, 0);
  if (dnfRecords <= trim) {
    const filteredRecords = records.filter(
        (record) => !record.dnf).sort((a, b) => a.time - b.time);
    const averageRecords = filteredRecords.slice(
        trim, dnfRecords === trim ? filteredRecords.length : dnfRecords - trim);
    return {time: averageRecords.reduce(
        (prev, record) => prev + record.time, 0) / averageRecords.length,
    averageRecords};
  }
  return {time: null, averageRecords: []};
};
