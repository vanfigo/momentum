import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from './header/header.component';
import { RecordChipComponent } from './record-chip/record-chip.component';
import { AverageChipComponent } from './average-chip/average-chip.component';
import { HistoryComponent } from './history/history.component';
import { ScramblerComponent } from './scrambler/scrambler.component';
import { TimerComponent } from './timer/timer.component';
import { AverageDisplayPipe } from '../../pipes/average-display.pipe';
import { RecordDisplayPipe } from '../../pipes/record-display.pipe';
import { PipesModule } from '../../pipes/pipes.module';
import { FormsModule } from '@angular/forms';
import { RegistryDetailComponent } from './registry-detail/registry-detail.component';
import { AvatarComponent } from './avatar/avatar.component';
import { MyFriendsComponent } from './my-friends/my-friends.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    PipesModule
  ],
  declarations: [
    HeaderComponent,
    TimerComponent,
    HistoryComponent,
    ScramblerComponent,
    RecordChipComponent,
    AverageChipComponent,
    RegistryDetailComponent,
    AvatarComponent,
    MyFriendsComponent
  ],
  exports: [
    HeaderComponent,
    TimerComponent,
    ScramblerComponent,
    RecordChipComponent,
    AverageChipComponent,
    RegistryDetailComponent,
    AvatarComponent,
    MyFriendsComponent
  ],
  providers: [RecordDisplayPipe, AverageDisplayPipe, DatePipe]
})
export class SharedModule { }
