import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import {PopoverController} from '@ionic/angular';
import {PopovercomponentPage} from '../popovercomponent/popovercomponent.page';

@Component({
  selector: 'app-pantalla-confirmacion',
  templateUrl: './pantalla-confirmacion.page.html',
  styleUrls: ['./pantalla-confirmacion.page.scss'],
})
export class PantallaConfirmacionPage implements OnInit {
  texto:string = "";
  constructor(
    public navCtrl:NavController,
    private popover:PopoverController) { }

  ngOnInit() {
  }

  presentAlert() { 
    this.texto = "Funcionalidad todavia NO desarrollada !!!";
    this.CreatePopover();
    /*const alert = document.createElement('ion-alert');
    alert.message = "Funcionalidad todavia NO desarrollada !!!";
    alert.buttons = ["Ok"];
    document.body.appendChild(alert);
    return alert.present();*/
  }

  pedirNuevamente(){
    this.navCtrl.navigateBack('/home');
  }

  CreatePopover(){
    this.popover.create({component:PopovercomponentPage,showBackdrop:true, backdropDismiss:false,componentProps:{tipoError:this.texto}}).then((popoverElement)=>{
    popoverElement.present();
  })
}

}
