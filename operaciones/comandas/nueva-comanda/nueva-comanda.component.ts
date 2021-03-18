import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormGroup, FormControl, FormGroupDirective, Validators } from '@angular/forms';
//Rxjs
import { take } from 'rxjs/operators';
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
import { global_Info_System_Service } from '../../../shared/utils/global_info.service';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { SnackNotisService } from '../../../shared/snackBarNotifications/snack-notis.service';
import { ModalComponent } from '../modal/modal.component';
//interface
import { MesaOperacion } from '../../../operaciones/config-local/dbOperations/mesa-operacion';
import { OptionsMessageI } from '../../../shared/confirm-dialog/options-message-i';
import { PlatilloI } from '../../../catalogos/platillo/dbOperations/platillo-i';
import { ThrowStmt } from '@angular/compiler';
import { formatCurrency } from '@angular/common';

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
  @ViewChild('paginator1', {static:true}) paginator1:MatPaginator;
  @ViewChild('paginator2', {static:true}) paginator2:MatPaginator;
  @ViewChild(MatSort, {static:true}) sort:MatSort;
  options_msg: OptionsMessageI = {title:"Pregunta", message:"", confirmText:"Si", cancelText:"No"};
  mesas: MesaOperacion[];
  selected_mesa: MesaOperacion;
  searchKey:string="";
  filterColumn:string="";
  platillos_dataSource=new MatTableDataSource();
  platSelected_dataSource=new MatTableDataSource();
  platSelectedArray: platillo_selected_I[];
  displayedColumns: string[]=['desc_corta', 'desc_larga', 'acompanamiento', 'precio', 'actions'];
  displayedColumns_platsSelected: string[]=['desc_larga', 'acompanamiento', 'cant', 'precio', 'subtotal', 'actions'];

  constructor( private dbOpers: DbComaOperationsService,
               private loadSvc: IsLoadingService, 
               private dialog: MatDialog,
               private global_info: global_Info_System_Service,
               private snackInfo: SnackNotisService
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

  nextStep() {
    this.step++;
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

  ngOnInit(): void {
    this.initializeFormGroup();
    this.loadMesas();
    this.loadPlatillos();
    this.inititalize_SelectedFood_dbSource();
  }

  loadPlatillos(): void {
    const loading_data = this.dbOpers.getPlatillos();
    this.loadSvc.add(loading_data, {key:"loading"})
    loading_data.subscribe( platillos => {this.platillos_dataSource.data = platillos;});
  }

  loadMesas():void {
    const loadcortez = this.dbOpers.get_OpenCorteZ();
    this.loadSvc.add(loadcortez, {key:"loading_comanda"})
    loadcortez.subscribe(z=>{
      const MesasOper = this.dbOpers.get_Operacion_Mesas(z[0].id_operacion);
      MesasOper.subscribe(mesa_oper => {
        this.mesas = mesa_oper
      });
    })
  }

  ngAfterViewInit():void {
    this.matselectMesa.valueChange.subscribe(value =>
      { this.formComanda1.patchValue({
          id_mesero: value.id_mesero,
          mesero_name: value.mesero_name
      })
    });
    this.platillos_dataSource.paginator = this.paginator1;
    this.platSelected_dataSource.paginator = this.paginator1
    this.platillos_dataSource.sort = this.sort;
    this.platillos_dataSource.filterPredicate = (data, filter) => (data['desc_larga'].trim().toLowerCase().indexOf(filter.trim().toLowerCase()) != -1);
  }

  ngOnDestroy():void {
    this.matselectMesa.valueChange.unsubscribe();  
    this.platillos_dataSource.disconnect();
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
    //onsubmit
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

  onDeleteSelectedPlatillo(plat: PlatilloI) {
    //
  }

  calculateTotal(){
    let calc_total:number = 0;
    this.platSelectedArray.forEach(plat => {
      calc_total+=plat.subtotal;
    })
    this.formComanda1.patchValue({total: formatCurrency(calc_total,"es_MX","$")})
  }

  addSelectedPlatillo(cant_param: number, observ_param: string, plat: PlatilloI){
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
        if (result.cant =! 0) {                  
          this.addSelectedPlatillo(result.qant, result.observacion, plat);
        }
      }
    });
  }
}


