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
  seleccionarEntrega = "biff";
  seleccionarPago = "biff";
  selectorFechaVisible: boolean = false;
  selectorTarjetaVisible: boolean = false;
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
  ciudadSeleccionadaEntrega:string;
  nombreCalle:string;
  nombreCalleEntrega:string;
  numeroCalle:string;
  numeroCalleEntrega:string;
  numeroPiso:number = null;
  numeroDepartamento:string = " ";
  referenciaIngresada:string="";
  referenciaEntregaIngresada:string="";
  latInicial:any;
  logInicial:any;
  latLong=[];
  map:L.Map;
  marker;
  _geocoderType = L.Control.Geocoder.nominatim();
  geocoder = L.Control.geocoder({
    geocoder: this._geocoderType
  });
  horaParcial: Date = new Date();
  horaSeleccionada:Date=new Date();
  corregirHora: boolean = false;
  diaSeleccionada:Date=new Date();
  horaModificada:Date = new Date();
  minutosModificados = this.horaModificada.getMinutes()+30;
  hora:Date = new Date();
  horaProgramada:Date;
  fecha: Date = new Date();
  horaLoAntesPosible:Date = new Date(this.fecha.getFullYear(),this.fecha.getMonth(),this.fecha.getDate(),this.horaModificada.getHours(),this.minutosModificados,0);
  fechaSeleccionada:Date = this.fecha;
  modoPago:string = "Efectivo";
  limpiarValore:string = "";
  montoIngresado:number = 0;
  precio:number = 100;
  banderaMonto:boolean = false;
  numeroTarjetaVISA:string;
  mostrarVISA:string = "*********";
  titularTarjeta:string;
  

  constructor(
    private loadingCtrl:LoadingController,
    private navCtc: NavController,
    private chooser:Chooser,
    private popover:PopoverController,
    private geolaction: Geolocation,
  ) {
    this.productoBuscar = this.createFormGroupProducto();
    this.domicilio = this.createFormGroupDomicilio();
    this.metodoPagoEfectivo = this.createFormGroupMetodoPagoEfectivo();
    this.metodoPagoTarjeta = this.createFormGroupMetodoPagoTarjeta();
    this.domicilioEntrega = this.createFormGroupDomicilioEntrega();
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
  domicilioEntrega: FormGroup;
  metodoPagoEfectivo: FormGroup;
  metodoPagoTarjeta: FormGroup;
  
  createFormGroupProducto(){
    return new FormGroup({
      nombreProducto: new FormControl('',[Validators.required,Validators.maxLength(255), Validators.minLength(5),Validators.pattern(/^[-a-zA-Z0-9' 'ñÑ]{1,100}$/)])
    });
  }
  createFormGroupDomicilio() {
    return new FormGroup({
      ciudad: new FormControl('', [Validators.required]),
      calle: new FormControl('', [Validators.required, Validators.maxLength(255), Validators.minLength(1), Validators.pattern(/^[-a-zA-Z0-9' 'ñÑ]{1,100}$/)]),
      numero: new FormControl('', [Validators.required, Validators.min(1), Validators.max(9999999999)]),
      referencia: new FormControl('',[Validators.maxLength(255)])
    });
  }

  createFormGroupDomicilioEntrega() {
    return new FormGroup({
      ciudadEntrega: new FormControl('', [Validators.required]),
      calleEntrega: new FormControl('', [Validators.required, Validators.maxLength(255), Validators.minLength(1), Validators.pattern(/^[-a-zA-Z0-9' 'ñÑ]{1,100}$/)]),
      numeroEntrega: new FormControl('', [Validators.required, Validators.min(1), Validators.max(9999999999)]),
      piso: new FormControl('', [Validators.min(-2),Validators.max(99)]),
      departamento: new FormControl('', [Validators.min(1) ,Validators.maxLength(2), Validators.pattern(/^[-a-zA-Z0-9' 'ñÑ]{1,2}$/)]),
      referenciaEntrega: new FormControl('',[Validators.maxLength(255)])
    });
  }

  createFormGroupMetodoPagoEfectivo(){
    return new FormGroup({
      efectivo: new FormControl('', [Validators.required, Validators.min(1),Validators.max(999999), Validators.pattern(/^[0-9' ']*$/)])
    });
  }

    //Metodo de pago tarjeta
    createFormGroupMetodoPagoTarjeta() {
      return new FormGroup({
        //numero tarjeta solo empieza en 4 / expiracion MMAA / codSeguridad 3 
        numeroTarjeta: new FormControl('', [Validators.required, Validators.maxLength(16), Validators.minLength(16), Validators.pattern(/^4\d{3}-?\d{4}-?\d{4}-?\d{4}$/)]),
        nombreTarjeta: new FormControl('', [Validators.required, Validators.maxLength(50), Validators.minLength(3), Validators.pattern(/^[-a-zA-Z' 'ñÑ]{1,100}$/)]),
        expiracion: new FormControl('', [Validators.required, Validators.maxLength(7), Validators.minLength(7), Validators.pattern(/^((0[1-9]|1[0-2])\/?(20[2-9][1-9]|[0-9]{2})|(09|10|11|12)\/?2020)$/)]),
        codSeguridad: new FormControl('', [Validators.required, Validators.max(999), Validators.min(0), Validators.pattern(/^[0-9]{3}$/)]),
      });
    }


  get nombreProducto(){
    return this.productoBuscar.get('nombreProducto');
  }
  //Comercio
  get ciudad() {
    return this.domicilio.get('ciudad');
  }
  get calle() {
    return this.domicilio.get('calle');
  }
  get numero() {
    return this.domicilio.get('numero');
  }

  get referencia() {
    return this.domicilio.get('referencia');
  }

  //Domicilio de entrega
  get ciudadEntrega() {
    return this.domicilioEntrega.get('ciudadEntrega');
  }
  get calleEntrega() {
    return this.domicilioEntrega.get('calleEntrega');
  }
  get numeroEntrega() {
    return this.domicilioEntrega.get('numeroEntrega');
  }
  get piso() {
    return this.domicilioEntrega.get('piso');
  }
  get departamento() {
    return this.domicilioEntrega.get('departamento');
  }

  get referenciaEntrega() {
    return this.domicilioEntrega.get('referenciaEntrega');
  }

  get efectivo() {
    return this.metodoPagoEfectivo.get('efectivo');
  }

  get numeroTarjeta() {
    return this.metodoPagoTarjeta.get('numeroTarjeta');
  }
  get nombreTarjeta() {
    return this.metodoPagoTarjeta.get('nombreTarjeta');
  }
  get expiracion() {
    return this.metodoPagoTarjeta.get('expiracion');
  }
  get codSeguridad() {
    return this.metodoPagoTarjeta.get('codSeguridad');
  }

  //Mensajes de error 
public errorMessages = {
    ciudad: [
      { type: 'required', message: 'Se requiere el nombre de la ciudad del Comercio' }
    ],
    calle: [
      { type: 'required', message: 'Se requiere el nombre de la calle del Comercio' },
      { type: 'maxlength', message: 'El nombre de la calle no puede ser mayor a 255 caracteres' },
      { type: 'minlength', message: 'El nombre de la calle debe tener como mínimo 1 caracteres' },
      { type: 'pattern', message: 'El nombre de la calle ingresado no es valido' }
    ],
    numero: [
      { type: 'required', message: 'Se requiere el número del domicilio del Comercio' },
      { type: 'max', message: 'El número del domicilio no puede ser mayor a 10 caracteres' },
      { type: 'min', message: 'El número del domicilio debe ser mayor a 1' }
    ],
    ciudadEntrega: [
      { type: 'required', message: 'Se requiere el nombre de la ciudad del Domicilio de Entrega' }
    ],
    calleEntrega: [
      { type: 'required', message: 'Se requiere el nombre de la calle del Domicilio de Entrega' },
      { type: 'maxlength', message: 'El nombre de la calle no puede ser mayor a 255 caracteres' },
      { type: 'minlength', message: 'El nombre de la calle debe tener como mínimo 1 caracteres' },
      { type: 'pattern', message: 'El nombre de la calle ingresado no es valido' }
    ],
    numeroEntrega: [
      { type: 'required', message: 'Se requiere el número del Domicilio de Entrega' },
      { type: 'max', message: 'El número del domicilio no puede ser mayor a 10 caracteres' },
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
      { type: 'min', message: 'El monto ingresado debe ser mayor a $ 0' },
      { type: 'max', message: 'El monto ingresado debe ser menor a $ 999.999' },
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
    ],
    referencia:[
      { type: 'maxlength', message: 'Solo se pueden ingresar 255 caracteres de Referencia' }
    ],
    referenciaEntrega:[
      { type: 'maxlength', message: 'Solo se pueden ingresar 255 caracteres de Referencia' }
    ]
  };

  recargarPagina(){
    if (this.minutosModificados > 60) {
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
    }
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
  borrarProductos(){
    let list = document.querySelector('#listaProductosACargar');
    const vueltas = this.produtosCargados.length;
    for (let index = 0; index < vueltas; index++) {
      var hijo = document.getElementById('producto')
      list.removeChild(hijo);
    }
  }
  refrescar(event){
    setTimeout(()=>{
    this.limpiarCampos();
    this.presentLoading();
    this.recargarPagina();
    this.domicilio.reset();
    this.domicilioEntrega.reset();
    this.productoBuscar.reset();
    this.metodoPagoEfectivo.reset();
    this.metodoPagoTarjeta.reset();
    this.limpiarValore = " ";
    this.referenciaIngresada = "";
    event.target.complete();
    this.borrarProductos();
    this.produtosCargados = [];
    const btn = document.querySelector('#coordenadas');
    btn.setAttribute('disabled','true');
    this.map.remove();
    this.marker = null;
    this.ionViewWillEnter();
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
    
    //console.log(text3+text4+text5,text6);
    //alert(text3+text4+text5+text6);
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
  const detalle = "     ";
  const ionItem = document.createElement('ion-item');
  const img = document.createElement('img');
  const nuevoProducto = document.createElement('ion-label');
  const ionAvatar = document.createElement('ion-avatar');
  nuevoProducto.textContent = this.productoB;
  if (this.mostrarImg) {
    img.setAttribute("src",this.mostrarImg);
    img.setAttribute("width","50px");
    img.setAttribute("margin-left","50px");
    img.setAttribute("border","10px");
  }
  ionItem.setAttribute('color','rojoClaro');
  ionAvatar.setAttribute("slot","end");
  ionAvatar.appendChild(img);
  ionItem.appendChild(nuevoProducto);
  ionItem.appendChild(img);
  ionItem.setAttribute('id','producto');
  let list = document.querySelector('#listaProductosACargar');
  list.appendChild(ionItem);
  this.produtosCargados.push(this.produtosCargados)
  console.log(this.produtosCargados.length);
  this.productoB = detalle;
  this.validacionImg = "";
  this.mostrarImg = "";
}

ocultarMapa(){
  const formulario = document.querySelector('#rowFormulario');
  const mapa = document.querySelector('#rowMapa');
  formulario.setAttribute("disabled","false")
  mapa.setAttribute("disabled","true");
  this.selectorDomicilio = false;
  this.ionViewWillLeave();
  console.log('Mostrar formulario');
  const btn = document.querySelector('#coordenadas');
  btn.setAttribute('disabled','true');
  console.log(this.selectorDomicilio);
}

ionViewWillLeave(){
  this.map.remove()
}
mostrarMapa(){
  const mapa = document.querySelector('#rowMapa');
  const formulario = document.querySelector('#rowFormulario');
  mapa.setAttribute("disabled","false");
  formulario.setAttribute("disabled","true");
  this.selectorDomicilio = true;
  this.ionViewWillEnter();
  console.log('Mostrar mapa');
  console.log(this.selectorDomicilio);
  this.domicilio.reset()
}

obtenerCiudad(event){
  this.ciudadSeleccionada = event.detail.value;
}

obtenerCiudadEntrega(event){
  this.ciudadSeleccionadaEntrega = event.detail.value;
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
  const btn = document.querySelector('#coordenadas');
  btn.setAttribute('disabled','false');
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
  if(this.marker){
    this.marker.setLatLng(this.latLong,{draggable:true,bubblingMouseEvents:true});
    this.map.setView(latLog);
  }else{
    this.marker = L.marker(latLog,{draggable:true,bubblingMouseEvents:true});
    const coordenadas = this.marker.getLatLng();
    this.marker.addTo(this.map).bindPopup('Usted esta en:' + '(Latitud :  ' + coordenadas.lat + ', Longitud: ' + coordenadas.lng + ' ) ').openPopup();
    this.map.setView(latLog);
    console.log(this.marker);
  }
}

capturedPosition(){
  const coordenadas = this.marker.getLatLng();
  this.marker.addTo(this.map).bindPopup('Usted esta en:' + '(Latitud :  ' + coordenadas.lat + ', Longitud: ' + coordenadas.lng + ' ) ').openPopup();
  const markerJson = this.marker.toGeoJSON();
  console.log(markerJson);
}

ionViewWillEnter(){  
  const conMapa = document.querySelector('.container');
  const container = document.getElementById('myMap')
  if (container) {
    this.map = new L.Map('myMap').setView([-31.4172235,-64.1891788],14);
    this.showMap();
  }else{
    console.log('No se encontro el mapa');
    const newContMapa = document.createElement('ion-card-content');
    const contenedor = document.createElement('div');
    newContMapa.setAttribute('width','495px');
    newContMapa.setAttribute('height','385px');
    contenedor.setAttribute('width','100%');
    contenedor.setAttribute('height','80%');
    contenedor.id="myMap";
    newContMapa.appendChild(contenedor);
    this.map = new L.Map('myMap').setView([-31.4172235,-64.1891788],14);
    this.showMap();
  }
}

/*ngAfterViewInit() {
  this.map = new L.Map('myMap').setView([-31.4172235,-64.1891788],14);
}*/

/*ionViewDidEnter(){
  this.showMap();
}*/
showMap(){
  this.getGeolaction();
  //this.map = new L.Map('myMap').setView([-31.4172235,-64.1891788],14);
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

ocultarSelectorFecha() {
  this.selectorFechaVisible = false;
}

mostrarSelectorFecha() {
  this.selectorFechaVisible = true;
}
cambioHora(event) {
  let hourIngresada = new Date(event.detail.value);
  let hourActual = new Date();
  this.horaSeleccionada = hourIngresada;
  if (this.diaSeleccionada.getDate() == this.fecha.getDate()) {
  // esto se tiene q ejecutar nomas cuando diaIngresado==DiaHoy
  if (this.corregirHora == false) {

    if (hourIngresada.getHours() < hourActual.getHours()) {
      this.presentAlertHourInvalid();
      this.corregirHora = true;

    } else {

      if (hourIngresada.getHours() == hourActual.getHours()) {
        if (hourActual.getMinutes() + 31 < hourIngresada.getMinutes()) {
        }
        //todo bien        
        else {
          this.presentAlertMinuteInvalid();
          this.corregirHora = true;
        }
      }else{if (hourActual.getHours()+1==hourIngresada.getHours() && hourActual.getMinutes()>=30 ){
          if(hourIngresada.getMinutes()<hourActual.getMinutes()-30){
            this.presentAlertMinuteInvalid();
            this.corregirHora = true;
          }
        }
      }
    }
  }//aca termina el else grande
  if (this.corregirHora) {
    this.reestablecerValorCampoHora();
  }else{
    this.horaProgramada = event.detail.value;
  }
}else{
  this.horaProgramada = event.detail.value;
}
}

presentAlertHourInvalid() {
  this.validacionImg="La hora que fue seleccionada es menor a la hora actual";
  this.CreatePopover();
  /*const alert = document.createElement('ion-alert');
  alert.header = "Hora incorrecta !!";
  alert.subHeader = "Seleccione nuevamente la hora";
  alert.message = "La hora que fue seleccionada es menor a la hora actual";
  alert.buttons = ["Ok"];
  document.body.appendChild(alert);
  return alert.present();*/
}
presentAlertMinuteInvalid() {
  this.validacionImg="No se puede hacer la entrega antes de los 30 min";
  this.CreatePopover();
  /*const alert = document.createElement('ion-alert');
  alert.header = "Hora incorrecta !!";
  alert.subHeader = "Seleccione nuevamente la hora";
  alert.message = "No se puede hacer la entrega antes de los 30 min";
  alert.buttons = ["Ok"];
  document.body.appendChild(alert);
  return alert.present();*/
}

reestablecerValorCampoHora() {
  let campoHora = document.querySelector('#hora');
  campoHora.setAttribute("value", this.hora.toString());
  this.corregirHora = false;
  this.horaProgramada = this.hora;

}

cambioFecha(event) {
  let date = new Date(event.detail.value);
  this.diaSeleccionada = new Date(event.detail.value);
  this.fechaSeleccionada = this.diaSeleccionada;
  this.verificarHora(this.horaSeleccionada);
}
verificarHora(hora:Date) {
  let hourIngresada = new Date(hora);
  let hourActual = new Date();
  this.horaSeleccionada = hourIngresada;
  if (this.diaSeleccionada.getDate() == this.fecha.getDate()) {
  // esto se tiene q ejecutar nomas cuando diaIngresado==DiaHoy
  if (this.corregirHora == false) {

    if (hourIngresada.getHours() < hourActual.getHours()) {
      this.presentAlertHourInvalid();
      this.corregirHora = true;

    } else {

      if (hourIngresada.getHours() == hourActual.getHours()) {
        if (hourActual.getMinutes() + 31 < hourIngresada.getMinutes()) {
        }
        //todo bien        
        else {
          this.presentAlertMinuteInvalid();
          this.corregirHora = true;
        }
      }else{if (hourActual.getHours()+1==hourIngresada.getHours() && hourActual.getMinutes()>=30 ){
          if(hourIngresada.getMinutes()<hourActual.getMinutes()-30){
            this.presentAlertMinuteInvalid();
            this.corregirHora = true;
          }
        }
      }
    }
  }//aca termina el else grande
  if (this.corregirHora) {
    this.reestablecerValorCampoHora();
  }else{
  }
}else{
  this.horaProgramada = hora;
}
}

ocultarSelectorTarjeta() {
  this.selectorTarjetaVisible = false;
  this.resetearFormularioPago();
  this.modoPago = "Efectivo";
  let iconoPago = document.querySelector('#iconoPago');
  iconoPago.setAttribute("name","cash-outline");
}

mostrarSelectorTarjeta() {
  this.selectorTarjetaVisible = true;
  this.resetearFormularioPago();
  this.modoPago = "Tarjeta";
  let iconoPago = document.querySelector('#iconoPago');
  iconoPago.setAttribute("name","card-outline");
}

resetearFormularioPago() {
  this.metodoPagoEfectivo.reset();
  this.metodoPagoTarjeta.reset();
  this.limpiarValore = "";
}
validarMonto(event){
  this.montoIngresado = event.detail.value;
  /*if (this.montoIngresado < 0) {
    if (this.montoIngresado >= this.precio) {
      this.borrarMensajeDeError();
      this.banderaMonto = false;
      //this.vuelto=Math.round((this.montoIngresado - this.precio)*100)/100;
    }else{
      if (this.montoIngresado.toString() == '') {
        this.borrarMensajeDeError();
        this.banderaMonto = false;
      }else{
        if (this.banderaMonto == false) {
          const mensaje = document.createElement('label');
          mensaje.textContent = "El monto ingresado es menor al costo del envio";
          document.querySelector('.error-message2').appendChild(mensaje);
          this.banderaMonto = true;
        }
      }
    }
  }else{
    this.borrarMensajeDeError();
    this.banderaMonto = false;
    //this.vuelto = 0;
  }*/
}
  /*borrarMensajeDeError(){
    let mensajeError = document.querySelector('.error-message2');
    while (mensajeError.hasChildNodes()) {
      mensajeError.removeChild(mensajeError.firstChild);
    }
  }*/
  validarTarjeta(event){
    let numeroTarjetap = event.detail.value;
    if (numeroTarjetap.length == 16) {
      this.recorrerTarjeta();
    }else{
      this.mostrarVISA = "*********";
    }
  }
  recorrerTarjeta(){
    this.mostrarVISA = '*****'+this.numeroTarjetaVISA[12]+this.numeroTarjetaVISA[13]+this.numeroTarjetaVISA[14]+this.numeroTarjetaVISA[15]
  }

  limpiarCampos(){
    this.ciudadSeleccionada = "  "; 
    this.ciudadSeleccionadaEntrega = "  "; 
    this.nombreCalle = " ";
    this.nombreCalleEntrega = "     ";
    this.numeroCalle = "   ";
    this.numeroCalleEntrega = null;
    this.numeroPiso = null;
    this.numeroDepartamento = " ";
    this.referenciaIngresada = "";
    this.referenciaEntregaIngresada = "";
    this.selectorFechaVisible = false;
    this.seleccionarEntrega = "biff";
    this.seleccionarPago = "biff";
    this.seleccionarDomicilio = "biff";
    this.selectorTarjetaVisible = false; 
    this.numeroTarjetaVISA=null;
    this.titularTarjeta = null;
  }

  validarRecarga(){
    //cambiar condición this.produtosCargados.length = 0 por this.produtosCargados.length > 0      (this.montoIngresado >= this.precio || this.selectorTarjetaVisible) &&                                                                             // && this.limpiarValore !== " "
    if (this.produtosCargados.length > 0 && (this.metodoPagoTarjeta.valid || this.metodoPagoEfectivo.valid) && this.domicilioEntrega.valid && this.limpiarValore != " ") {
      console.log('Productos y pago OK')
      //return true;
      if (this.selectorDomicilio === false && this.domicilio.valid && this.ciudadSeleccionada !== "  " && this.nombreCalle !== "     " && this.numeroCalle !== "   ") {
        //&& this.domicilio.valid && this.ciudadSeleccionada !== "  " && this.nombreCalle !== "     " && this.numeroCalle !== "   "  &&
        return true
      }
      else if (this.selectorDomicilio === true) {
        return true
      }
      else{
        this.validacionImg = 'Se debe seleccionar una posición en el mapa'
        this.CreatePopover();
        return false
      }
    }else{
      return false
    }
    
  }
  confirmarPedido(){
    if (this.selectorDomicilio === false) {
      this.navCtc.navigateBack('/pantalla-confirmacion');
    }
    else{
      if (this.selectorDomicilio === true && this.marker) {
        console.log('Todavia falta');
        this.navCtc.navigateBack('/pantalla-confirmacion');
      }
      else{
        this.validacionImg = 'Se debe seleccionar una posición en el mapa'
        this.CreatePopover();
      }
    }

  }

}

