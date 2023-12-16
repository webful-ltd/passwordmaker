import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';

import { TabsPageRoutingModule } from './tabs.router.module';
import { TabsPageComponent } from './tabs.page';
import { HomePageModule } from '../home/home.module';
import { ProfilePageModule } from '../profile/profile.module';
import { SettingsPageModule } from '../settings/settings.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TabsPageRoutingModule,
    HomePageModule,
    ProfilePageModule,
    SettingsPageModule,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel
  ],
  declarations: [TabsPageComponent]
})
export class TabsPageModule {}
