import { Component, OnInit } from '@angular/core';
import { LoadingController, NavController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { FormControl } from '@angular/forms';
import {Chooser, ChooserResult} from '@ionic-native/chooser/ngx';
import {PopoverController} from '@ionic/angular';
import {PopovercomponentPage} from '../popovercomponent/popovercomponent.page';
import {Geolocation, Geoposition} from  '@ionic-native/geolocation/ngx';
import * as L from 'leaflet';
import 'leaflet-control-geocoder';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{
  banderaCargaPantalla:boolean = false;
  productoB: string;
  fileObj:ChooserResult;
  mostrarImg:string="";
  imgValidation:boolean = false;
  validacionImg:string;
  produtosCargados:any[]=[];
  seleccionarDomicilio = "biff";
  selectorDomicilio: boolean = true;
  ciudadSeleccionada:string;
  nombreCalle:string;
  numeroCalle:string;
  numeroPiso:number = null;
  numeroDepartamento:string = " ";
  referenciaIngresada:string="";
  latInicial:any;
  logInicial:any;
  latLong=[];
  map:L.Map;
  marker;
  _geocoderType = L.Control.Geocoder.nominatim();
  geocoder = L.Control.geocoder({
    geocoder: this._geocoderType
  });

  constructor(
    private loadingCtrl:LoadingController,
    private navCtc: NavController,
    private chooser:Chooser,
    private popover:PopoverController,
    private geolaction: Geolocation,
  ) {
    this.productoBuscar = this.createFormGroupProducto();
    this.domicilio = this.createFormGroupDomicilio();
  }
  resetearFormularioProducto(){
    this.productoBuscar.reset();
  }
  ngOnInit() {
    if (this.banderaCargaPantalla === false) {
      this.recargarPagina();
      this.banderaCargaPantalla = true;
    }
  }
  
  productoBuscar: FormGroup;
  domicilio: FormGroup;
  
  createFormGroupProducto(){
    return new FormGroup({
      nombreProducto: new FormControl('',[Validators.required,Validators.maxLength(255), Validators.minLength(5),Validators.pattern(/^[-a-zA-Z0-9' 'ñÑ]{1,100}$/)])
    });
  }
  createFormGroupDomicilio() {
    return new FormGroup({
      ciudad: new FormControl('', [Validators.required]),
      calle: new FormControl('', [Validators.required, Validators.maxLength(50), Validators.minLength(3), Validators.pattern(/^[-a-zA-Z0-9' 'ñÑ]{1,100}$/)]),
      numero: new FormControl('', [Validators.required, Validators.min(1), Validators.max(99999)]),
      piso: new FormControl('', [Validators.min(-2),Validators.max(99)]),
      departamento: new FormControl('', [Validators.min(1) ,Validators.maxLength(2), Validators.pattern(/^[-a-zA-Z0-9' 'ñÑ]{1,2}$/)]),
      referencia: new FormControl('')
    });
  }
  get nombreProducto(){
    return this.productoBuscar.get('nombreProducto');
  }
  get ciudad() {
    return this.domicilio.get('ciudad');
  }
  get calle() {
    return this.domicilio.get('calle');
  }
  get numero() {
    return this.domicilio.get('numero');
  }
  get piso() {
    return this.domicilio.get('piso');
  }
  get departamento() {
    return this.domicilio.get('departamento');
  }

  get referencia() {
    return this.referencia.get('referencia');
  }

  //Mensajes de error 
public errorMessages = {
    ciudad: [
      { type: 'required', message: 'Se requiere el nombre de la ciudad' }
    ],
    calle: [
      { type: 'required', message: 'Se requiere el nombre de la calle' },
      { type: 'maxlength', message: 'El nombre de la calle no puede ser mayor a 50 caracteres' },
      { type: 'minlength', message: 'El nombre de la calle debe tener como mínimo 3 caracteres' },
      { type: 'pattern', message: 'El nombre de la calle ingresado no es valido' }
    ],
    numero: [
      { type: 'required', message: 'Se requiere el número del domicilio' },
      { type: 'max', message: 'El número del domicilio no puede ser mayor a 5 caracteres' },
      { type: 'min', message: 'El número del domicilio debe ser mayor a 1' }
    ],
    piso: [
      { type: 'maxlength', message: 'El número de piso no puede ser mayor a 3 caracteres' },
      { type: 'min', message: 'El número de piso debe ser mayor a -2' },
      { type: 'max', message: 'El número de piso debe ser menor a 99' }
    ],
    departamento: [
      { type: 'maxlength', message: 'El número de departamento no puede ser mayor a 2 caracteres' },
      { type: 'min', message: 'El número de departamento debe ser mayor a 0' }
    ],
    efectivo: [
      { type: 'min', message: 'El monto debe ser mayor a 0' },
      { type: 'required', message: 'El monto es requerido' },
      {type:'pattern', message:'Solo se pueden ingresar números'}
    ],

    numeroTarjeta: [
      { type: 'required', message: 'Se requiere el número de tarjeta' },
      { type: 'maxlength', message: 'El número de tarjeta debe ser de 16 caracteres' },
      { type: 'minlength', message: 'El número de tarjeta debe ser de 16 caracteres' },
      { type: 'pattern', message: 'El número de la tarjeta no es valido' }
    ],
    nombreTarjeta: [
      { type: 'required', message: 'Se requiere el nombre del titular de la tarjeta' },
      { type: 'maxlength', message: 'El nombre del titular de la tarjeta debe tener como máximo 50 caracteres' },
      { type: 'minlength', message: 'El nombre del titular de la tarjeta debe tener como mínimo 3 caracteres' },
      { type: 'pattern', message: 'El nombre del titular de la tarjeta ingresado no es valido' }
    ],
    expiracion: [
      { type: 'required', message: 'Se requiere la fecha de expiración de la tarjeta' },
      { type: 'pattern', message: 'Ingrese una fecha valida' }
    ],
    codSeguridad: [
      { type: 'required', message: 'Se requiere el código de seguridad de la tarjeta' },
      { type: 'pattern', message: 'El patron del codigo de la tarjeta es de 3 caracteres' }
    ],
    nombreProducto:[
      { type: 'required', message: 'Se requiere el nombre del producto' },
      { type: 'maxlength', message: 'El nombre del producto no puede ser mayor a 50 caracteres' },
      { type: 'minlength', message: 'El nombre del producto debe tener como mínimo 5 caracteres' },
      { type: 'pattern', message: 'El nombre del producto ingresado no es valido' }
    ]

  };

  recargarPagina(){
    /*if (this.minutosModificados > 60) {
      let horaFinal = this.horaModificada.getHours() + 1;
      this.minutosModificados = this.minutosModificados - 60;
      this.hora = new Date(this.fecha.getFullYear(),this.fecha.getMonth(),this.fecha.getDate(),horaFinal,this.minutosModificados,0);
      this.horaLoAntesPosible = this.hora;
      this.horaProgramada = this.hora;
    }
    else{
      this.hora = new Date(this.fecha.getFullYear(),this.fecha.getMonth(),this.fecha.getDate(),this.horaModificada.getHours(),this.minutosModificados,0);
      this.horaLoAntesPosible = this.hora;
      this.horaProgramada = this.hora;
    }*/
    this.banderaCargaPantalla = false;
  }
  
  async presentLoading() {
    const loading = await this.loadingCtrl.create({
      cssClass: 'my-custom-class',
      spinner:'bubbles',
      message: 'Por favor espere...',
      duration: 2000
    });
    await loading.present();
  }
  refrescar(event){
    setTimeout(()=>{
    /*this.limpiarCampos();
    this.borrarPedido();
    this.presentLoading();
    this.recargarPagina();
    this.domicilio.reset();
    this.metodoPagoEfectivo.reset();
    this.metodoPagoTarjeta.reset();
    this.limpiarValore = " ";
    this.referenciaIngresada = "";*/
    event.target.complete();
  },1500);
}

CreatePopover(){
  this.popover.create({component:PopovercomponentPage,showBackdrop:true, backdropDismiss:false,componentProps:{tipoError:this.validacionImg}}).then((popoverElement)=>{
    popoverElement.present();
  })
}
submit() {
  return false
}
pickFile(){
  this.chooser.getFile("image/jpeg").then((value:ChooserResult)=>{
    this.fileObj = value;
    this.mostrarImg = "";
    const text3 = JSON.stringify(this.fileObj.mediaType);
    const text4 = JSON.stringify(this.fileObj.name);
    const text5 = JSON.stringify(this.fileObj.uri);
    let blob = new Blob([this.fileObj.data],{type:"image/jpeg"});
    const text6 = "blob size=" + blob.size;
    
    console.log(text3+text4+text5,text6);
    alert(text3+text4+text5+text6);
    if (blob.type === "image/jpeg" || blob.type === "image/jpg") {
      this.imgValidation = false;
      if (blob.size < 5000000) {
        this.imgValidation = false;
        this.mostrarImg = this.fileObj.dataURI;
      }else{
        this.imgValidation = true;
        this.validacionImg = "El tamaño del archivo supera los 5 mb, no se guardara la imagen";
        this.CreatePopover();
      }
    }else{
      this.imgValidation = true;
      this.validacionImg = "Debe seleccionar un archivo '.jpg', no se guardara la imagen";
      this.CreatePopover();
    }
  }),(err) =>{
    console.log("error");
  }
}
cargarProducto(){
  console.log(this.produtosCargados.length);
  let vueltas = this.produtosCargados.length;
  for (let index = 0; index <= vueltas; index++) {
    const ionItem = document.createElement('ion-item');
    const img = document.createElement('img');
    const ionAvatar = document.createElement('ion-avatar');
    const nuevoProducto = document.createElement('ion-label');
    nuevoProducto.textContent = this.productoB;
    if (this.mostrarImg) {
      img.setAttribute("src",this.mostrarImg);
      img.setAttribute("width","50px");
      img.setAttribute("margin-left","50px");
      img.setAttribute("border","10px");
    }
    ionAvatar.setAttribute("slot","end");
    ionAvatar.appendChild(img);
    ionItem.appendChild(nuevoProducto);
    ionItem.appendChild(img);
    let list = document.querySelector('#listaProductosACargar');
    list.appendChild(ionItem);
  }
}

ocultarMapa(){
  this.selectorDomicilio = false;
}

mostrarMapa(){
  this.selectorDomicilio = true;
}

obtenerCiudad(event){
  this.ciudadSeleccionada = event.detail.value;
}

getGeolaction(){
  this.geolaction.getCurrentPosition({
    enableHighAccuracy:true,
    maximumAge:0
  }).then((res:Geoposition)=>{
    console.log(res);
    this.latInicial = res.coords.latitude;
    this.logInicial = res.coords.longitude;
    console.log(res.coords.latitude + res.coords.longitude)
  })
}
getPosition(){
  this.geolaction.getCurrentPosition({
    enableHighAccuracy:true
  }).then((res)=>{
    return this.latLong = [
      res.coords.latitude,
      res.coords.longitude
    ]
  }).then((latLong)=>{
    this.showMarker(latLong);
  })
}

showMarker(latLog){
  this.map.remove();
  this.showMap2();
  if(this.marker){
    this.marker.setLatLng(this.latLong,{draggable:true,bubblingMouseEvents:true});
    this.map.setView(latLog);
  }else{
    this.marker = L.marker(latLog,{draggable:true,bubblingMouseEvents:true});
    this.marker.addTo(this.map).bindPopup('Im Here' + this.marker.getLatLng()).openPopup();
    this.map.setView(latLog);
    console.log(this.marker);
  }
}

showMap2(){
  this.getGeolaction();
  this.map = new L.Map('myMap').setView([-31.4172235,-64.1891788],14);
  L.tileLayer('assets/mapa/{z}/{x}/{y}.png').addTo(this.map);
  //this.geocoder.addTo(this.map);
}

ionViewDidEnter(){
  this.showMap();
}
showMap(){
  this.getGeolaction();
  this.map = new L.Map('myMap').setView([-31.4172235,-64.1891788],14);
  L.tileLayer('assets/mapa/{z}/{x}/{y}.png').addTo(this.map);
  this.geocoder.addTo(this.map);
  var cen;
  this.geocoder.on('markgeocode', function(event) {
      var center = event.geocode.center;
      cen = center;
      console.log(center);
      console.log(cen);
      //L.marker(center,{draggable:true,bubblingMouseEvents:true}).addTo(mapa);
      //mapa.setView(center, mapa.getZoom());
      //this.showMarker(center);
      //L.Control.geocoder().addTo(this.map);
    });
}
}

