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
  selector: 'app-despachar-comanda',
  templateUrl: './despachar-comanda.component.html',
  styleUrls: ['./despachar-comanda.component.css']
})
export class DespacharComandaComponent implements OnInit {
  @ViewChild('matSelectMesa') matSelectMesa: MatSelect

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

d

  ngAfterViewInit():void {
    this.matSelectMesa.valueChange.subscribe(value => {
      if (value != null){
        this.formComanda1.patchValue ({
          id_mesa_oper: value.id_mesa_oper,
          id_detalle: value.id_detalle,        
          cliente_name: value.cliente_name
        });
      }
      this.loadPlatillosComanda();
    })
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

   loadPlatillosComanda(){
    const id_mesa_oper = this.formComanda1.get('id_mesa_oper').value;
    const loading_data = this.dbOpers.get_Platillos_Despachar(id_mesa_oper, 'DESPACHAR');
    this.loadSvc.add(loading_data, {key:"loading"})
    loading_data.subscribe( platillos => {this.platillos_dataSource.data = platillos}, error => this.showErrorMessage(error));
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

  get_and_Update_status_comanda(id_comanda:string, id_mesa:string) {
    this.dbOpers.get_status_comanda(this.id_operacion, id_mesa, id_comanda, ).subscribe(res=>{
      console.log('Sts comanda:' + res.status)
      if (res != null){
        if (res.status="DESPACHAR") {
          const save_comanda_sts = this.dbOpers.save_Status_Comanda(this.id_operacion, id_mesa, id_comanda, 'DESPACHADO')
          this.loadSvc.add(save_comanda_sts, {key:'loading'});
          save_comanda_sts.then().catch(error=>this.showErrorMessage("Error al guardar el status de la comanda: " + error))
        }
      }
    }, error=> {this.showErrorMessage("Error al obtener el estatus de la comanda: " + error)}
    );
  }

  despachar_plato(element: ComandaDetalleI){
    const save_detalle = this.dbOpers.save_Despachar_Detalle_Comanda (
        this.id_operacion,
        element.id_mesa_oper,
        element.id_comanda,
        element.id_detalle
    );
    this.loadSvc.add(save_detalle, {key:"loading"});
    save_detalle.then(()=> {
      this.snackInfo.succes("¡Platillo Servido, provecho para el cliente!");
      if (this.platillos_dataSource.data.length==0){
        this.get_and_Update_status_comanda(element.id_comanda, element.id_mesa_oper);
      }
    }
    ).catch(error=>this.showErrorMessage("Error al guardar el detalle de la comanda: " + error));
  }
}
