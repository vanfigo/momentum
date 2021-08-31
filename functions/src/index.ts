import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {Scrambler} from "./scrambler.class";

admin.initializeApp();

exports.createUser = functions.auth.user().onCreate((userRecord) => {
  return admin.firestore().doc(`/users/${userRecord.uid}`).set({
    uid: userRecord.uid,
    email: userRecord.email,
    username: userRecord.displayName || userRecord.email,
    photoURL: userRecord.photoURL || "",
    rankedGames: 0,
    unrankedGames: 0,
    rankedGamesWon: 0,
    unrankedGamesWon: 0,
    rankedAverage: null,
    unrankedAverage: null,
  });
});

exports.findPlayer = functions.firestore.document("lobbies/{uid}")
    .onCreate((snapshot) => {
      const {roomType, user} = snapshot.data();
      let queryPlayer = admin.firestore().collection("lobbies")
          .orderBy("user.rankedAverage", "asc")
          .orderBy("creation", "asc")
          .where("roomType", "==", roomType);
      // If it is a ranked match and you already have a ranked average
      if (roomType === 2) {
        if (user.rankedAverage) {
          const time = parseInt(functions.config().ranked.time);
          queryPlayer = queryPlayer
              .where("user.rankedAverage", ">=", user.rankedAverage - time)
              .where("user.rankedAverage", "<=", user.rankedAverage + time);
        }
      }
      return queryPlayer.get().then((querySnapshot: any) => {
        const foundUsers = querySnapshot.docs.filter(
            (doc: any) => doc.data().user.uid != user.uid);
        // Opponent found!
        if (foundUsers.length > 0) {
          const opponent = foundUsers.pop();
          const opponentUser = opponent.data().user;
          // Creates a room for the matched players
          admin.firestore().collection("online-rooms").add({
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
            const updateRoomUid = roomType === 2 ? {rankedRoomUid: room.id} :
                {unrankedRoomUid: room.id};
            batch.update(usersCol.doc(user.uid), updateRoomUid);
            batch.update(usersCol.doc(opponentUser.uid), updateRoomUid);
            return batch.commit();
          });
        }
        return null;
      });
    });

exports.roomCompleted = functions.firestore.document("online-rooms/{uid}")
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
        const userOneWon = evaluateAverageTime(userOneAverage.time,
            userTwoAverage.time, userOneRecords, userTwoRecords);
        const userTwoWon = evaluateAverageTime(userTwoAverage.time,
            userOneAverage.time, userTwoRecords, userOneRecords);
        await generateRegistryForUser(userOne, userTwo, room,
            userOneWon, userOneAverage.time,
            userTwoAverage.time, userOneRecords, userTwoRecords);
        await generateRegistryForUser(userTwo, userOne, room,
            userTwoWon, userTwoAverage.time,
            userOneAverage.time, userTwoRecords, userOneRecords);
        await updateUserAverage(userOne.uid, room.roomType, userOneWon);
        await updateUserAverage(userTwo.uid, room.roomType, userTwoWon);
      }
    });

const evaluateAverageTime = (time: number|null, opponentTime: number|null,
    userOneRecords: any[], userTwoRecords: any[]) => {
  if (time === null) {
    return false;
  } else if (opponentTime === null) {
    return true;
  }
  if ((time/10) === (opponentTime/10)) {
    const orderedUserOneRecords = userOneRecords.slice()
        .sort((a, b) => a.time - b.time);
    const orderedUserTwoRecords = userTwoRecords.slice()
        .sort((a, b) => a.time - b.time);
    for (let i = 0; i < orderedUserOneRecords.length; i++) {
      if ((orderedUserOneRecords[i].time/10) !==
          (orderedUserTwoRecords[i].time/10)) {
        return (orderedUserOneRecords[i].time/10) <
            (orderedUserTwoRecords[i].time/10);
      }
    }
    return false;
  }
  return time < opponentTime ? true : false;
};

const updateUserAverage = async (uid: string, roomType: number,
    won: boolean) => {
  const snapshot = await admin.firestore().collection("registries")
      .where("userUid", "==", uid).where("roomType", "==", roomType)
      .orderBy("creation", "asc")
      .limitToLast(parseInt(functions.config().ranked.lastrecords))
      .get();
  const averageSum = snapshot.docs.reduce(
      (previous, document) => document.data().average + previous, 0);
  const newAverage = Math.trunc(averageSum / snapshot.docs.length);
  const update: any = {rankedRoomUid: null, unrankedRoomUid: null};
  const userDoc = await admin.firestore().collection("users").doc(uid).get();
  const user = userDoc.data();
  if (user !== undefined) {
    if (roomType === 1) {
      update["unrankedAverage"] = newAverage;
      update["unrankedGames"] = user.unrankedGames + 1;
      update["unrankedGamesWon"] =
          won ? user.unrankedGamesWon + 1 : user.unrankedGamesWon;
    } else {
      update["rankedAverage"] = newAverage;
      update["rankedGames"] = user.rankedGames + 1;
      update["rankedGamesWon"] =
          won ? user.rankedGamesWon + 1 : user.rankedGamesWon;
    }
  }
  return admin.firestore().collection("users").doc(uid).update(update);
};

const generateRegistryForUser = (user: any, opponentUser: any, room: any,
    won: boolean, average: number | null, opponentAverage: number | null,
    records: any[], opponentRecords: any[]) => {
  return admin.firestore().collection("registries").doc().create({
    opponentUid: opponentUser.uid,
    opponentUsername: opponentUser.username,
    opponentPhotoURL: opponentUser.photoURL,
    roomType: room.roomType,
    roomUid: room.uid,
    creation: new Date().getTime(),
    userUid: user.uid,
    userUsername: user.username,
    userPhotoURL: user.photoURL,
    won, average, opponentAverage, records, opponentRecords,
  });
};

const calculateAverage = (records: any[]) => {
  const range = records.length;
  const trim = range < 20 ? 1 : Math.trunc(range * 0.05);
  const dnfRecords = records.reduce(
      (prev, currentRecord) => currentRecord.dnf ? ++prev : prev, 0);
  if (dnfRecords <= trim) {
    const filteredRecords = records.filter(
        (record) => !record.dnf).sort((a, b) => a.time - b.time);
    const averageRecords = filteredRecords.slice(
        trim, dnfRecords === trim ? filteredRecords.length : dnfRecords - trim);
    return {time: Math.trunc((
      averageRecords.reduce((prev, record) => prev + record.time, 0) /
          averageRecords.length)), averageRecords};
  }
  return {time: null, averageRecords: []};
};
