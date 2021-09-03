import { Component, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ScramblerComponent } from 'src/app/components/shared/scrambler/scrambler.component';
import { TrainingRoomSettingsComponent } from 'src/app/components/training-room/training-room-settings/training-room-settings.component';
import { Record } from 'src/app/models/record.class';
import { TrainingRoomService } from 'src/app/services/training-room.service';
@Component({
  selector: 'app-training-room',
  templateUrl: './training-room.page.html',
  styleUrls: ['./training-room.page.scss'],
})
export class TrainingRoomPage {

  @ViewChild(ScramblerComponent, {static: false}) scrambler: ScramblerComponent;
  loading: boolean = true;

  constructor(public trainingRoomSvc: TrainingRoomService,
              private modalCtrl: ModalController) {
    this.trainingRoomSvc.$session.subscribe(() => this.loading = false);
    this.trainingRoomSvc.initTrainingRoom();
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
  
  showTrainingRoomSettings = () => {
    this.modalCtrl.create({
      component: TrainingRoomSettingsComponent
    }).then(modal => {
      modal.present();
    });
  }

}
