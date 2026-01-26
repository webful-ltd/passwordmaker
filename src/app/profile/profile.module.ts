import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent, IonCard, IonCardContent, IonList, IonItem, IonInput, IonSelect, IonSelectOption, IonRange, IonToggle, IonActionSheet, IonFooter, IonTextarea } from '@ionic/angular/standalone';

import { ProfilePageComponent } from './profile.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
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
    IonFooter,
    IonTextarea
  ],
  declarations: [ProfilePageComponent]
})
export class ProfilePageModule { }
