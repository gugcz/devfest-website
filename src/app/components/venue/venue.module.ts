import { NgModule } from "@angular/core";
import { VenueComponent } from "./venue.component";
import { VenueInfoBlockModule } from "../venue-info-block/venue-info-block.module";
import { VenueMapModule } from "../venue-map/venue-map.module";
import { VenuePhotoBlockModule } from "../venue-photo-block/venue-photo-block.module";

@NgModule({
    declarations: [
        VenueComponent
    ],
    exports: [
        VenueComponent
    ],
    imports: [
        VenueInfoBlockModule,
        VenueMapModule,
        VenuePhotoBlockModule
    ]
})
export class VenueModule {
    
}