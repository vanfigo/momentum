import { Component, Input, OnInit } from '@angular/core';
import { QuerySnapshot } from '@angular/fire/firestore';
import { LoadingController, ModalController } from '@ionic/angular';
import { Player } from 'src/app/models/player.class';
import { PersonalRoomService } from 'src/app/services/playable-rooms/personal-room.service';

@Component({
  selector: 'app-personal-room-history',
  templateUrl: './personal-room-history.component.html',
  styleUrls: ['./personal-room-history.component.scss'],
})
export class PersonalRoomHistoryComponent implements OnInit {

  @Input() code: string;
  isLoading: boolean = true;
  players: Player[] = [];

  constructor(public modalCtrl: ModalController,
              private personalRoomSvc: PersonalRoomService,
              private loadingCtrl: LoadingController) { }

  async ngOnInit() {
    const loading = await this.loadingCtrl.create({ message: 'Cargando...', spinner: 'dots', mode: 'ios' });
    await loading.present();
    this.personalRoomSvc.getPlayers(this.code).then(async (snapshot: QuerySnapshot<Player>) => {
      this.players = snapshot.docs.map(doc => {
        return {...doc.data(), uid: doc.id}
      });
      const loading = await this.loadingCtrl.getTop();
      loading && await loading.dismiss();
      this.isLoading = false;
    })
  }

}
