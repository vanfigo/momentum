import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimerComponent  } from './timer/timer.component';
import { IonicModule } from '@ionic/angular';

@NgModule({
    imports: [
      CommonModule,
      IonicModule
    ],
    declarations: [TimerComponent],
    exports: [TimerComponent]
  })
  export class ComponentsModule {}