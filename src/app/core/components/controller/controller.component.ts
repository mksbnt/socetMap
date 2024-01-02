import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { ActionsComponent } from '../actions/actions.component';
import { TimeComponent } from '../time/time.component';
import { SliderComponent } from '../slider/slider.component';

@Component({
  selector: 'app-controller',
  templateUrl: './controller.component.html',
  styleUrls: ['./controller.component.scss'],
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
    RouterModule,
    CommonModule,
    MatMenuModule,
    ActionsComponent,
    TimeComponent,
    SliderComponent,
  ],
  standalone: true,
})
export default class ControllerComponent {
  get isSliderDisabled(): boolean {
    return false;
    // todo: disable slider
    // return this.controllerActionsService.isLiveModeActive ||
    //   this.controllerActionsService.isPlayModeActive
    //   ? true
    //   : this.signalsCount
    //   ? false
    //   : true;
  }
}
