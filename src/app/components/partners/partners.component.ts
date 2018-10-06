import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { AngularFireStorage } from 'angularfire2/storage';
import { animate, style, transition, trigger } from '@angular/animations';

interface PartnerSection {
    name: string;
    partners: Partner[];
}

interface Partner {
    logo: Observable<string>;
    url: string;
}

@Component({
    selector: 'app-partners',
    templateUrl: './partners.component.html',
    styleUrls: ['./partners.component.scss'],
    animations: [trigger('fadeInOut', [
      transition(':enter', [   // :enter is alias to 'void => *'
        style({ opacity: 0 }),
        animate('200ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [   // :leave is alias to '* => void'
        animate('500ms', style({ opacity: 0 }))
      ])
    ])]
})
export class PartnersComponent implements OnInit {

    partnerSections: PartnerSection[] = [];

    constructor(private firestore: AngularFirestore, private firestorage: AngularFireStorage) { }

    ngOnInit() {
        this.getPartners();
    }

    async getPartners() {
        const partnersSnapshot = await this.firestore.collection('partners').ref.orderBy('position').get();
        await partnersSnapshot.docs.forEach(async (partnerSnapshot) => {
            const partnerName = partnerSnapshot.data().name;
            const logosSnapshot = await this.firestore.collection('partners').doc(partnerSnapshot.id).collection('logos').ref.get();
            const partners: Partner[] = [];
            await logosSnapshot.docs.forEach(async (logoSnapshot) => {
                const partner: Partner = {
                    url: logoSnapshot.data().url,
                    logo: this.firestorage.ref(logoSnapshot.data().logo).getDownloadURL()
                };
                partners.push(partner);
            });
            this.partnerSections.push(
                {
                    name: partnerName,
                    partners: partners
                }
            );
        });
    }

}
