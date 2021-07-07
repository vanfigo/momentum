import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user: firebase.User;
  $userRetrieved = new ReplaySubject<boolean>(1);

  constructor(private afAuth: AngularFireAuth,
              private router: Router
              // private storageService: StorageService,
              // private modalController: ModalController,
              // private platform: Platform
              ) {
    afAuth.authState.subscribe(user => {
      this.user = user;
      if (user) {
        if (this.router.url.startsWith('/login')) {
          this.router.navigate(['/home']).then(() => this.$userRetrieved.next(true));
        } else {
          this.$userRetrieved.next(true);
        }
      } else {
        router.navigateByUrl('login').then(() => {
            this.$userRetrieved.next(true);
        });
      }
    });
  }

  emailSignUp = (email: string, password: string) => this.afAuth.createUserWithEmailAndPassword(email, password);

  emailSignIn = (email: string, password: string) => this.afAuth.signInWithEmailAndPassword(email, password);

  signOut = async () => {
    await this.afAuth.signOut();
  }
}
