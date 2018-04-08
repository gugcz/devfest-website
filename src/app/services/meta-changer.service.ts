import {Injectable} from '@angular/core';
import {Meta} from '@angular/platform-browser';

@Injectable()
export class MetaChangerService {

  constructor(private meta: Meta) {
    this.setDefault();
  }

  public setDefault() {
    this.meta.addTags([
      {itemprop: 'name', content: 'Devfest CZ 2018'},
      {itemprop: 'description', content: 'The largest (not only) Google tech festival in Central Europe!'},
      {itemprop: 'image', content: 'https://2018.devfest.cz/assets/share-logo.png'},
      {property: 'og:title', content: 'DevFest CZ 2018'},
      {property: 'og:site_name', content: 'DevFest CZ 2018'},
      {property: 'og:type', content: 'website'},
      {property: 'og:url', content: 'https://2018.devfest.cz'},
      {property: 'og:description', content: 'The largest (not only) Google tech festival in Central Europe!'},
      {property: 'og:type', content: 'Event'},
      {property: 'og:image', content: 'https://2018.devfest.cz/assets/share-logo.png'},
      {property: 'og:image:type', content: 'image/png'},
      {name: 'twitter:card', content: 'summary_large_image'},
      {name: 'twitter:creator', content: '@DevFest_CZ'},
      {name: 'twitter:title', content: 'DevFest CZ 2018'},
      {name: 'twitter:description', content: 'The largest (not only) Google tech festival in Central Europe!'},
      {name: 'twitter:image', content: 'https://2018.devfest.cz/assets/share-logo.png'},
    ]);
  }

  public setSiteName(name: string) {
    this.meta.updateTag({property: 'og:site_name', content: 'DevFest CZ 2018'}, `content='{name}'`);
  }

}
