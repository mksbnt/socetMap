import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatSliderModule } from '@angular/material/slider';
import { TimeService } from '../../services/time.service';
import { millisecondsToSeconds } from '../../utils/time.util';
import { BehaviorSubject } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ControllerSliderService } from '../../services/controller-slider.service';

@Component({
  selector: 'app-slider',
  standalone: true,
  imports: [MatSliderModule, CommonModule, FormsModule],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.scss',
})
export class SliderComponent {
  public sliderService: ControllerSliderService = inject(
    ControllerSliderService
  );
  SLIDER_STEP = 1000;
}
