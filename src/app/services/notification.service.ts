import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Notification } from '../models/notification.class';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  collection: AngularFirestoreCollection<Notification>

  constructor(private db: AngularFirestore,
              private authSvc: AuthService) {
    this.collection = this.db.collection('notifications');
  }

  getByUserToUid = (uid?: string) => this.collection.ref
    .where('userToUid', '==', uid ? uid : this.authSvc.user.uid)
    .orderBy('creation', 'desc').get();

  read = (uid: string) => this.collection.doc(uid).update({ read: true });
  
  deleteFrom = (userFromUid: string) => this.collection.ref.where('userFromUid', '==', userFromUid).get().then((snapshot) => {
    const batch = this.db.firestore.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    return batch.commit();
  });

  listenToNotifications = () => this.db.collection('notifications', ref => ref
    .where('userToUid', '==', this.authSvc.user.uid)
    .where('read', '==', false)).valueChanges();

}
