import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Average } from 'src/app/models/average.class';
import { Record } from 'src/app/models/record.class';
import { HistoryComponent } from '../history/history.component';

@Component({
  selector: 'app-average-chip',
  templateUrl: './average-chip.component.html',
  styleUrls: ['./average-chip.component.scss'],
})
export class AverageChipComponent implements OnInit {

  @Input() average: Average;
  @Input() best: boolean = false;
  @Input() canEdit: boolean = true;
  @Input() canDelete: boolean = true;
  @Output() recordUpdated: EventEmitter<Record> = new EventEmitter();
  @Output() recordDeleted: EventEmitter<Record> = new EventEmitter();

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}

  showAverage = () => {
    if ((this.best && this.average.bestTime) || (!this.best && this.average.currentTime)) {
      this.modalCtrl.create({
        component: HistoryComponent,
        componentProps: {
          average: this.average,
          best: this.best,
          canEdit: this.canEdit,
          canDelete: this.canDelete
        }
      }).then(modal => {
        modal.present();
        modal.onDidDismiss().then(props => {
          if (props.data !== undefined) {
            let { record, deleted } = props.data;
            deleted ? this.recordDeleted.emit(record) : this.recordUpdated.emit(record);
          }
        });
      });
    }
  }

}
