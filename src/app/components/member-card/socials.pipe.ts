import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'socials'
})
export class SocialsPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return value.sort((a, b) => {
      if (a.key < b.key) { return -1; }
      if (a.key > b.key) { return 1; }
      return 0;
    });
  }

}
