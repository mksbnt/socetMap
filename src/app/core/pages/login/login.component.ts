import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  template: `
    <button [routerLink]="['/home']" mat-fab extended color="primary">
      <mat-icon>key</mat-icon>
      <span>Login</span>
    </button>
  `,
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [MatButtonModule, MatIconModule, RouterModule],
})
export default class LoginComponent {}
