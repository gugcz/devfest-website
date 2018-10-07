import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'trackSort'
})
export class TrackSort implements PipeTransform {
  transform(array: any[]): any[] {
    console.log(array);
    array.sort((a, b) => {
      if (a.startRow === b.startRow) {
        return a.hall.order < b.hall.order ? -1 : 1;
      } else {
        return a.startRow < b.startRow ? -1 : 1;
      }
    });
    return array;
  }
}
