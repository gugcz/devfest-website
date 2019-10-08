import Social from './social';
import { DocumentReference } from '@angular/fire/firestore';

export default interface Speaker {
    name: string;
    companyPosition: string;
    company: string;
    photoPath: string;
    socials: Social[];
    bio: string;
    tag: string;
    language?: string;
    country?: string;
    talkName?: string;
    talkDescription?: string;
    talkRef?: DocumentReference;
    tagColor?: string;
    tagIcon?: string;
}
