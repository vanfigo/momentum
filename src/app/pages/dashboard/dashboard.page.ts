import { Component, OnInit } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  constructor(private fireFunctions: AngularFireFunctions) { }

  callFunction = () => {
    this.fireFunctions.httpsCallable('endGame')({uid: "Y1nDji0cV6TNoZgZnk1X"}).subscribe();

  }

  ngOnInit() {
  }

}
