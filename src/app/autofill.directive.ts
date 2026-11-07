import { Directive, ElementRef, OnInit, inject } from "@angular/core";
import { Capacitor } from "@capacitor/core";

/**
 * From {@link https://gist.github.com/dtarnawsky/fc92869c1c67b9c74c66de8af3e081b2}
 * via {@link https://capacitorjs.com/docs/guides/autofill-credentials#code-your-app}
 */
@Directive({
  selector: "[appAutofill]",
})
export class AutofillDirective implements OnInit {
  private el = inject(ElementRef);

  ngOnInit(): void {
    if (Capacitor.getPlatform() !== "ios") {
      return;
    }
    setTimeout(() => {
      try {
        this.el.nativeElement.children[0].addEventListener(
          "change",
          (e: any) => {
            this.el.nativeElement.value = (e.target as any).value;
          }
        );
      } catch {}
    }, 100); // Need some time for the ion-input to create the input element
  }
}
