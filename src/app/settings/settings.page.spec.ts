import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EventsMock, ToastControllerMock } from 'ionic-mocks';

import { ReactiveFormsModule } from '@angular/forms';
import { Events, ToastController } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage';

import { SettingsPage } from './settings.page';

describe('SettingsPage', () => {
  let component: SettingsPage;
  let fixture: ComponentFixture<SettingsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SettingsPage],
      imports: [
        IonicStorageModule.forRoot(),
        ReactiveFormsModule,
      ],
      providers: [
        { provide: Events, useValue: EventsMock.instance() },
        { provide: ToastController, useValue: ToastControllerMock },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
