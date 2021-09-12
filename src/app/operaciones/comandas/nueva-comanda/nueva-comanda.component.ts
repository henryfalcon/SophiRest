import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormGroup, FormControl, FormGroupDirective, Validators } from '@angular/forms';
//Rxjs
import { take, delay, startWith, concatAll } from 'rxjs/operators';
//material
import { MatSelect } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
//database
import { DbComaOperationsService } from '../dbOperations/db-coma-operations.service';
//utils service
import { IsLoadingService } from '@service-work/is-loading';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { SnackNotisService } from '../../../shared/snackBarNotifications/snack-notis.service';
import { ModalComponent } from '../modal/modal.component';
//interface
import { EmployeeI } from '../../../catalogos/employee/dbOperations/employee-i';
import { MesaOperacion } from '../../../operaciones/config-local/dbOperations/mesa-operacion';
import { OptionsMessageI } from '../../../shared/confirm-dialog/options-message-i';
import { PlatilloI } from '../../../catalogos/platillo/dbOperations/platillo-i';
import { formatCurrency } from '@angular/common';
//menu
import { MenuOperations } from '../toolbar-menu/menu-operations'

export interface platillo_selected_I {
  id_platillo: string,
  plat_desc_larga: string,
  acompanamiento: string,
  cant: number,
  precio: number,
  subtotal: number,
  observacion?: string
}

@Component({
  selector: 'app-nueva-comanda',
  templateUrl: './nueva-comanda.component.html',
  styleUrls: ['./nueva-comanda.component.css']
})

export class NuevaComandaComponent implements OnInit {
  @ViewChild('matSelectMesa') matselectMesa: MatSelect;
  @ViewChild('matSelectMesero') matselectMesero: MatSelect;
  @ViewChild('paginator1', {static:true}) paginator1:MatPaginator;
  @ViewChild('paginator2', {static:true}) paginator2:MatPaginator;
  @ViewChild(MatSort, {static:true}) sort:MatSort;
  options_msg: OptionsMessageI = {title:"Pregunta", message:"", confirmText:"Si", cancelText:"No"};
  mesas: MesaOperacion[];
  meseros: EmployeeI[];
  selected_mesa: MesaOperacion;
  selected_mesa_mesero: string = ""
  searchKey:string="";
  filterColumn:string="";
  public comanda_completed:boolean=false;
  platillos_dataSource=new MatTableDataSource();
  platSelected_dataSource=new MatTableDataSource();
  platSelectedArray: platillo_selected_I[];
  displayedColumns: string[]=['desc_corta', 'desc_larga', 'acompanamiento', 'precio', 'actions'];
  displayedColumns_platsSelected: string[]=['desc_larga', 'acompanamiento', 'cant', 'precio', 'subtotal', 'actions'];

  constructor( private dbOpers: DbComaOperationsService,
               private loadSvc: IsLoadingService, 
               private dialog: MatDialog,          
               private snackInfo: SnackNotisService,
               private menu_items: MenuOperations
             ) {  }

  formComanda1: FormGroup = new FormGroup({  
    $key: new FormControl(null),  
    id_mesero: new FormControl(''),
    mesero_name: new FormControl(''),
    id_cliente: new FormControl(''),
    cliente_name: new FormControl(''),
    status: new FormControl(''),
    total: new FormControl(0, Validators.required),
  })

  step = 0;

  setStep(index: number) {
    this.step = index;
  }

  validaDatosFinComanda(){
    if (this.matselectMesa.value != undefined) {
      if (this.matselectMesero.value != undefined) {
        if (this.formComanda1.controls['cliente_name'].value != "" ) {      
          if (Number.parseInt(this.formComanda1.controls['total'].value) != 0 ) {
            this.comanda_completed=true;
          }
        }
      }
    }
  }

  nextStep() {
    this.step++;
    this.validaDatosFinComanda()
  }

  prevStep() {
    this.step--;
  }

  initializeFormGroup(){
    this.formComanda1.setValue({
      $key: null,
      id_mesero: '',
      mesero_name: '',
      id_cliente: '',
      cliente_name: '',
      status: '',
      total:0
    })
  }

