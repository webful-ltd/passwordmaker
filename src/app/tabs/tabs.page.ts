import { Component, OnInit, ViewChild } from '@angular/core';
import { IonTabs, Platform } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { key, settings } from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  standalone: false
})
export class TabsPageComponent implements OnInit {
  @ViewChild('tabs') tab: IonTabs;

  constructor(private platform: Platform) {
    addIcons({ key, settings });
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
