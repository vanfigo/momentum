import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecordDisplayPipe } from './record-display.pipe';
import { AverageDisplayPipe } from './average-display.pipe';
import { TimeDisplayPipe } from './time-display.pipe';
import { PhotoPipe } from './photo.pipe';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    RecordDisplayPipe,
    AverageDisplayPipe,
    TimeDisplayPipe,
    PhotoPipe
  ],
  exports: [
    RecordDisplayPipe,
    AverageDisplayPipe,
    TimeDisplayPipe,
    PhotoPipe
  ]
})
export class PipesModule { }
