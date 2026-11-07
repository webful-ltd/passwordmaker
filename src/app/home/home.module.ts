import { RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
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
  IonButton,
} from "@ionic/angular";

import { HomePageComponent } from "./home.page";
import {AutofillDirective} from '../autofill.directive';

@NgModule({
  imports: [
    AutofillDirective,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: "", component: HomePageComponent }]),
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
    IonButton,
  ],
  declarations: [HomePageComponent],
})
export class HomePageModule {}
