import { Directive, AfterViewInit, Output, EventEmitter, ElementRef } from '@angular/core';

@Directive({
  selector: '[lazyLoad]'
})
export class LazyDirective implements AfterViewInit {

  @Output() public lazyLoad: EventEmitter<any> = new EventEmitter();

  private _intersectionObserver?: IntersectionObserver;

  constructor(
    private _element: ElementRef
  ) {
  }

  public ngAfterViewInit() {
    this._intersectionObserver = new IntersectionObserver(entries => {
      this.checkForIntersection(entries);
    }, {});
    this._intersectionObserver.observe((this._element.nativeElement) as Element);
  }

  private checkForIntersection = (entries: Array<IntersectionObserverEntry>) => {
    entries.forEach((entry: IntersectionObserverEntry) => {
      if (this.checkIfIntersecting(entry)) {
        this.lazyLoad.emit();
        this._intersectionObserver.unobserve((this._element.nativeElement) as Element);
        this._intersectionObserver.disconnect();
      }
    });
  }

  private checkIfIntersecting(entry: IntersectionObserverEntry) {
    return (entry as any).isIntersecting && entry.target === this._element.nativeElement;
  }


}
