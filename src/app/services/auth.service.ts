import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { NavController, Platform } from '@ionic/angular';
import { AngularFirestore, AngularFirestoreCollection, QuerySnapshot } from '@angular/fire/firestore';
import { MomentumUser } from '../models/momentum-user.class';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user: MomentumUser;
  $userRetrieved = new ReplaySubject<boolean>(1);
  collection: AngularFirestoreCollection<MomentumUser>;

  constructor(private afAuth: AngularFireAuth,
              private router: Router,
              private route: ActivatedRoute,
              private navController: NavController,
              private db: AngularFirestore,
              private platform: Platform) {
    this.collection = this.db.collection('users');
    afAuth.authState.subscribe(user => {
      if (user) {
        this.getUserFromDB(user.uid).then(snapshot => {
          this.user = {...snapshot.data(), uid: snapshot.id};
          if (this.router.url.startsWith('/login')) {
            this.navController.navigateForward(['/home'], {relativeTo: route}).then(() => this.$userRetrieved.next(true));
          } else {
            this.$userRetrieved.next(true);
          }
        })
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

  getUserFromDB = (uid: string) => this.collection.doc(uid).get().toPromise();

  update = (update: any, reflect: boolean = true) => {
    return this.collection.doc(this.user.uid).update({...update}).then(() => {
      this.user = { ...this.user, ...update };
      reflect && this.db.collection('friends').ref.where('friendUid', '==', this.user.uid).get().then((snapshot: QuerySnapshot<MomentumUser>) => {
        const batch = this.db.firestore.batch();
        snapshot.docs.forEach(doc => batch.update(doc.ref, {...update}));
        return batch.commit();
      })
    })
  }

  findAllButMe = () => this.collection.ref.where('uid', '!=', this.user.uid).get();

  listenCurrentUserChanges = () => this.collection.doc(this.user.uid).snapshotChanges();

  googleSignIn = async () => {
    if (this.platform.is("android") || this.platform.is("ios")) {
      GoogleAuth.init();
      const googleUser = await GoogleAuth.signIn();
      const credential = firebase.auth.GoogleAuthProvider.credential(googleUser.authentication.idToken);
      this.afAuth.signInWithCredential(credential);
    } else {
      const provider = new firebase.auth.GoogleAuthProvider().setCustomParameters({ prompt: 'select_account' });
      return this.afAuth.signInWithPopup(provider).catch(console.error);
    }
  }
}
