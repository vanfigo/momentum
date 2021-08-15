import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import firebase from 'firebase/app';
import { NavController } from '@ionic/angular';
import { AngularFirestore, AngularFirestoreCollection, QuerySnapshot } from '@angular/fire/firestore';
import { FriendService } from './friend.service';
import { Friend } from '../models/friend.class';
import { MomentumUser } from '../models/momentum-user.class';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user: firebase.User;
  $userRetrieved = new ReplaySubject<boolean>(1);
  collection: AngularFirestoreCollection<MomentumUser>;

  constructor(private afAuth: AngularFireAuth,
              private router: Router,
              private route: ActivatedRoute,
              private navController: NavController,
              private db: AngularFirestore) {
    this.collection = this.db.collection('users');
    afAuth.authState.subscribe(user => {
      this.user = user;
      if (user) {
        if (this.router.url.startsWith('/login')) {
          this.navController.navigateForward(['/home'], {relativeTo: route}).then(() => this.$userRetrieved.next(true));
        } else {
          this.$userRetrieved.next(true);
        }
      } else {
        this.navController.navigateRoot(['/login'], {relativeTo: route}).then(() => this.$userRetrieved.next(true));
      }
    });
  }

  emailSignUp = (email: string, password: string) => this.afAuth.createUserWithEmailAndPassword(email, password);

  emailSignIn = (email: string, password: string) => this.afAuth.signInWithEmailAndPassword(email, password);

  signOut = async () => {
    await this.afAuth.signOut();
  }

  getUserFromDB = (uid: string = undefined) => this.db.collection('users').doc(uid ? uid : this.user.uid).get().toPromise();

  update = (update: any) => {
    return this.collection.doc(this.user.uid).update({...update}).then(() =>
      this.db.collection('friends').ref.where('friendUid', '==', this.user.uid).get().then((snapshot: QuerySnapshot<MomentumUser>) => {
        const batch = this.db.firestore.batch();
        snapshot.docs.forEach(doc => batch.update(doc.ref, {...update}));
        return batch.commit();
      }))
  }

  findAllButMe = () => this.collection.ref.where('uid', '!=', this.user.uid).get();

  listenCurrentUserChanges = () => this.collection.doc(this.user.uid).snapshotChanges();
}
