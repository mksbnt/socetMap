import {Component} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatTabsModule} from '@angular/material/tabs';
import ToolbarComponent from '../../components/toolbar/toolbarComponent';
import SettingsComponent from '../../components/settings/settings.component';
import MapComponent from '../../components/map/map.component';
import CodeComponent from '../../components/code/code.component';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-home',
  template: `
    <main>
      <router-outlet></router-outlet>
    </main>
    <footer>
      <app-toolbar></app-toolbar>
    </footer>
  `,
  styleUrls: ['./home.component.scss'],
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatTabsModule,
    MatButtonModule,
    ToolbarComponent,
    SettingsComponent,
    MapComponent,
    CodeComponent,
    RouterOutlet,
  ],
  standalone: true,
})
export default class HomeComponent {
}
