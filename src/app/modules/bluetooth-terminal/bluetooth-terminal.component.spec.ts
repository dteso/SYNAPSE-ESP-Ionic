import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { BluetoothTerminalComponent } from './bluetooth-terminal.component';

describe('BluetoothTerminalComponent', () => {
  let component: BluetoothTerminalComponent;
  let fixture: ComponentFixture<BluetoothTerminalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BluetoothTerminalComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(BluetoothTerminalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
