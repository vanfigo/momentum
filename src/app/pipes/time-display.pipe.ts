import { Pipe, PipeTransform } from '@angular/core';
import { Record } from '../models/record.class';

@Pipe({
  name: 'timeDisplay',
  pure: false
})
export class TimeDisplayPipe implements PipeTransform {

  transform(record: Record): string {
    if (record === undefined || record === null) {
      return `${Number(0).toFixed(2).padStart(5,'0')}s`
    }
    if (record.dnf) {
      return `--:--s`;
    }
    let elapsedTime = record.time / 1000;
    let min = Math.trunc(elapsedTime / 60);
    let sec = elapsedTime % 60;
    return `${record.plus ? '+' : ''}${(min > 0 ? min + ':' : '')}${Number(sec).toFixed(2).padStart(5, '0')}s`;
  }

}
