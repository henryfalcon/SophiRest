import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormGroupDirective, Validators } from '@angular/forms';
//Rxjs
import { take } from 'rxjs/operators';
//database
import { DbComaOperationsService } from '../dbOperations/db-coma-operations.service';
//material
import { MatSelect } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
//utils service
import { IsLoadingService } from '@service-work/is-loading';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { SnackNotisService } from '../../../shared/snackBarNotifications/snack-notis.service';
//interface
import { MesaOperacion } from '../../../operaciones/config-local/dbOperations/mesa-operacion';
import { OptionsMessageI } from '../../../shared/confirm-dialog/options-message-i';
import { ComandaDetalleI } from '../dbOperations/comanda-detalle-i';

@Component({
  selector: 'app-cancelar-comanda',
  templateUrl: './cancelar-comanda.component.html',
  styleUrls: ['./cancelar-comanda.component.css']
})
export class CancelarComandaComponent implements OnInit {
  @ViewChild('matSelectMesa') matSelectMesa: MatSelect;
  options_msg: OptionsMessageI = {title:"Pregunta", message:"", confirmText:"Si", cancelText:"No"};
  id_operacion: string = '';
  mesas: MesaOperacion[];
  selected_mesa: MesaOperacion;
  platillos_dataSource=new MatTableDataSource();
  displayedColumns: string[]=['platillo', 'acompanamiento', 'observacion', 'actions'];


  constructor ( private dbOpers: DbComaOperationsService,
                private loadSvc: IsLoadingService, 
                private dialog: MatDialog,
                private snackInfo: SnackNotisService,            
  ) { }

  formComanda1: FormGroup = new FormGroup({  
    $key: new FormControl(null),  
    id_detalle: new FormControl(''), 
    id_mesa_oper: new FormControl(''),
    cliente_name: new FormControl(''),
  })

  initializeFormGroup(){
    this.formComanda1.setValue({
      $key: null,
      id_mesa_oper: '',
      id_detalle: '', 
      cliente_name: ''
    })
  }

  ngOnInit(): void {
    this.initializeFormGroup();
    this.loadMesas();
  }

  ngOnDestroy(): void {
    this.matSelectMesa.valueChange.unsubscribe();
    this.platillos_dataSource.disconnect();
    this.id_operacion='';
  }

  ngAfterViewInit():void {
    this.matSelectMesa.valueChange.subscribe(value => {
      if (value != null){
        this.formComanda1.patchValue ({
          id_mesa_oper: value.id_mesa_oper,
          id_detalle: value.id_detalle,        
          cliente_name: value.cliente_name
        });
      } this.loadPlatillosComanda();
    })
  }

  loadPlatillosComanda(){
    const id_mesa_oper = this.formComanda1.get('id_mesa_oper').value;
    const loading_data = this.dbOpers.get_Platillos_Despachar(id_mesa_oper, 'ORDENADO');
    this.loadSvc.add(loading_data, {key:"loading"})
    loading_data.subscribe( platillos => {this.platillos_dataSource.data = platillos;}, error => this.showErrorMessage(error));
  }

  loadMesas():void {
    const loadcortez = this.dbOpers.get_OpenCorteZ();
    this.loadSvc.add(loadcortez, {key:"loading"})
    loadcortez.subscribe(z=>{
      const MesasOper = this.dbOpers.get_Operacion_Mesas(z[0].id_operacion);
      MesasOper.subscribe(mesa_oper => {
        this.id_operacion = z[0].id_operacion;
        this.mesas = mesa_oper
      }, error => this.showErrorMessage(error));
    })
  }

  check_if_Cancel_All_Comanda(detalle: ComandaDetalleI){
    console.log('tabla length: ', this.platillos_dataSource.data.length);
    if (this.platillos_dataSource.data.length == 1) {
      this.dbOpers.cancel_Comanda(
        this.id_operacion, 
        detalle.id_mesa_oper, 
        detalle.id_comanda, 'CANCELADO')
      .then(()=>this.snackInfo.succes('Comanda Cancelada!'))
      .catch(error=>this.showErrorMessage('Error al Actualizar el status de la Comanda' + error));
    }
  }

  confirm_delete(detalle: ComandaDetalleI){
    this.options_msg.title = "Pregunta...";
    this.options_msg.confirmText = "Si";
    this.options_msg.cancelText = "No";
    this.options_msg.message="¿Desea eliminar el platillo?";
    this.dialog.open(ConfirmDialogComponent, {data: this.options_msg})
      .afterClosed().pipe(take(1)).subscribe(res=>{
          if (res) { 
            this.dbOpers.save_Platillo_sts(
              this.id_operacion,
              detalle.id_mesa_oper, 
              detalle.id_comanda,            
              detalle.id_detalle, 'CANCELADO');                 
              this.check_if_Cancel_All_Comanda(detalle);
          }
      });  
  }

  eliminar_platillo(element: ComandaDetalleI){
    this.confirm_delete(element);
  }
  isDataLoading(key_loading: string): boolean {
    return this.loadSvc.isLoading({key: key_loading})
  }

  onSubmit(formdirective: FormGroupDirective){
    //this.confirmComanda();
  }

  setDefaultConfirmDialogConfig(){
    this.options_msg.title = "Pregunta";
    this.options_msg.confirmText ="Yes";
    this.options_msg.isErrorMsg=false;
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
}
