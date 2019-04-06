import { Social } from './social';

export interface TeamMember {
    name: string;
    position: string;
    photoPath: string;
    photoPathCringe: string;
    order: number;
    socials?: Social[];
}
