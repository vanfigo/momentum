import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, QuerySnapshot } from '@angular/fire/firestore';
import { Lobby } from "../models/lobby.class";
import { MomentumUser } from '../models/momentum-user.class';
import { RoomType } from '../models/room-type.enum';

@Injectable({
  providedIn: 'root'
})
export class LobbyService {

  private colletion: AngularFirestoreCollection<Lobby>;

  constructor(private db: AngularFirestore) {
    this.colletion = this.db.collection('lobbies');
  }

  addPLayer = (user: MomentumUser, roomType: RoomType): Promise<void> =>
    // Remove possibly old records
    this.db.collection('lobbies', ref => ref.where('roomType', '==', roomType).where('user.uid', '==', user.uid)).get().toPromise().then((snapshot: QuerySnapshot<Lobby>) => {
      let batch = this.db.firestore.batch();
      snapshot.docs.forEach(player => batch.delete(player.ref))
      return batch.commit().then(() => this.colletion.doc().set({roomType, user, creation: new Date().getTime()}))
    });

  countLobbiesByRoomType = (roomType: RoomType) => this.db.collection("lobbies", ref => ref.where("roomType", "==", roomType)).snapshotChanges();
}
