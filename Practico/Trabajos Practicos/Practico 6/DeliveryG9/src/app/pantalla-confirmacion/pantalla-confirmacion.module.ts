import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PantallaConfirmacionPageRoutingModule } from './pantalla-confirmacion-routing.module';

import { PantallaConfirmacionPage } from './pantalla-confirmacion.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PantallaConfirmacionPageRoutingModule
  ],
  declarations: [PantallaConfirmacionPage]
})
export class PantallaConfirmacionPageModule {}
