import {Injectable} from '@angular/core';
import {Meta} from '@angular/platform-browser';

@Injectable()
export class MetaChangerService {

  constructor(private meta: Meta) {

  }


  public setSiteName(name: string) {
    this.meta.updateTag({property: 'og:site_name', content: 'DevFest CZ 2018'}, `content='{name}'`);
  }

}
