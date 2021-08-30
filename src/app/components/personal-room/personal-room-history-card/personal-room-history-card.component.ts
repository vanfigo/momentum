import { Component, Input, OnInit } from '@angular/core';
import { QuerySnapshot } from '@angular/fire/firestore';
import { Average } from 'src/app/models/average.class';
import { PersonalRecord } from 'src/app/models/personal-record.class';
import { Player } from 'src/app/models/player.class';
import { PersonalRoomService } from 'src/app/services/personal-room.service';

@Component({
  selector: 'app-personal-room-history-card',
  templateUrl: './personal-room-history-card.component.html',
  styleUrls: ['./personal-room-history-card.component.scss'],
})
export class PersonalRoomHistoryCardComponent implements OnInit {

  @Input() player: Player;
  @Input() code: string;
  loading: boolean = true;
  personalRecords: PersonalRecord[] = [];
  averages: Average[] = [];
  lastRecord: PersonalRecord;
  bestRecord: PersonalRecord;
  averageNumbers: number[] = [5, 12, 50, 100]

  constructor(private personalRoomSvc: PersonalRoomService) { }

  ngOnInit() {
    this.personalRoomSvc.getHistoryByPlayerUid(this.code, this.player.uid).then((snapshot: QuerySnapshot<PersonalRecord>) => {
      this.personalRecords = snapshot.docs.map(doc => { return {...doc.data(), uid: doc.id} })
      this.averageNumbers.forEach(value => this.averages[value] = this.personalRoomSvc.getAverageOf(value, this.personalRecords));
      this.lastRecord = this.personalRecords[this.personalRecords.length - 1]
      this.bestRecord = this.personalRecords.sort((a, b) => a.time - b.time)[0];
      this.loading = false;
    })
  }

}
