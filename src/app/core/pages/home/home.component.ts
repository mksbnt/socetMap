import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
import ControllerComponent from '../../components/controller/controller.component';
import SettingsComponent from '../../components/settings/settings.component';
import MapComponent from '../../components/map/map.component';
import CodeComponent from '../../components/code/code.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-home',
  template: `
    <main>
      <router-outlet></router-outlet>
    </main>
    <footer>
      <app-controller></app-controller>
    </footer>
  `,
  styleUrls: ['./home.component.scss'],
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatTabsModule,
    MatButtonModule,
    ControllerComponent,
    SettingsComponent,
    MapComponent,
    CodeComponent,
    RouterOutlet,
  ],
  standalone: true,
})
export default class HomeComponent {}
