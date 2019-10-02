import { NgModule } from "@angular/core";
import { SocialsPipe } from "./pipe/socials.pipe";
import { LazyDirective } from "./directives/lazy.directive";

@NgModule({
  declarations: [SocialsPipe, LazyDirective],
  exports: [SocialsPipe, LazyDirective]
})
export class SharedModule {}
