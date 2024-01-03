import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import { ControllerSliderService } from '../../services/controller-slider.service';
import { ControllerActionsService } from '../../services/controller-actions.service';
import { IndexedDbService } from '../../services/indexed-db.service';

@Component({
  selector: 'app-slider',
  standalone: true,
  imports: [MatSliderModule, CommonModule, FormsModule],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.scss',
})
export class SliderComponent {
  public dbService: IndexedDbService = inject(IndexedDbService);
  public actionsService: ControllerActionsService = inject(
    ControllerActionsService
  );
  public sliderService: ControllerSliderService = inject(
    ControllerSliderService
  );
  SLIDER_STEP = 1000;
}
