import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-pantalla-confirmacion',
  templateUrl: './pantalla-confirmacion.page.html',
  styleUrls: ['./pantalla-confirmacion.page.scss'],
})
export class PantallaConfirmacionPage implements OnInit {

  constructor(public navCtrl:NavController) { }

  ngOnInit() {
  }

  presentAlert() {
    const alert = document.createElement('ion-alert');
    alert.message = "Funcionalidad todavia NO desarrollada !!!";
    alert.buttons = ["Ok"];
    document.body.appendChild(alert);
    return alert.present();
  }

  pedirNuevamente(){
    this.navCtrl.navigateBack('/home');
  }

}
