import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Record } from 'src/app/models/record.class';
import { TimeDisplayPipe } from 'src/app/pipes/time-display.pipe';

@Component({
  selector: 'app-time-chip',
  templateUrl: './time-chip.component.html',
  styleUrls: ['./time-chip.component.scss'],
})
export class TimeChipComponent implements OnInit {

  @Input() record: Record;
  @Input() color: string = "primary";

  constructor(private alertCtrl: AlertController,
              private timeDisplayPipe: TimeDisplayPipe,
              private datePipe: DatePipe) { }

  ngOnInit() {}

  showTime = () => {
    this.alertCtrl.create({
      header: this.timeDisplayPipe.transform(this.record),
      subHeader: this.datePipe.transform(this.record.creation, 'medium'),
      message: this.record.scramble,
      buttons: ['Aceptar']
    }).then(alert => alert.present());
  }

}
