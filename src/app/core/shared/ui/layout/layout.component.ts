import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  template: `<router-outlet></router-outlet>`,
  styleUrls: ['./layout.component.scss'],
  imports: [RouterOutlet],
  standalone: true,
})
export default class LayoutComponent {}
