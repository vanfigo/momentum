import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { IonSelect } from '@ionic/angular';
import { ScramblerComponent } from 'src/app/components/scrambler/scrambler.component';
import { Room } from 'src/app/models/room.class';
import { Session } from 'src/app/models/session.class';
import { Record } from 'src/app/models/record.class';
import { RoomService } from 'src/app/services/room.service';
@Component({
  selector: 'app-room',
  templateUrl: './room.page.html',
  styleUrls: ['./room.page.scss'],
})
export class RoomPage {

  @ViewChild(ScramblerComponent, {static: false}) scrambler: ScramblerComponent;
  loading: boolean;
  popOverOptions: any = {
    header: 'Selecciona una sesion',
    mode: 'ios'
  };


  constructor(public roomSvc: RoomService) {
    this.loading = true;
    this.roomSvc.$session.subscribe(() => this.loading = false);
  }

  recordObtained = (record: Record) => {
    record.scramble = this.scrambler.scramble;
    this.roomSvc.addTimeToCurrentCategory(record);
    this.scrambler.updateScramble();
  }

  recordDeleted = (record: Record) => {
    if (record !== undefined) {
      this.roomSvc.deleteTimeFromCurrentCategory(record);
    }
  }

}
