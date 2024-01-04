import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { TimeComponent } from './time.component';
import { ControllerSliderService } from '../../services/controller-slider.service';
import { DatePipe } from '@angular/common';

describe('TimeComponent', () => {
  let component: TimeComponent;
  let fixture: ComponentFixture<TimeComponent>;
  let mockSliderService: jasmine.SpyObj<ControllerSliderService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TimeComponent],
      providers: [
        { provide: ControllerSliderService, useValue: mockSliderService },
        DatePipe, // Provide DatePipe for formatting
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TimeComponent);
    component = fixture.componentInstance;
  });

  it('should display formatted time from sliderService', fakeAsync(() => {
    const testTimestamp = 1667505600000;
    mockSliderService.sliderTimestamp$.next(testTimestamp);

    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const timeElement = fixture.nativeElement.querySelector('time');
      const formattedTime = new DatePipe('en-US').transform(
        testTimestamp,
        'M/d/yy, H:mm:ss'
      );
      expect(timeElement.textContent).toBe(formattedTime);
    });
  }));
});
