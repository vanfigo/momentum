import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Room } from 'src/app/models/room.class';
import { Record } from 'src/app/models/record.class';
import { RoomService } from 'src/app/services/room.service';
import { Session } from 'src/app/models/session.class';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements OnInit {

  loading: boolean;

  constructor(public roomSvc: RoomService,
              public modalCtrl: ModalController) {
    this.loading = true;
    roomSvc.$session.subscribe(() => { this.loading = false });
  }

  ngOnInit() {}

}
