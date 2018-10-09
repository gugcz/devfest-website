import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'groupSort'
})
export class GroupSort implements PipeTransform {
  transform(array: any[]): any[] {
    array.sort((a, b) => {
      const hoursA = parseInt(a.time.substring(0, a.time.indexOf(':')), 10);
      const hoursB = parseInt(b.time.substring(0, b.time.indexOf(':')), 10);
      const minutesA = parseInt(a.time.substring(a.time.indexOf(':') + 1), 10);
      const minutesB = parseInt(b.time.substring(b.time.indexOf(':') + 1), 10);
      if (hoursA === hoursB) {
        return minutesA > minutesB ? 1 : -1;
      } else {
        return hoursA > hoursB ? 1 : -1;
      }
    });
    console.log(array.map(group => {
      console.log(group.time);
      console.log(group.talks);
      return {
        time: group.time,
        talks: group.talks.sort((a, b) => {
          console.log(a.name);
          console.log(b.name);
          if (a.hall && b.hall) {
            console.log('a: ' + a.hall.order);
            console.log(a.name);
            console.log('b: ' + b.hall.order);
            console.log(b.name);
            return a.hall.order > b.hall.order ? 1 : -1;
          } else {
            return 0;
          }
        })
      };
    }));
    return array.map(group => {
      return {
        time: group.time,
        talks: group.talks.sort((a, b) => {
          if (a.hall && b.hall) {
            return a.hall.order > b.hall.order ? 1 : -1;
          } else {
            return 0;
          }
        })
      };
    });
  }
}
