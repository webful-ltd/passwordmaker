import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CloudSettings } from '@awesome-cordova-plugins/cloud-settings/ngx';
import { IonInput, IonSelect, IonToggle, IonTextarea, provideIonicAngular } from '@ionic/angular/standalone';
import { Drivers } from '@ionic/storage';
import { IonicStorageModule } from '@ionic/storage-angular';

import { CapacitorSqliteDriverService } from '../capacitor-sqlite-driver.service';
import { Profile } from '../../models/Profile';
import { ProfilePageComponent } from './profile.page';

describe('ProfilePageComponent', () => {
  let component: ProfilePageComponent;
  let fixture: ComponentFixture<ProfilePageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ProfilePageComponent],
      imports: [
        FormsModule,
        IonInput,
        IonSelect,
        IonToggle,
        IonTextarea,
        IonicStorageModule.forRoot({
          driverOrder: [CapacitorSqliteDriverService._driver, Drivers.IndexedDB],
        }),
        ReactiveFormsModule,
      ],
      providers: [
        CloudSettings,
        provideIonicAngular(),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilePageComponent);
    component = fixture.componentInstance;
    component.profileModel = new Profile();
    component.profileModel.profile_id = 1;
    component.profileModel.name = 'Default';
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
