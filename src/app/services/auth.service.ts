import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import firebase from 'firebase/app';
import { NavController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user: firebase.User;
  $userRetrieved = new ReplaySubject<boolean>(1);

  constructor(private afAuth: AngularFireAuth,
              private router: Router,
              private route: ActivatedRoute,
              private navController: NavController,
              private db: AngularFirestore
              ) {
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

  listenCurrentUserChanges = () => this.db.collection('users').doc(this.user.uid).snapshotChanges();
}
