import { Route } from '@angular/router';

const homeRoutes: Route[] = [
  {
    path: 'code',
    loadComponent: () => import('../../components/code/code.component'),
    pathMatch: 'full',
  },
  {
    path: 'map',
    loadComponent: () => import('../../components/map/map.component'),
    pathMatch: 'full',
  },
  {
    path: 'settings',
    loadComponent: () => import('../../components/settings/settings.component'),
    pathMatch: 'full',
  },
  {
    path: '',
    redirectTo: 'code',
    pathMatch: 'full',
  },
];

export default homeRoutes;