  inititalize_SelectedFood_dbSource(){
    this.platSelectedArray=[];
    this.platSelected_dataSource.data = this.platSelectedArray;
    this.platSelected_dataSource._updateChangeSubscription();
  }

  loadMeseros(){
    const loading_data = this.dbOpers.get_Meseros();
    this.loadSvc.add(loading_data, {key:"loading_comanda"})
    loading_data.subscribe( meseros => {this.meseros = meseros}, error => this.showErrorMessage(error));
  }

  ngOnInit(): void {
    this.initializeFormGroup();
    this.loadPlatillos();
    this.loadMeseros();
    this.loadMesas();    
    this.inititalize_SelectedFood_dbSource();
  }

  loadPlatillos(): void {
    const loading_data = this.dbOpers.getPlatillos();
    this.loadSvc.add(loading_data, {key:"loading"})
    loading_data.subscribe( platillos => {this.platillos_dataSource.data = platillos}, error => this.showErrorMessage(error));
  }

  loadMesas():void {
    const loadcortez = this.dbOpers.get_OpenCorteZ();
    this.loadSvc.add(loadcortez, {key:"loading_comanda"})
    loadcortez.subscribe(z=>{
      if (z != undefined && z[0] != undefined){
        const MesasOper = this.dbOpers.get_Operacion_Mesas(z[0].id_operacion);
        MesasOper.subscribe(mesa_oper => {
          this.mesas = mesa_oper
        }, error => this.showErrorMessage(error));
      }
    })
  }

  ngAfterViewInit():void {
    
    this.matselectMesa.valueChange.subscribe(value => {
      this.selected_mesa = value
      this.formComanda1.patchValue({
        id_mesero: value.id_mesero,
        mesero_name: value.mesero });
    });
    
    setTimeout(() => {
      this.menu_items.selectedMenu.subscribe(sel_menu => {
        switch(sel_menu) {
          case 'new_Comanda': {
            this.CleanForm();
            break; 
          }
        }
      });  
    });
    
    this.platillos_dataSource.paginator = this.paginator1;
    this.platSelected_dataSource.paginator = this.paginator1
    this.platillos_dataSource.sort = this.sort;
    this.platillos_dataSource.filterPredicate = (data, filter) => (data['desc_larga'].trim().toLowerCase().indexOf(filter.trim().toLowerCase()) != -1);
  }

  ngOnDestroy():void {
    this.matselectMesa.valueChange.unsubscribe();  
    this.platillos_dataSource.disconnect();
    //this.menu_items.selectedMenu.unsubscribe();
  }

 isDataLoading(key_loading: string): boolean {
    return this.loadSvc.isLoading({key: key_loading})
  }
 
  showErrorMessage(message: string){
    this.options_msg.title = "Ha ocurrido el siguiente Error:";
    this.options_msg.confirmText ="Ok";
    this.options_msg.isErrorMsg=true;
    this.options_msg.message = message;
    const dialogconfirm = this.dialog.open(ConfirmDialogComponent, {
      data: this.options_msg
    });
    dialogconfirm.afterClosed().pipe(take(1)).subscribe(res=>this.setDefaultConfirmDialogConfig());
  }

  setDefaultConfirmDialogConfig(){
    this.options_msg.title = "Pregunta";
    this.options_msg.confirmText ="Yes";
    this.options_msg.isErrorMsg=false;
  } 

  onSubmit(formdirective: FormGroupDirective){
    //this.confirmComanda();
  }

  confirmComanda() {
      this.options_msg.title = "Pregunta...";
      this.options_msg.confirmText = "Si";
      this.options_msg.cancelText = "No";
      this.options_msg.message="¿Confirma la comanda?... !Se enviará a producción!";
      this.dialog.open(ConfirmDialogComponent, {data: this.options_msg})
        .afterClosed().pipe(take(1)).subscribe(res=>{
            if (res) { 
              this.guardar_NewComanda();
            }
        });  
  }

