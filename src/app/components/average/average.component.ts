import { Component, OnDestroy } from '@angular/core';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Average } from 'src/app/models/average.class';
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
  averages: Average[];

  constructor(public roomSvc: RoomService,
              private alertCtrl: AlertController,
              private modalCtrl: ModalController,
              private toastCtrl: ToastController) {
    this.roomSubscription = this.roomSvc.$session.subscribe(() => {
      this.averages = roomSvc.getAveragesOrderByRange();
      this.loading = false;
    });
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
          if (average >= 5) {
            this.roomSvc.addAverage(average);
          } else {
            this.toastCtrl.create({
              message: 'Los promedios deben ser mayores o iguales a 5'
            })
            .then(toast => toast.present());
          }
        }
      }]
    }).then(alert => {
      alert.present();
    })
  }

  showHistory = () => {
    this.modalCtrl.create({
      component: HistoryComponent,
      componentProps: {
        records: this.roomSvc.getRecordsOrderByCreation(true)
      }
    }).then(modal => {
      modal.present();
    });
  }

}
