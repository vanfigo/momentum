import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference } from '@angular/fire/firestore';
import { Friend } from '../models/friend.class';
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

  listenToPlayers = (uid: string) => this.collection.doc(uid).collection('players').snapshotChanges();

  collection: AngularFirestoreCollection<PersonalRoom>;

  constructor(private db: AngularFirestore,
              private authSvc: AuthService) {
    this.collection = db.collection('personal-rooms');
  }

  listenToPersonalRoom = (uid: string) => this.collection.doc(uid).snapshotChanges();

  create = (personalRoom: PersonalRoom, users: Player[]) =>
    this.collection.add({...personalRoom}).then(async (document: DocumentReference<PersonalRoom>) => {
      const roomUid = document.id;
      if (users.length > 0) {
        const batch = this.db.firestore.batch();
        const userCollection = this.collection.doc(roomUid).collection<Player>('players');
        users.forEach(user => batch.set( userCollection.doc(user.uid).ref, {...user}))
        const userSnapshot = await this.authSvc.getUserFromDB();
        const { photoURL, email, username, uid } = {...userSnapshot.data() as MomentumUser, uid: userSnapshot.id};
        batch.set(userCollection.doc(uid).ref, {uid, username, email, photoURL, active: true})
        await batch.commit();
      }
      return roomUid;
    });

  updateCurrentScramble = (uid: string, scramble: string) => {
    this.collection.doc(uid).collection('solves').add({scramble}).then((document: DocumentReference) => {
      this.collection.doc(uid).update({currentPersonalSolveUid: document.id})
    })
  }

  listenToScramble = (uid: string, personalSolveUid: string) =>
    this.collection.doc(uid).collection('solves').doc(personalSolveUid).valueChanges();

  listenToSolves = (uid: string, personalSolveUid: string) => this.collection.doc(uid)
    .collection('solves').doc(personalSolveUid)
    .collection('records', ref => ref.orderBy("dnf", "asc").orderBy("time", "asc")).valueChanges({idField: 'id'});
  
  addRecord = (uid: string, personalSolveUid: string, personalRecord: PersonalRecord) => this.collection.doc(uid)
    .collection('solves').doc(personalSolveUid)
    .collection('records').add({...personalRecord});

  updateRecord = (uid: string, personalSolveUid: string, personalRecordUid: string, record: Record) => this.collection.doc(uid)
    .collection('solves').doc(personalSolveUid)
    .collection('records').doc(personalRecordUid).update({...record})

  setActive = (uid: string, active: boolean) => this.collection.doc(uid).collection('players').doc(this.authSvc.user.uid).update({active})
  
  addHistory = (uid: string, personalRecord: PersonalRecord) => this.collection.doc(uid)
    .collection('players').doc(this.authSvc.user.uid)
    .collection('history').add({...personalRecord});
}
