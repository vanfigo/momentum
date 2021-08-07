import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
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
    ref.where('roomUid', '==', roomUid).where('userUid', '==', userUid)).snapshotChanges()

}
