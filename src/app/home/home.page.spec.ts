import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { KeyboardMock, PlatformMock, ToastControllerMock } from 'ionic-mocks';

import { Platform, ToastController } from '@ionic/angular';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { IonicStorageModule } from '@ionic/storage';

import { HomePage } from './home.page';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let clipboardSpy: Clipboard;

  beforeEach(async(() => {
    clipboardSpy = jasmine.createSpyObj('Clipboard', ['copy']);
    TestBed.configureTestingModule({
      declarations: [HomePage],
      imports: [
        IonicStorageModule.forRoot(),
      ],
      providers: [
        { provide: Clipboard, useValue: clipboardSpy },
        { provide: Keyboard, useValue: KeyboardMock.instance() },
        { provide: Platform, useValue: PlatformMock },
        { provide: ToastController, useValue: ToastControllerMock },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
