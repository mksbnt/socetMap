import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';
import { ActionsComponent } from '../actions/actions.component';
import { TimeComponent } from '../time/time.component';
import { SliderComponent } from '../slider/slider.component';
import { MenuComponent } from '../menu/menu.component';

@Component({
  selector: 'app-controller',
  templateUrl: './controller.component.html',
  styleUrls: ['./controller.component.scss'],
  imports: [
    CommonModule,
    MatToolbarModule,
    ActionsComponent,
    TimeComponent,
    SliderComponent,
    MenuComponent,
  ],
  standalone: true,
})
export default class ControllerComponent {}
