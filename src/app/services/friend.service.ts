import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { FriendStatus } from '../models/friend-status.enum';
import { Friend } from '../models/friend.class';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class FriendService {

  collection: AngularFirestoreCollection<Friend>;

  constructor(private db: AngularFirestore,
              private authSvc: AuthService) {
    this.collection = db.collection('friends');
  }

  getAllFriends = (status?: FriendStatus) => {
    let friendRef =  this.collection.ref.where('userUid', '==', this.authSvc.user.uid);
    if (status) {
      friendRef = friendRef.where('status', '!=', status);
    }
    return friendRef.get();
  };
  
  sendFriendRequest = (user: Friend) => this.collection.ref.where('userUid', '==', user.friendUid).where('friendUid', '==', this.authSvc.user.uid).where('status', '!=', FriendStatus.ACCEPTED).get()
    .then(async (snapshot) => {
      if (snapshot.empty) {
        await this.collection.add({...user, userUid: this.authSvc.user.uid, creation: new Date().getTime(), status: FriendStatus.PENDING});
        return FriendStatus.PENDING;
      }
      const doc = snapshot.docs.pop();
      if (doc.data().status === FriendStatus.PENDING) {
        await doc.ref.update({status: FriendStatus.ACCEPTED});
        await this.collection.add({...user, userUid: this.authSvc.user.uid, creation: new Date().getTime(), status: FriendStatus.ACCEPTED});
        return FriendStatus.ACCEPTED;
      }
      return FriendStatus.BLOCKED;
    })
  

  sendBlockRequest = (user: Friend) =>
    this.collection.ref.where('userUid', '==', user.friendUid).where('friendUid', '==', this.authSvc.user.uid).where('status', '==', FriendStatus.PENDING).get()
      .then(async (snapshot) => {
        if (!snapshot.empty) {
          await snapshot.docs.pop().ref.delete();
        }
        return this.collection.add({...user, userUid: this.authSvc.user.uid, creation: new Date().getTime(), status: FriendStatus.BLOCKED});
      });
  

  sendUnblockRequest = (user: Friend) =>
    this.collection.ref.where('userUid', '==', this.authSvc.user.uid).where('friendUid', '==', user.friendUid).where('status', '==', FriendStatus.BLOCKED).get()
      .then((snapshot) => {
        const batch = this.db.firestore.batch();
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        return batch.commit();
      });

  deleteFriendRequest = async (user: Friend) => {
    await this.collection.ref.where('userUid', '==', this.authSvc.user.uid).where('friendUid', '==', user.friendUid).where('status', '!=', FriendStatus.BLOCKED).get()
      .then((snapshot) => {
        const batch = this.db.firestore.batch();
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        batch.commit();
      });
    return this.collection.ref.where('userUid', '==', user.friendUid).where('friendUid', '==', this.authSvc.user.uid).where('status', '!=', FriendStatus.BLOCKED).get()
    .then((snapshot) => {
      const batch = this.db.firestore.batch();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      return batch.commit();
    });
  }

}
