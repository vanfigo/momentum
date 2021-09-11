import { Component } from '@angular/core';
import { IonTabs } from '@ionic/angular';
import { AuthService } from 'src/app/services/shared/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  private activeTab?: HTMLElement;

  constructor(private authService: AuthService) {}

  signOut = () => this.authService.signOut();
  
  tabChange(tabsRef: IonTabs) {
    this.activeTab = tabsRef.outlet.activatedView.element;
  }
  
  ionViewDidLeave() {
    this.propagateToActiveTab('ionViewDidLeave');
  }
  
  ionViewWillEnter() {
    this.propagateToActiveTab('ionViewWillEnter');
  }
  
  private propagateToActiveTab(eventName: string) {    
    if (this.activeTab) {
      this.activeTab.dispatchEvent(new CustomEvent(eventName));
    }
  }

}
