import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonIcon, IonSelect, IonSelectOption, IonLabel, IonButton } from '@ionic/angular/standalone';

import { HomePageComponent } from './home.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: HomePageComponent }]),
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonInput,
    IonIcon,
    IonSelect,
    IonSelectOption,
    IonLabel,
    IonButton
  ],
  declarations: [HomePageComponent]
})
export class HomePageModule { }
