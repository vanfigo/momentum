import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegistryPageRoutingModule } from './registry-routing.module';

import { RegistryPage } from './registry.page';
import { SharedModule } from 'src/app/components/shared/shared.module';
import { PipesModule } from 'src/app/pipes/pipes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RegistryPageRoutingModule,
    SharedModule,
    PipesModule
  ],
  declarations: [RegistryPage]
})
export class RegistryPageModule {}
