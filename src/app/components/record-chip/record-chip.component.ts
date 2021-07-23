import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
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

  constructor(private alertCtrl: AlertController,
              private recordDisplayPipe: RecordDisplayPipe,
              private datePipe: DatePipe) {
  }

  ngOnInit() {
    this.color = this.record.partOfAverage ? 'primary' : 'danger';
  }

  showTime = () => {
    this.alertCtrl.create({
      header: this.recordDisplayPipe.transform(this.record),
      subHeader: this.datePipe.transform(this.record.creation, 'medium'),
      message: this.record.scramble,
      buttons: ['Aceptar']
    }).then(alert => alert.present());
  }

}
