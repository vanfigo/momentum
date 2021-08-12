import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, QuerySnapshot } from '@angular/fire/firestore';
import { Lobby } from "../models/lobby.class";
import { MomentumUser } from '../models/momentum-user.class';
import { RoomType } from '../models/room-type.enum';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class LobbyService {

  private colletion: AngularFirestoreCollection<Lobby>;

  constructor(private db: AngularFirestore,
              private authSvc: AuthService) {
    this.colletion = this.db.collection('lobbies');
  }

  addPLayer = (user: MomentumUser, roomType: RoomType): Promise<void> =>
    this.removePlayer().then(() => this.colletion.doc().set({roomType, user, creation: new Date().getTime()}))

  removePlayer = () => {
    return this.db.collection('lobbies', ref => ref.where('user.uid', '==', this.authSvc.user.uid)).get().toPromise().then((snapshot: QuerySnapshot<Lobby>) => {
      let batch = this.db.firestore.batch();
      snapshot.docs.forEach(player => batch.delete(player.ref))
      return batch.commit();
    })
  }

  countLobbiesByRoomType = (roomType: RoomType) => this.db.collection("lobbies", ref => ref.where("roomType", "==", roomType)).snapshotChanges();
}
