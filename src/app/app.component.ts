import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { AdService } from './services/ad.service';
import { PushNotificationService } from './services/push-notification.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  loading = true;
  isUser: boolean = false;

  constructor(private authService: AuthService,
              private adSvc: AdService,
              private pushNotificationSvc: PushNotificationService) {
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
