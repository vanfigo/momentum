import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { AdService } from './services/ad.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  loading = true;

  constructor(private authService: AuthService,
              private adSvc: AdService) {
    this.authService.$userRetrieved.subscribe(() => {
      this.adSvc.showBanner();
      this.loading = false;
    });
  }
}
