import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ControllerSliderService } from '../../services/controller-slider.service';

@Component({
  selector: 'app-time',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<time>{{ time$ | async | date : 'M/d/yy, H:mm:ss' }}</time>`,
  styles: `:host {display: flex; justify-content: center;}`,
})
export class TimeComponent {
  private readonly sliderService = inject(ControllerSliderService);
  time$ = this.sliderService.sliderTimestamp$;
}
