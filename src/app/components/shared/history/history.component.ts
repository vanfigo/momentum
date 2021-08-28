import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Record } from 'src/app/models/record.class';
import { Average } from 'src/app/models/average.class';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements OnInit {

  loading: boolean;
  @Input() records: Record[];
  @Input() average: Average;
  @Input() best: boolean;
  @Input() canEdit: boolean = true;
  @Input() canDelete: boolean = true;

  constructor(public modalCtrl: ModalController) { }

  ngOnInit() {
    if (this.average) {
      this.records = this.best ? this.average.bestRecords : this.average.currentRecords;
    }
  }

  recordUpdated = (record: Record) => {
    this.modalCtrl.dismiss({ record, deleted: false });
  }

  recordDeleted = (record: Record) => {
    this.modalCtrl.dismiss({ record, deleted: true });
  }

}
