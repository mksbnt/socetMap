import { Route } from '@angular/router';

const layoutRoutes: Route[] = [
  {
    path: 'login',
    loadComponent: () => import('../../../pages/login/login.component'),
  },
  {
    path: 'home',
    loadComponent: () => import('../../../pages/home/home.component'),
    loadChildren: () => import('../../../pages/home/home.routes'),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];

export default layoutRoutes;
