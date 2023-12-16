import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonButton, IonItem, IonInput, IonSelect, IonSelectOption, IonToggle, IonRange, IonActionSheet } from '@ionic/angular/standalone';

import { SettingsPageComponent } from './settings.page';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild([{ path: '', component: SettingsPageComponent }]),
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonIcon,
    IonButton,
    IonItem,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonToggle,
    IonRange,
    IonActionSheet
  ],
  declarations: [SettingsPageComponent]
})
export class SettingsPageModule {}
