import {Component, OnInit} from '@angular/core';
import {AngularFirestore} from 'angularfire2/firestore';
import {Observable} from 'rxjs';
import {AngularFireStorage} from 'angularfire2/storage';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {Logo} from '../../dto/partners/logo';
import {Partner} from '../../dto/partners/partner';

interface PartnerView extends Partner {
  logos: LogoView[];
}

interface LogoView extends Logo {
  id: string;
  downloadUrl: Observable<any>;
}

@Component({
  selector: 'app-partners',
  templateUrl: './partners.component.html',
  styleUrls: ['./partners.component.scss'],
  animations: [trigger('fadeInOut', [
    transition('* => *', [   // :enter is alias to 'void => *'
      style({opacity: 0}),
      animate('200ms', style({opacity: 1}))
    ]),
    transition(':leave', [   // :leave is alias to '* => void'
      animate('500ms', style({opacity: 0}))
    ])
  ]), trigger('fadeImage', [
    state('false', style({opacity: 0})),
    state('true', style({opacity: 1})),
    transition('false <=> true', animate(1000))
  ])]
})
export class PartnersComponent implements OnInit {

  partners: Promise<PartnerView>[];
  visiblePhotos: string[] = [];

  constructor(private firestore: AngularFirestore, private firestorage: AngularFireStorage) {
  }

  ngOnInit() {
    this.getPartners();
  }

  async getPartners() {
    const partnersSnapshot = await this.firestore.collection('partners').ref.orderBy('position').get();
    this.partners = partnersSnapshot.docs.map(async (one) => {
      const logosSnapshot = await this.firestore.collection('partners').doc(one.id).collection('logos').ref.get();
      return {
        name: one.data().name,
        position: one.data().position,
        logos: logosSnapshot.docs.map((logo) => {
          return {
            url: logo.data().url,
            name: logo.data().name,
            logo: logo.data().logo,
            downloadUrl: this.firestorage.ref(logo.data().logo).getDownloadURL(),
            id: logo.id,
          };
        })
      };
    });
  }

  setVisibilityOfLogo(id: string) {
    this.visiblePhotos.push(id);
  }

}
