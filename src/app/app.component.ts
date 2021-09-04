import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { AdMob, AdMobBannerSize, BannerAdOptions, BannerAdPluginEvents, BannerAdPosition, BannerAdSize } from '@capacitor-community/admob';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  loading = true;

  bannerOptions: BannerAdOptions = {
    adId: 'ca-app-pub-4713371651982959/2478009127',
    adSize: BannerAdSize.BANNER,
    position: BannerAdPosition.BOTTOM_CENTER,
    margin: 56,
    isTesting: environment.production
  };

  constructor(private authService: AuthService) {
    this.authService.$userRetrieved.subscribe(() => this.loading = false);
    AdMob.initialize({
      initializeForTesting: environment.production
    }).then(() => {
      AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
        // Subscribe Banner Event Listener
      });

      AdMob.addListener(BannerAdPluginEvents.SizeChanged, (size: AdMobBannerSize) => {
        // Subscribe Change Banner Size
      });

      AdMob.showBanner(this.bannerOptions);
    });
  }
}
