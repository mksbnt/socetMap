import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControllerSliderService } from '../../services/controller-slider.service';

@Component({
  selector: 'app-time',
  standalone: true,
  imports: [CommonModule],
  template: `
    <time>
      {{ sliderService.sliderTimestamp$ | async | date : 'M/d/yy, H:mm:ss' }}
    </time>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeComponent {
  public sliderService: ControllerSliderService = inject(
    ControllerSliderService
  );
}
