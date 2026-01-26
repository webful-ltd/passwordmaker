import { Component, OnInit, ViewChild, effect, inject } from '@angular/core';
import { IonTabs, Platform } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { key, settings } from 'ionicons/icons';
import { ShareService } from '../share.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  standalone: false
})
export class TabsPageComponent implements OnInit {
  private platform = inject(Platform);
  private shareService = inject(ShareService);

  @ViewChild('tabs') tab: IonTabs;

  constructor() {
    addIcons({ key, settings });

    // Switch to home tab when a share is received
    effect(() => {
      const sharedHost = this.shareService.sharedHost();
      if (sharedHost) {
        this.tab?.select('home');
      }
    });
  }

  ngOnInit() {
    /**
     * Exit app on hardware 'back' if on Home tab, or return to it if anywhere else.
     * See {@link https://stackoverflow.com/a/59044000/2803757} re. event subscription.
     * In this case we subscribe permanently since `TabsPageComponent` is app-global and should
     * only be destroyed when the whole app exits.
     */
    this.platform.backButton.subscribe(async () => {
      if (this.tab.getSelected() === 'home') {
        navigator['app'].exitApp();
        return;
      }

      this.tab.select('home');
    });
  }
}
