import { Component, OnInit } from '@angular/core';
import { LoadingController, Platform, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(private authSvc: AuthService,
              private platform: Platform,
              private loadingCtrl: LoadingController,
              private toastCtrl: ToastController) { }

  ngOnInit() {
  }

  googleSignIn = () => {
    this.loadingCtrl.create({
      message: "Ingresando...",
      spinner: "dots"
    }).then(loading => {
      loading.present();
      if (!this.platform.is('capacitor')) {
        this.authSvc.webGoogleSignIn()
        .then(success => {
          loading.dismiss();
          if (!success) {
            this.toastCtrl.create({message: "Ocurrio un error, intenta mas tarde", color: "danger", duration: 3000}).then(toast => toast.present());
          }
        });
      } else {
        this.authSvc.googleSignIn()
        .then(success => {
          loading.dismiss();
          if (!success) {
            this.toastCtrl.create({message: "Ocurrio un error, intenta mas tarde", color: "danger", duration: 3000}).then(toast => toast.present());
          }
        });
      }
    })
  }

  facebookSignIn = () => {
    this.loadingCtrl.create({
      message: "Ingresando...",
      spinner: "dots"
    }).then(loading => {
      loading.present();
      this.authSvc.facebookSignIn()
        .then(success => {
          loading.dismiss();
          if (!success) {
            this.toastCtrl.create({message: "Ocurrio un error, intenta mas tarde", color: "danger", duration: 3000}).then(toast => toast.present());
          }
        });
      });
  }

}
