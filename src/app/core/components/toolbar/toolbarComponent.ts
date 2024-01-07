import {Component} from '@angular/core';
import {MatToolbarModule} from '@angular/material/toolbar';
import {CommonModule} from '@angular/common';
import {ActionsComponent} from '../actions/actions.component';
import {TimeComponent} from '../time/time.component';
import {SliderComponent} from '../slider/slider.component';
import {MenuComponent} from '../menu/menu.component';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    ActionsComponent,
    TimeComponent,
    SliderComponent,
    MenuComponent,
  ],
  template: `
  <mat-toolbar>
    <app-actions></app-actions>
    <app-slider></app-slider>
    <app-time></app-time>
    <app-menu></app-menu>
  </mat-toolbar>
`,
  styleUrls: ['./toolbarComponent.scss'],
})
export default class ToolbarComponent {
}
