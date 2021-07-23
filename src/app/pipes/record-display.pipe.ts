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
    let elapsedTime = record.time / 1000;
    let min = Math.trunc(elapsedTime / 60);
    let sec = elapsedTime % 60;
    return `${record.plus ? '+' : ''}${(min > 0 ? min + ':' : '')}${Number(sec).toFixed(2).padStart(5, '0')}s`;
  }

}
