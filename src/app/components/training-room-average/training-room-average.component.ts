import { Component, OnDestroy } from '@angular/core';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Average } from 'src/app/models/average.class';
import { Record } from 'src/app/models/record.class';
import { TrainingRoomService } from 'src/app/services/training-room.service';
import { HistoryComponent } from '../history/history.component';

@Component({
  selector: 'app-training-room-average',
  templateUrl: './training-room-average.component.html',
  styleUrls: ['./training-room-average.component.scss'],
})
export class TrainingRoomAverageComponent implements OnDestroy {

  loading = true;
  roomSubscription: Subscription;
  averages: Average[];

  constructor(public trainingRoomSvc: TrainingRoomService,
              private alertCtrl: AlertController,
              private modalCtrl: ModalController,
              private toastCtrl: ToastController) {
    this.roomSubscription = this.trainingRoomSvc.$session.subscribe(() => {
      this.averages = trainingRoomSvc.getAveragesOrderByRange();
      this.loading = false;
    });
  }

  ngOnDestroy() {
    this.roomSubscription.unsubscribe();
  }

  addAverage = () => {
    this.alertCtrl.create({
      header: 'Agrega promedio',
      message: 'Selecciona el promedio que deseas agregar',
      inputs: [{
        name: 'average',
        type: 'number',
        min: 3,
      }],
      buttons: [{
        text: 'Cancelar',
        role: 'cancel'
      }, {
        text: 'Agregar',
        handler: (data) => {
          let { average } = data;
          average = parseInt(average);
          if (average >= 5) {
            this.trainingRoomSvc.addAverage(average);
          } else {
            this.toastCtrl.create({
              message: 'Los promedios deben ser mayores o iguales a 5',
              duration: 4000
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
        records: this.trainingRoomSvc.getRecordsOrderByCreation()
      }
    }).then(modal => {
      modal.present();
      modal.onDidDismiss().then(props => {
        if (props.data !== undefined) {
          let {record, deleted} = props.data;
          if (deleted) {
            this.trainingRoomSvc.deleteRecord(record);
          } else {
            this.trainingRoomSvc.updateRecord(record);
          }
        }
      })
    });
  }

}