  guardar_NewComanda(){
    let operacion_id: string = this.selected_mesa.id_operacion;
    let id_mesa_operacion: string = this.selected_mesa.id_mesa_oper;
    let mesa_name: string = this.selected_mesa.mesa_name;
    let id_mesa: number = this.selected_mesa.id_mesa;
    let id_mesero: string = this.formComanda1.get('id_mesero').value;
    let mesero: string = this.formComanda1.get('mesero_name').value;
    let cliente_name: string = this.formComanda1.get('cliente_name').value
    
    const saving_comanda = this.dbOpers.save_NewComanda(
      operacion_id, 
      id_mesa_operacion, 
      id_mesa, 
      mesa_name, 
      id_mesero, 
      mesero, 
      cliente_name, 
      this.platSelectedArray );
    
      this.loadSvc.add(saving_comanda, {key:'loading_comanda'});
    saving_comanda.then(()=> {
      this.snackInfo.succes("¡Comanda Guardada. Se envía la orden a produccion!");
      this.CleanForm();
      //avisar que se ha modificado la informacion de mesa al treeview
      this.dbOpers.new_Info_MesaOperacion.next({id_oper:operacion_id, id_mesa:id_mesa_operacion});
    })
    .catch(erorr=>this.showErrorMessage(erorr));
  }

  CleanForm(){
    this.inititalize_SelectedFood_dbSource();
    this.initializeFormGroup();
    this.matselectMesa.value='';
    this.comanda_completed=false;
  }
    
  onSearchClear(){
    this.searchKey = "";
    this.applyFilter();
  }   

  applyFilter(){
    this.platillos_dataSource.filter = this.searchKey.trim().toLocaleLowerCase();    
  }

  onAddPlatillo(plat: PlatilloI){
    this.confirm_Cant_Observ(plat);
  }

  onDeleteSelectedPlatillo(plat: platillo_selected_I) {
    let a = 0;
    console.log("plat: " + plat )
    this.platSelectedArray.forEach(plats => {
      console.log("plats: " + plats.id_platillo)
      if (plat.id_platillo == plats.id_platillo) {
        this.platSelectedArray.splice(a,1);
      }
      a++;
    });
    this.calculateTotal();
    this.platSelected_dataSource._updateChangeSubscription();
  }

  calculateTotal(){
    let calc_total:number = 0;
    this.platSelectedArray.forEach(plat => {
      calc_total+=plat.subtotal;
    })
    if (calc_total == 0) {
      this.comanda_completed=false;
      this.formComanda1.patchValue({total: '0.00'})
    } 
    else {
      this.formComanda1.patchValue({total: formatCurrency(calc_total,"es_MX","$")})
    }
  }

  addSelectedPlatillo(cant_param: number, observ_param: string, plat: PlatilloI){
    if (cant_param != 0) {
      const new_platillo_sel: platillo_selected_I = {
        id_platillo: plat.id,
        plat_desc_larga: plat.desc_larga,
        acompanamiento: plat.acompanamiento,
        cant: cant_param,
        precio: plat.precio,
        subtotal: cant_param * plat.precio,    
        observacion: observ_param
      }
      this.platSelectedArray.push(new_platillo_sel);
      this.platSelected_dataSource._updateChangeSubscription();
      this.calculateTotal();
      this.snackInfo.succes("Platillo Añadido en Alimentos Seleccionados");
    }
  }

  confirm_Cant_Observ(plat: PlatilloI):void {
    const config = {
      data: {
        toForm: 'cant-observ',
        title: 'Presione Esc para salir',
        message: 'Especifique Cantidad y Observacion',
      }
    };
    const dialogRef = this.dialog.open(ModalComponent, config);
    dialogRef.afterClosed().pipe(take(1)).subscribe(result => {
      if (result != undefined) {              
          this.addSelectedPlatillo(result.cant2, result.observacion, plat);      
      }
    });
  }

  compareFuncMesero(mesero1: any,  mesero2: any){
    return mesero1 && mesero2 && mesero1.id == mesero2;
  }
}