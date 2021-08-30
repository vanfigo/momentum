import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference, QuerySnapshot } from '@angular/fire/firestore';
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

  getCode = async (): Promise<string> => {
    let uniqueCode: string = null;
    let snapshot: QuerySnapshot<PersonalRoom> = null;
    do {
      uniqueCode = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
      snapshot = await this.collection.ref.where('code', '==', uniqueCode).get()
    } while(!snapshot.empty);
    return uniqueCode;
  }

  create = (personalRoom: PersonalRoom, users: Player[]) => this.collection.doc(personalRoom.code).set({...personalRoom})
    .then(async () => {
      const batch = this.db.firestore.batch();
      const playerCollection = this.collection.doc(personalRoom.code).collection<Player>('players');
      users.forEach(user => batch.set( playerCollection.doc(user.uid).ref, {...user}))
      // add current user as a player
      const userSnapshot = await this.authSvc.getUserFromDB();
      const { photoURL, email, username, uid } = {...userSnapshot.data() as MomentumUser, uid: userSnapshot.id};
      batch.set(playerCollection.doc(uid).ref, {uid, username, email, photoURL, active: true})
      return batch.commit();
    });

  getByCode = (code: string) => this.collection.doc(code).get().toPromise();

  updateCurrentScramble = (code: string, scramble: string) => {
    this.collection.doc(code).collection('solves').add({scramble}).then((document: DocumentReference) => {
      this.collection.doc(code).update({currentPersonalSolveUid: document.id})
    })
  }

  listenToPersonalRoom = (code: string) => this.collection.doc(code).snapshotChanges();

  getCurrentScramble = (code: string, personalSolveUid: string) => this.collection.doc(code)
    .collection('solves').doc(personalSolveUid).get();

  listenToSolves = (code: string, personalSolveUid: string) => this.collection.doc(code)
    .collection('solves').doc(personalSolveUid)
    .collection('records', ref => ref.orderBy("dnf", "asc").orderBy("time", "asc")).valueChanges({idField: 'id'});

  listenToPlayers = (code: string) => this.collection.doc(code)
    .collection('players').snapshotChanges();

  getPlayers = (code: string) => this.collection.doc(code)
    .collection('players').get().toPromise();

  getByPrivate = (isPrivate: boolean) => this.collection.ref.where("isPrivate", "==", isPrivate).orderBy("creation", "asc").get()

  getHistoryByPlayerUid = (code: string, playerUid: string) => this.collection.doc(code)
    .collection('players').doc(playerUid)
    .collection('history').ref.orderBy('creation', 'asc').get();
  
  getHistoryCount = (code: string) => this.collection.doc(code)
    .collection('players').doc(this.authSvc.user.uid)
    .collection('history').get().toPromise();
  
  addRecord = (code: string, personalSolveUid: string, personalRecord: PersonalRecord) => this.collection.doc(code)
    .collection('solves').doc(personalSolveUid)
    .collection('records').add({...personalRecord});

  updateRecord = (code: string, personalSolveUid: string, personalRecordUid: string, record: Record) => this.collection.doc(code)
    .collection('solves').doc(personalSolveUid)
    .collection('records').doc(personalRecordUid).update({...record})

  setActive = (code: string, active: boolean) => this.collection.doc(code)
    .collection('players').doc(this.authSvc.user.uid).update({active})

  addPlayer = (code: string, player: Player) => this.collection.doc(code)
    .collection('players').doc(player.uid).set({...player})

  removePlayer = (code: string) => this.collection.doc(code).collection('players').doc(this.authSvc.user.uid).delete()
  
  addHistory = (code: string, personalRecord: PersonalRecord) => this.collection.doc(code)
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
