import { Component, OnInit } from '@angular/core';
import { QueryDocumentSnapshot, QuerySnapshot } from '@angular/fire/firestore';
import {  Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { RegistryDetailComponent } from 'src/app/components/shared/registry-detail/registry-detail.component';
import { Registry } from 'src/app/models/registry.class';
import { RoomType } from 'src/app/models/room-type.enum';
import { AuthService } from 'src/app/services/auth.service';
import { RegistryService } from 'src/app/services/registry.service';

@Component({
  selector: 'app-registry',
  templateUrl: './registry.page.html',
  styleUrls: ['./registry.page.scss'],
})
export class RegistryPage implements OnInit {

  roomType: RoomType;
  loading: boolean = true;
  registries: Registry[] = [];
  lastRegistry: QueryDocumentSnapshot<Registry>;

  constructor(private router: Router,
              private authSvc: AuthService,
              private registrySvc: RegistryService,
              private modalCtrl: ModalController) {
    this.roomType = router.getCurrentNavigation().extras.state?.roomType;
  }

  ngOnInit() {
    this.loadRegistries();
  }

  showDetail = (registry: Registry) => {
    this.modalCtrl.create({
      component: RegistryDetailComponent,
      componentProps: { registry }
    }).then(modal => modal.present());
  }

  loadRegistries = (event?: any) => {
    this.registrySvc.getPagedRegistriesByUserAndRoomType(this.authSvc.user.uid, this.roomType, this.lastRegistry).then((snapshot: QuerySnapshot<Registry>) => {
      const newRegistries = snapshot.docs.map(doc => { return {...doc.data(), uid: doc.id} });
      this.registries = this.registries.concat(newRegistries)
      this.lastRegistry = snapshot.docs[snapshot.docs.length - 1];
      this.loading = false;
      if (event) {
        event.target.complete();
        if (newRegistries.length === 0) {
          event.target.disabled = true;
        }
      }
    });
  }

}
