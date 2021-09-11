import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentChangeAction } from '@angular/fire/firestore';
import { Record } from '../../models/record.class';
import { OnlineRoom } from '../../models/online-room.class';
import { AuthService } from '../shared/auth.service';
import { map } from 'rxjs/operators'
import { RoomStatus } from '../../models/room-status.enum';
import { RoomType } from '../../models/room-type.enum';

@Injectable({
  providedIn: 'root'
})
export class OnlineRoomService {

  collection: AngularFirestoreCollection<OnlineRoom>;

  constructor(private db: AngularFirestore,
              private authSvc: AuthService) {
    this.collection = db.collection("online-rooms");
  }

  geByUid = (uid: string) => this.collection.doc(uid).get().pipe(map((snapshot) => { return {...snapshot.data(), uid: snapshot.id} }));

  addRecord  = (uid: string, record: Record)  => this.collection.doc(uid).collection(this.authSvc.user.uid).add({...record});

  updateRecord = (uid: string, record: Record) => this.collection.doc(uid).collection(this.authSvc.user.uid).doc(record.uid).update({...record});
  
  listenSolvesForOpponentPlayer = (uid: string, playerUid: string) =>
    this.collection.doc(uid).collection(playerUid, ref => ref.orderBy("creation", "asc")).snapshotChanges().pipe(map((changeActions: DocumentChangeAction<Record>[]) =>
      changeActions.map((changeAction: DocumentChangeAction<Record>): Record => changeAction.payload.doc.data())));

  completeRoom = (uid: string) => this.collection.doc(uid).update({status: RoomStatus.COMPLETED});

  countRoomsActiveByRoomType = (roomType: RoomType) => this.db.collection("online-rooms", ref => ref.where("status", "==", RoomStatus.STARTED).where("roomType", "==", roomType)).snapshotChanges();

}
