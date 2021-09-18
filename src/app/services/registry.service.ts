import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, QueryDocumentSnapshot, QuerySnapshot } from '@angular/fire/firestore';
import { Registry } from '../models/registry.class';
import { RoomType } from '../models/room-type.enum';

@Injectable({
  providedIn: 'root'
})
export class RegistryService {

  collection: AngularFirestoreCollection<Registry>

  constructor(private db: AngularFirestore) {
    this.collection = db.collection('registries');
  }

  listenToRegistry = (roomUid: string, userUid: string) => this.db.collection('registries', ref =>
    ref.where('roomUid', '==', roomUid).where('userUid', '==', userUid)).snapshotChanges();

  getPagedRegistriesByUserAndRoomType = (userUid: string, roomType: RoomType, lastRegistry: QueryDocumentSnapshot<Registry>) => {
    let query = this.collection.ref
      .where('userUid', '==', userUid)
      .where('roomType', '==', roomType)
      .orderBy('creation', 'desc');
    if (lastRegistry) {
      query = query.startAfter(lastRegistry);
    }
    query = query.limit(20);
    return query.get();
  }

}
