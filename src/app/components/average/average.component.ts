import { Component, OnDestroy } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { RoomService } from 'src/app/services/room.service';
import { HistoryComponent } from '../history/history.component';

@Component({
  selector: 'app-average',
  templateUrl: './average.component.html',
  styleUrls: ['./average.component.scss'],
})
export class AverageComponent implements OnDestroy {

  loading = true;
  roomSubscription: Subscription;

  constructor(public roomSvc: RoomService,
              private alertCtrl: AlertController,
              private modalCtrl: ModalController) {
    this.roomSubscription = this.roomSvc.$session.subscribe(() => { this.loading = false; });
  }

  ngOnDestroy() {
    this.roomSubscription.unsubscribe();
  }

  addAverage = () => {
    this.alertCtrl.create({
      header: 'Add average',
      message: 'Selecciona el average que deseas agregar',
      inputs: [{
        name: 'average',
        type: 'number',
        min: 3,
      }],
      buttons: [{
        text: 'Cancelar',
        cssClass: 'secondary'
      }, {
        text: 'Agregar',
        handler: (data) => {
          let { average } = data;
          average = parseInt(average);
          // this.historyService.addAverrageToCurrentSession(average);
        }
      }]
    }).then(alert => {
      alert.present();
    })
  }

  showHistory = () => {
    this.modalCtrl.create({
      component: HistoryComponent
    }).then(modal => {
      modal.present();
    });
  }

}
