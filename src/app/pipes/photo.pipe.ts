import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'photo'
})
export class PhotoPipe implements PipeTransform {

  transform(value: string, size?: number, name?: string, type?: string): any {
    size = size || 16;
    type = type || 'cotton';
    name = name || 'stack-of-photos'
    return !!value ? value : `https://img.icons8.com/${type}/${size}/${name}.png`
  }

}
