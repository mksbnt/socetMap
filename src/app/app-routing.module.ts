import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{
  path: '',
  loadComponent: () => import('../../src/app/core/shared/ui/layout/layout.component'),
  loadChildren: () => import('../../src/app/core/shared/ui/layout/layout.routes'),
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
