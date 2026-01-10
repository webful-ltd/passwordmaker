import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent, IonCard, IonCardContent, IonList, IonItem, IonInput, IonSelect, IonSelectOption, IonRange, IonToggle, IonActionSheet, IonFooter } from '@ionic/angular/standalone';

import { ProfilePageComponent } from './profile.page';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild([{ path: '', component: ProfilePageComponent }]),
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonCard,
    IonCardContent,
    IonList,
    IonItem,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonRange,
    IonToggle,
    IonActionSheet,
    IonFooter
  ],
  declarations: [ProfilePageComponent]
})
export class ProfilePageModule { }
