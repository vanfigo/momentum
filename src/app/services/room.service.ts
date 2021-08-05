import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentChangeAction } from '@angular/fire/firestore';
import { Record } from '../models/record.class';
import { Room } from '../models/room.class';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators'
import { RoomStatus } from '../models/romm-status.enum';

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  collection: AngularFirestoreCollection<Room>;

  constructor(private db: AngularFirestore,
              private authSvc: AuthService) {
    this.collection = db.collection('rooms');
  }

  geByUid = (uid: string) => this.collection.doc(uid).get().pipe(map((snapshot) => { return {...snapshot.data(), uid: snapshot.id} }));

  addRecord  = (uid: string, record: Record)  => this.collection.doc(uid).collection(this.authSvc.user.uid).add({...record});

  updateRecord = (uid: string, record: Record) => this.collection.doc(uid).collection(this.authSvc.user.uid).doc(record.uid).update({...record});
  
  listenSolvesForOpponentPlayer = (uid: string, playerUid: string) =>
    this.collection.doc(uid).collection(playerUid, ref => ref.orderBy("creation", "asc")).snapshotChanges().pipe(map((changeActions: DocumentChangeAction<Record>[]) =>
      changeActions.map((changeAction: DocumentChangeAction<Record>): Record => changeAction.payload.doc.data())));

  completeRoom = (uid: string) => this.collection.doc(uid).update({status: RoomStatus.COMPLETED});

}
