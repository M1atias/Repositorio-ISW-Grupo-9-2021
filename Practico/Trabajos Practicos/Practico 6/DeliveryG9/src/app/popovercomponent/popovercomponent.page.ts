import { Component, OnInit } from '@angular/core';
import {PopoverController} from '@ionic/angular';

@Component({
  selector: 'app-popovercomponent',
  templateUrl: './popovercomponent.page.html',
  styleUrls: ['./popovercomponent.page.scss'],
})
export class PopovercomponentPage implements OnInit {
  tipoError;
  constructor(private popover:PopoverController) { }

  ngOnInit() {
  }
  ClosePopover(){
    this.popover.dismiss();
  }
}
