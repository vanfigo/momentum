import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from '@angular/fire/firestore';
import { Average } from '../models/average.class';
import { MomentumUser } from '../models/momentum-user.class';
import { PersonalRecord } from '../models/personal-record.class';
import { PersonalRoom } from '../models/personal-room.class';
import { Player } from '../models/player.class';
import { Record } from '../models/record.class';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PersonalRoomService {

  collection: AngularFirestoreCollection<PersonalRoom>;

  constructor(private db: AngularFirestore,
              private authSvc: AuthService) {
    this.collection = db.collection('personal-rooms');
  }

  create = (personalRoom: PersonalRoom, users: Player[]) =>
    this.collection.add({...personalRoom}).then(async (document: DocumentReference<PersonalRoom>) => {
      const roomUid = document.id;
      if (users.length > 0) {
        const batch = this.db.firestore.batch();
        const playerCollection = this.collection.doc(roomUid).collection<Player>('players');
        users.forEach(user => batch.set( playerCollection.doc(user.uid).ref, {...user}))
        // add current user as a player
        const userSnapshot = await this.authSvc.getUserFromDB();
        const { photoURL, email, username, uid } = {...userSnapshot.data() as MomentumUser, uid: userSnapshot.id};
        batch.set(playerCollection.doc(uid).ref, {uid, username, email, photoURL, active: true})
        await batch.commit();
      }
      return roomUid;
    });

  getByUid = (uid: string) => this.collection.doc(uid).get().toPromise();

  updateCurrentScramble = (uid: string, scramble: string) => {
    this.collection.doc(uid).collection('solves').add({scramble}).then((document: DocumentReference) => {
      this.collection.doc(uid).update({currentPersonalSolveUid: document.id})
    })
  }

  listenToPersonalRoom = (uid: string) => this.collection.doc(uid).snapshotChanges();

  getCurrentScramble = (uid: string, personalSolveUid: string) => this.collection.doc(uid)
    .collection('solves').doc(personalSolveUid).get();

  listenToSolves = (uid: string, personalSolveUid: string) => this.collection.doc(uid)
    .collection('solves').doc(personalSolveUid)
    .collection('records', ref => ref.orderBy("dnf", "asc").orderBy("time", "asc")).valueChanges({idField: 'id'});

  listenToPlayers = (uid: string) => this.collection.doc(uid)
    .collection('players').snapshotChanges();

  getPlayers = (uid: string) => this.collection.doc(uid)
    .collection('players').get().toPromise();

  getByPrivate = (isPrivate: boolean) => this.collection.ref.where("isPrivate", "==", isPrivate).orderBy("creation", "asc").get()

  getHistoryByPlayerUid = (uid: string, playerUid: string) => this.collection.doc(uid)
    .collection('players').doc(playerUid)
    .collection('history').ref.orderBy('creation', 'asc').get();
  
  getHistoryCount = (uid: string) => this.collection.doc(uid)
    .collection('players').doc(this.authSvc.user.uid)
    .collection('history').get().toPromise();
  
  addRecord = (uid: string, personalSolveUid: string, personalRecord: PersonalRecord) => this.collection.doc(uid)
    .collection('solves').doc(personalSolveUid)
    .collection('records').add({...personalRecord});

  updateRecord = (uid: string, personalSolveUid: string, personalRecordUid: string, record: Record) => this.collection.doc(uid)
    .collection('solves').doc(personalSolveUid)
    .collection('records').doc(personalRecordUid).update({...record})

  setActive = (uid: string, active: boolean) => this.collection.doc(uid)
    .collection('players').doc(this.authSvc.user.uid).update({active})

  addPlayer = (uid: string, player: Player) => this.collection.doc(uid)
    .collection('players').doc(player.uid).set({...player})
  
  addHistory = (uid: string, personalRecord: PersonalRecord) => this.collection.doc(uid)
    .collection('players').doc(this.authSvc.user.uid)
    .collection('history').add({...personalRecord});

  getAverageOf = (range: number, records: PersonalRecord[]): Average => {
    let recordsLength = records.length;
    if (recordsLength >= range) {
      // Calculates current average of (range)
      let currentRecords = JSON.parse(JSON.stringify(records.slice())).slice(0, range);
      let { time, averageRecords } = this.calculateAverage(currentRecords, range);
      if (time !== null) {
        currentRecords = currentRecords.map(record => {
          record.partOfAverage = !!averageRecords.find((_record) => record.uid === _record.uid);
          return record;
        });
      } else {
        currentRecords = currentRecords.map(record => {
          record.dnf ? record.partOfAverage = false : record.partOfAverage = true;
          return record;
        });
      }
      let bestTime: number = null;
      let bestRecords: Record[];
      let index = 0;
      // Calculates best average of (range)
      while (index + range <= recordsLength) {
        let newBestRecords = JSON.parse(JSON.stringify(records.slice())).slice(index, index + range);
        let { time, averageRecords } = this.calculateAverage(newBestRecords, range);
        if (time !== null) {
          if (bestTime === null) {
            bestTime = time;
            bestRecords = newBestRecords.map(record => {
              record.partOfAverage = !!averageRecords.find((_record) => record.uid === _record.uid);
              return record;
            });
          } else if (time < bestTime) {
            bestTime = time;
            bestRecords = newBestRecords.map(record => {
              record.partOfAverage = !!averageRecords.find((_record) => record.uid === _record.uid);
              return record;
            });
          }
        }  else if (bestTime === null) {
          bestRecords = newBestRecords.map(record => {
            record.dnf ? record.partOfAverage = false : record.partOfAverage = true;
            return record;
          });
        }
        index++;
      }
      return { range, currentTime: time, currentRecords, bestTime, bestRecords, currentDNF: time === null, bestDNF: bestTime === null };
    };
    return new Average(range);
  }

  calculateAverage = (records: Record[], range?: number): {time: number, averageRecords: Record[]} => {
    range = range || records.length;
    let trim = range < 20 ? 1 : Math.trunc(range * 0.05);
    let dnfRecords = records.reduce((prev, currentRecord) => currentRecord.dnf ? ++prev : prev, 0);
    if (dnfRecords <= trim) {
      let filteredRecords = records.filter(record => !record.dnf).sort((a, b) => a.time - b.time);
      let averageRecords = filteredRecords.slice(trim, dnfRecords === trim ? filteredRecords.length : dnfRecords - trim);
      return {time: averageRecords.reduce((prev, record) => prev + record.time, 0) / averageRecords.length, averageRecords};
    }
    return {time: null, averageRecords: []};
  }

}
