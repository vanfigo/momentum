import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Average } from 'src/app/models/average.class';
import { HistoryComponent } from '../history/history.component';

@Component({
  selector: 'app-average-chip',
  templateUrl: './average-chip.component.html',
  styleUrls: ['./average-chip.component.scss'],
})
export class AverageChipComponent implements OnInit {

  @Input() average: Average;
  @Input() best: boolean = false;

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}

  showAverage = () => {
    this.modalCtrl.create({
      component: HistoryComponent,
      componentProps: {
        average: this.average,
        best: this.best
      }
    }).then(modal => {
      modal.present();
    });
  }

}
