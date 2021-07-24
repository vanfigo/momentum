import { Component, ViewChild } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { ScramblerComponent } from 'src/app/components/scrambler/scrambler.component';
import { Record } from 'src/app/models/record.class';
import { TrainingRoomService } from 'src/app/services/room.service';
@Component({
  selector: 'app-training-room',
  templateUrl: './training-room.page.html',
  styleUrls: ['./training-room.page.scss'],
})
export class TrainingRoomPage {

  @ViewChild(ScramblerComponent, {static: false}) scrambler: ScramblerComponent;
  loading: boolean;
  popOverOptions: any = {
    header: 'Selecciona una sesion',
    mode: 'ios'
  };

  constructor(public trainingRoomSvc: TrainingRoomService,
              private alertCtrl: AlertController) {
    this.loading = true;
    this.trainingRoomSvc.$session.subscribe(() => this.loading = false);
  }

  recordObtained = (record: Record) => {
    record.scramble = this.scrambler.scramble;
    this.trainingRoomSvc.addRecord(record);
    this.scrambler.updateScramble();
  }

  recordDeleted = (record: Record) => {
    if (record !== undefined) {
      this.trainingRoomSvc.deleteRecord(record);
    }
  }

  recordUpdated = (record: Record) => {
    this.trainingRoomSvc.updateRecord(record);
  }

  showAddSession = () => {
    this.alertCtrl.create({
      header: 'Agrega sesion',
      message: 'Selecciona el nombre de tu nueva sesion',
      inputs: [{
        name: 'session',
        type: 'text'
      }],
      buttons: [{
        text: 'Cancelar',
        role: 'cancel'
      }, {
        text: 'Agregar',
        handler: (data) => {
          let { session } = data;
          this.trainingRoomSvc.addSession(session)
        }
      }]
    })
    .then(alert => alert.present());
  }

  sessionSelected = (event: any) => {
    if (event.detail?.value) {
      let { id } = event.detail.value;
      this.trainingRoomSvc.selectSession(id);
    }
  }

}
