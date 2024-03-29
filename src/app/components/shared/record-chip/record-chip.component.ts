import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Record } from 'src/app/models/record.class';
import { RecordDisplayPipe } from 'src/app/pipes/record-display.pipe';

@Component({
  selector: 'app-record-chip',
  templateUrl: './record-chip.component.html',
  styleUrls: ['./record-chip.component.scss'],
})
export class RecordChipComponent implements OnInit {

  @Input() record: Record;
  @Input() color: string = "primary";
  @Input() canEdit: boolean = true;
  @Input() canDelete: boolean = true;
  @Output() recordUpdated: EventEmitter<Record> = new EventEmitter();
  @Output() recordDeleted: EventEmitter<Record> = new EventEmitter();

  constructor(private alertCtrl: AlertController,
              private recordDisplayPipe: RecordDisplayPipe,
              private datePipe: DatePipe) {
  }

  ngOnInit() {
    this.color = this.record ? this.record.partOfAverage ? 'primary' : 'danger' : 'primary';
  }

  showTime = () => {
    if (this.record !== undefined) { 
      const buttons: any[] = [{ text: 'Aceptar', role: 'cancel' }];
      if (this.canDelete) {
        buttons.unshift({
          text: 'Borrar',
          cssClass: 'danger-button',
          handler: this.deleteRecord,
        })
      }
      if (this.canEdit) {
        buttons.unshift({
          text: '+2',
          handler: this.updatePlusRecord
        }, {
          text: 'DNF',
          handler: this.updateDNFRecord
        });
      }
      this.alertCtrl.create({
        header: this.recordDisplayPipe.transform(this.record),
        subHeader: this.datePipe.transform(this.record.creation, 'medium'),
        message: this.record.scramble,
        buttons
      }).then(alert => alert.present());
    }
  }

  deleteRecord = () => {
    this.alertCtrl.create({
      header: 'Borrar tiempo',
      message: `En realidad quieres borrar el tiempo de ${this.recordDisplayPipe.transform(this.record)}`,
      buttons: ['Cancelar', {
        text: 'Borrar',
        handler: () => {
          this.recordDeleted.emit(this.record);
        }
      }]
    }).then(alert => alert.present());
  }

  updatePlusRecord = () => {
    this.record.plus = !this.record.plus;
    this.record.plus ? this.record.time += 2000 : this.record.time -= 2000;
    this.recordUpdated.emit(this.record);
  }

  updateDNFRecord = () => {
    this.record.dnf = !this.record.dnf;
    this.recordUpdated.emit(this.record);
  }

}
