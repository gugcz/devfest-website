import { Social } from "./social";

export interface TeamMember {
    name: string;
    position: string;
    photoPath: string;
    order: number;
    socials?: Social[];
}