import { Component } from '@angular/core';
import { AuthService } from './services/shared/auth.service';
import { AdService } from './services/shared/ad.service';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  isLoading: boolean = true;
  isAdDisplayed: boolean = false;

  constructor(private authService: AuthService,
              private adSvc: AdService,
              private loadingCtrl: LoadingController,
              // private pushNotificationSvc: PushNotificationService
              ) {
    this.loadingCtrl.create({ message: 'Iniciando...', spinner: 'dots', mode: 'ios' }).then(loading => loading.present());
    this.adSvc.$adLoaded.subscribe((loaded: boolean) => {
      this.isAdDisplayed = loaded;
    })
    this.authService.$userRetrieved.subscribe(async (hasUser: boolean) => {
      if (hasUser) {
        this.adSvc.showBanner();
      } else {
        this.adSvc.removeBanner();
      }
      const loading = await this.loadingCtrl.getTop();
      loading && await loading.dismiss();
      this.isLoading = false;
    });
  }

}
