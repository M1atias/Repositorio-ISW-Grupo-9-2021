import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import {Chooser} from '@ionic-native/chooser/ngx';
import {PopovercomponentPageModule} from './popovercomponent/popovercomponent.module';
import {Geolocation} from  '@ionic-native/geolocation/ngx';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, PopovercomponentPageModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },Chooser,Geolocation],
  bootstrap: [AppComponent],
})
export class AppModule {}
