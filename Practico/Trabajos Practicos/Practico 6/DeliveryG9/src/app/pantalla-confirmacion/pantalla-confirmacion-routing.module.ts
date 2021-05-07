import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PantallaConfirmacionPage } from './pantalla-confirmacion.page';

const routes: Routes = [
  {
    path: '',
    component: PantallaConfirmacionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PantallaConfirmacionPageRoutingModule {}
