import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolbarComponent } from './toolbarComponent';

describe('ControllerComponent', () => {
  let component: ControllerComponent;
  let fixture: ComponentFixture<ControllerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ControllerComponent]
    });
    fixture = TestBed.createComponent(ControllerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
