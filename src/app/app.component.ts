import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AuthService } from './services/shared/auth.service';
import { AdService } from './services/shared/ad.service';
import { PushNotificationService } from './services/shared/push-notification.service';
import { LoadingController, ViewDidEnter } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  loading = true;
  isUser: boolean = true;

  constructor(private authService: AuthService,
              private adSvc: AdService
              // private pushNotificationSvc: PushNotificationService
              ) {
    this.authService.$userRetrieved.subscribe((isUser: boolean) => {
      if (isUser) {
        this.adSvc.showBanner();
      } else {
        this.adSvc.removeBanner();
      }
      this.isUser = isUser;
      this.loading = false;
    });
  }
}
