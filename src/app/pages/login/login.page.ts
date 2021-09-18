import { Component, OnInit } from '@angular/core';
import { LoadingController, Platform, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/shared/auth.service';

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
    this.loadingCtrl.create({ message: 'Ingresando...', spinner: 'dots', mode: 'ios' }).then(loading => loading.present());
    if (!this.platform.is('capacitor')) {
      this.authSvc.webGoogleSignIn()
      .then(async (success) => {
        if (!success) {
          this.toastCtrl.create({message: "Ocurrio un error, intenta mas tarde", color: "danger", duration: 3000}).then(toast => toast.present());
          const loading = await this.loadingCtrl.getTop();
          loading && await loading.dismiss();
        }
      });
    } else {
      this.authSvc.googleSignIn()
      .then(async (success) => {
        if (!success) {
          this.toastCtrl.create({message: "Ocurrio un error, intenta mas tarde", color: "danger", duration: 3000}).then(toast => toast.present());
          const loading = await this.loadingCtrl.getTop();
          loading && await loading.dismiss();
        }
      });
    }
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
