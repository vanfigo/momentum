import { Pipe, PipeTransform } from '@angular/core';
import { Record } from '../models/record.class';

@Pipe({
  name: 'recordDisplay',
  pure: false
})
export class RecordDisplayPipe implements PipeTransform {

  transform(record: Record): string {
    if (record === undefined || record === null) {
      return '--:--';
    }
    if (record.dnf) {
      return 'DNF';
    }
    const elapsedTime = record.time / 1000;
    const min = Math.trunc(elapsedTime / 60);
    const sec = Math.trunc(elapsedTime % 60);
    const mil = Math.trunc(record.time % 1000 / 10);
    
    
    return `${record.plus ? '+' : ''}${(min > 0 ? min + ':' : '')}${sec.toString().padStart(2, '0')}.${mil.toString().padStart(2, '0')}s`;
  }

}
