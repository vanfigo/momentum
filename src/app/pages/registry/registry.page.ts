import { Component, OnInit } from '@angular/core';
import { QueryDocumentSnapshot, QuerySnapshot } from '@angular/fire/firestore';
import {  Router } from '@angular/router';
import { LoadingController, ModalController, ViewDidEnter, ViewWillEnter } from '@ionic/angular';
import { RegistryDetailComponent } from 'src/app/components/shared/registry-detail/registry-detail.component';
import { Registry } from 'src/app/models/registry.class';
import { RoomType } from 'src/app/models/room-type.enum';
import { AuthService } from 'src/app/services/shared/auth.service';
import { RegistryService } from 'src/app/services/registry.service';

@Component({
  selector: 'app-registry',
  templateUrl: './registry.page.html',
  styleUrls: ['./registry.page.scss'],
})
export class RegistryPage implements OnInit {

  roomType: RoomType;
  isLoading: boolean = true;
  registries: Registry[] = [];
  lastRegistry: QueryDocumentSnapshot<Registry>;

  constructor(private loadingCtrl: LoadingController,
              private authSvc: AuthService,
              private registrySvc: RegistryService,
              private modalCtrl: ModalController,
              private router: Router) {
    this.roomType = router.getCurrentNavigation().extras.state?.roomType;
  }

  async ngOnInit() {
    const loading = await this.loadingCtrl.create({ message: 'Cargando...', spinner: 'dots', mode: 'ios' });
    await loading.present();
    this.loadRegistries();
  }

  showDetail = (registry: Registry) => {
    this.modalCtrl.create({
      component: RegistryDetailComponent,
      componentProps: { registry }
    }).then(modal => modal.present());
  }

  loadRegistries = (event?: any) => {
    this.registrySvc.getPagedRegistriesByUserAndRoomType(this.authSvc.user.uid, this.roomType, this.lastRegistry)
      .then(async (snapshot: QuerySnapshot<Registry>) => {
        const newRegistries = snapshot.docs.map(doc => { return {...doc.data(), uid: doc.id} });
        this.registries = this.registries.concat(newRegistries)
        this.lastRegistry = snapshot.docs[snapshot.docs.length - 1];
        const loading = await this.loadingCtrl.getTop();
        loading && await loading.dismiss();
        this.isLoading = false;
        if (event) {
          event.target.complete();
          if (newRegistries.length === 0) {
            event.target.disabled = true;
          }
        }
      });
  }

}
