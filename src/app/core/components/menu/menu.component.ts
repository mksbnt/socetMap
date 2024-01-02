import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { ROUTES } from '../../enums/routes.enum';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [MatIconModule, RouterModule, MatMenuModule, MatButtonModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent {
  ROUTES = ROUTES;
}
