import { Component, Input, OnInit } from '@angular/core';
import { QuerySnapshot } from '@angular/fire/firestore';
import { ModalController } from '@ionic/angular';
import { Player } from 'src/app/models/player.class';
import { PersonalRoomService } from 'src/app/services/personal-room.service';

@Component({
  selector: 'app-personal-room-history',
  templateUrl: './personal-room-history.component.html',
  styleUrls: ['./personal-room-history.component.scss'],
})
export class PersonalRoomHistoryComponent implements OnInit {

  @Input() code: string;
  loading: boolean = true;
  players: Player[] = [];

  constructor(public modalCtrl: ModalController,
              private personalRoomSvc: PersonalRoomService) { }

  ngOnInit() {
    this.personalRoomSvc.getPlayers(this.code).then((snapshot: QuerySnapshot<Player>) => {
      this.players = snapshot.docs.map(doc => {
        return {...doc.data(), uid: doc.id}
      });
      this.loading = false;
    })
  }

}
