import { Injectable } from '@angular/core';
import { AdMob, AdOptions, BannerAdOptions, BannerAdPluginEvents, BannerAdPosition, BannerAdSize, InterstitialAdPluginEvents } from '@capacitor-community/admob';
import { Platform } from '@ionic/angular';
import { ReplaySubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdService {

  $adLoaded: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

  bannerOptions: BannerAdOptions = {
    adId: environment.adMob.bannerID,
    adSize: BannerAdSize.FULL_BANNER,
    position: BannerAdPosition.BOTTOM_CENTER,
    margin: 0,
    // isTesting: environment.production
  };

  interstitialOptions: AdOptions = {
    adId: environment.adMob.intersitialID,
    // isTesting: environment.production
  };

  constructor(private platform: Platform) {
    AdMob.initialize({
      // initializeForTesting: environment.production
    });
  }

  showBanner = async () => {
    AdMob.addListener(BannerAdPluginEvents.FailedToLoad, () => this.$adLoaded.next(false));
    AdMob.addListener(BannerAdPluginEvents.Loaded, () => this.$adLoaded.next(true));
    AdMob.showBanner(this.bannerOptions);
  }

  removeBanner = () => {
    AdMob.removeBanner();
    this.$adLoaded.next(false);
  }

  showInterstitial = async (after: () => {}) => {
    AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
      alert('Dismissed');
      after();
    });
    AdMob.addListener(InterstitialAdPluginEvents.FailedToLoad, () => {
      alert('FailedToLoad');
      after();
    });
    AdMob.addListener(InterstitialAdPluginEvents.FailedToShow, () => {
      alert('FailedToShow');
      after();
    });
    if (this.platform.is("capacitor")) {
      await AdMob.prepareInterstitial(this.interstitialOptions);
      await AdMob.showInterstitial();
    } else {
      after();
    }
  }
}
