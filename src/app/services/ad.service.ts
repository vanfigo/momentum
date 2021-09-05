import { Injectable } from '@angular/core';
import { AdMob, AdOptions, BannerAdOptions, BannerAdPosition, BannerAdSize, InterstitialAdPluginEvents } from '@capacitor-community/admob';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdService {

  bannerOptions: BannerAdOptions = {
    adId: environment.adMob.bannerID,
    adSize: BannerAdSize.FULL_BANNER,
    position: BannerAdPosition.BOTTOM_CENTER,
    margin: 0,
    isTesting: !environment.production
  };

  interstitialOptions: AdOptions = {
    adId: environment.adMob.intersitialID,
    isTesting: !environment.production
  };

  constructor() {
    this.initialize();
  }

  initialize = async () => {
    await AdMob.initialize({
      initializeForTesting: !environment.production
    });
  }

  showBanner = () => {
    AdMob.showBanner(this.bannerOptions);
  }

  removeBanner = () => {
    AdMob.removeBanner();
  }

  showInterstitial = async (after: () => {}) => {
    AdMob.addListener(InterstitialAdPluginEvents.Dismissed, after);
    AdMob.addListener(InterstitialAdPluginEvents.FailedToLoad, after);
    AdMob.addListener(InterstitialAdPluginEvents.FailedToShow, after);
    await AdMob.prepareInterstitial(this.interstitialOptions);
    await AdMob.showInterstitial();
  }
}
