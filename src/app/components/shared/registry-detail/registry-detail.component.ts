import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Registry } from 'src/app/models/registry.class';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-registry-detail',
  templateUrl: './registry-detail.component.html',
  styleUrls: ['./registry-detail.component.scss'],
})
export class RegistryDetailComponent implements OnInit {

  @Input() registry: Registry;

  constructor(public modalCtrl: ModalController,
              private authSvc: AuthService) {
  }

  ngOnInit() { }

  getColor = (index: number) => {
    if (index < this.registry.records.length && index < this.registry.opponentRecords.length) {
      const record = this.registry.records[index];
      const opponentRecord = this.registry.opponentRecords[index];
      if (record.dnf) {
        if (opponentRecord.dnf) {
          return 'warning';
        }
        return 'danger';
      } else if (opponentRecord.dnf) {
        return 'success';
      }
      return record.time === opponentRecord.time ? 'warning' : record.time < opponentRecord.time ? 'success' : 'danger'
    }
    return '';
  }

}
