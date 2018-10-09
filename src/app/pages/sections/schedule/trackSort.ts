import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'trackSort'
})
export class TrackSort implements PipeTransform {
  transform(array: any[]): any[] {
    array.sort((a, b) => {
      if (a.startRow === b.startRow) {
        if (a.hall && b.hall) {
          return a.hall.order < b.hall.order ? -1 : 1;
        }
        return 0;
      } else {
        return a.startRow < b.startRow ? -1 : 1;
      }
    });
    return array;
  }
}
