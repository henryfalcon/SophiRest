import { Component, OnInit, Input, ViewChild, Inject } from '@angular/core';
//Services
import { DbCocinaOpersService } from '../dbOperations/db-cocina-opers.service';
//Reactive Forms
import { FormGroup, FormControl, Validators, FormGroupDirective } from '@angular/forms';
//utils services
import { IsLoadingService } from '@service-work/is-loading';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { SnackNotisService } from '../../../shared/snackBarNotifications/snack-notis.service';
// interfaces
import { OptionsMessageI } from '../../../shared/confirm-dialog/options-message-i';
import { ComandaI } from '../../comandas/dbOperations/comanda';
import { ComandaDetalleI } from '../../comandas/dbOperations/comanda-detalle-i';
//Material
import { MatDialog } from '@angular/material/dialog';
import { MatList } from '@angular/material/list';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

//Rxjs
import { take } from 'rxjs/operators';
import { PlatilloI } from 'src/app/catalogos/platillo/dbOperations/platillo-i';

@Component({
  selector: 'app-cocina-comanda',
  templateUrl: './cocina-comanda.component.html',
  styleUrls: ['./cocina-comanda.component.css']
})
export class CocinaComandaComponent implements OnInit {
  options_msg: OptionsMessageI = {title:"Pregunta", message:"", confirmText:"Si", cancelText:"No"};
  @Input() comanda: ComandaI;
  @ViewChild('list_detalle') matSelectList: MatList;
  comanda_detalle: ComandaDetalleI[];
  id_operacion: string = "";
  status_comanda: string = "";
  
  constructor(
    @Inject(MAT_DIALOG_DATA) public data:OptionsMessageI,
    private dialogRef: MatDialogRef<CocinaComandaComponent>,
    private comDataServ: DbCocinaOpersService,
    private loadSvc: IsLoadingService,
    private dialog: MatDialog,
    private snackInfo: SnackNotisService ) { }

  public comandaForm = new FormGroup({
    id: new FormControl(''),
    mesa_name: new FormControl(''),
    mesero: new FormControl(''),
    cliente_name: new FormControl('')
  })

  private initValuesForm(): void {  
      this.comandaForm.patchValue({
        id: this.comanda.id_comanda,
        mesa_name: this.comanda.mesa_name,
        mesero: this.comanda.mesero,
        cliente_name: this.comanda.cliente_name
      })
      this.status_comanda = "";
  }

  private get_CorteZ_Operacion(){
    const loadcortez = this.comDataServ.get_OpenCorteZ();
    this.loadSvc.add(loadcortez, {key:"comanda_loading"})
    loadcortez.subscribe(z => { 
      if (z != null) {
        if (z[0].estado == "Abierto"){
          this.id_operacion = z[0].id_operacion;
          this.getComandaDetalle(z[0].id_operacion)
        }
        else {
          this.showErrorMessage("No se encuentra el id operativo abierto. Consulte con el administrador del sistema")
        }
      }
      else {
        this.showErrorMessage("No se encuentra el id operativo abierto. Consulte con el administrador del sistema")
      }
    })    
  }

  private getComandaDetalle(id_operacion: string): void {
    const loading_data = this.comDataServ.get_Comandas_Detalle(this.comanda.id_comanda);
    this.loadSvc.add(loading_data, {key:"comanda_loading"});
    loading_data.subscribe( detalle => this.comanda_detalle = detalle, 
      error => { this.showErrorMessage( "Comandas Detalle Collection " + error)});
  }

  ngOnInit(): void {
    if (this.comanda != undefined){
      this.initValuesForm();
      this.get_CorteZ_Operacion();
    }
  }

  listDetalleSelected(itemselected: ComandaDetalleI){
    this.comanda_detalle.forEach(plat => {
      if (plat.id_platillo == itemselected.id_platillo){
        if (itemselected.status=="DESPACHAR"){
          plat.status = "ORDENADO";
        } else {
          plat.status = "DESPACHAR";
        }
      }
    })
  }

  ngAfterViewInit(): void {
    //
  }

  isDataLoading(key_loading: string): boolean {
    return this.loadSvc.isLoading({key: key_loading})
  }

  showComandaSavedMessage(){
    this.options_msg.title="Comanda Guardada";
    this.options_msg.confirmText="Enviar";
    this.options_msg.isErrorMsg=true;
    this.options_msg.message = "Envié el platillo al cliente";
    const dialogconfirm = this.dialog.open(ConfirmDialogComponent, {
      data: this.options_msg
    });
    dialogconfirm.afterClosed().pipe(take(1)).subscribe(res=>this.dialogRef.close());    
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

  confirmParcialComanda() {
    this.options_msg.message="¿Hay platillos sin seleccionar, ¿Desea dejar la comanda con pendientes por despachar?";
    this.options_msg.isErrorMsg=false;
    this.dialog.open(ConfirmDialogComponent, {data: this.options_msg})
      .afterClosed().pipe(take(1)).subscribe(
        res =>{
          if (res){ 
            this.status_comanda = "PARCIAL"
            this.guardar_Comanda();            
          }
          else {
            this.status_comanda = "DESPACHAR"
          }
        });
  }

  guardar_Comanda(){
    const id_operacion: string = this.id_operacion;
    const id_mesa_operacion: string = this.comanda.id_mesa_oper
    const id_comanda: string = this.comanda.id_comanda;

    const saving_comanda = this.comDataServ.despachar_Comandas_Detalle(
      id_operacion, 
      id_mesa_operacion, 
      id_comanda, 
      this.comanda_detalle,
      this.status_comanda
    );
     this.loadSvc.add(saving_comanda, {key:"comanda_loading"});
     saving_comanda.then(()=> {
       this.showComandaSavedMessage();
    }).catch(erorr=>this.showErrorMessage(erorr));      
  }

  validarSeleccionPlatillosComanda(): boolean{
    this.status_comanda = "";
    if (this.comanda_detalle.length == 1) {
      if (this.comanda_detalle[0].status =='ORDENADO') {
        this.showErrorMessage("¡Seleccione el platillo para despacharlo!");
        return false;
      } else {
        this.status_comanda = "DESPACHAR"
        return true;
      }
    }   
    else {
      let sin_despachar: boolean = false;
      this.comanda_detalle.forEach(plat => {
        if (plat.status == 'ORDENADO'){
          sin_despachar = true;
        }
      })
      if (sin_despachar) {
        this.confirmParcialComanda();
        return false;
      } 
      else {
        return true;
      }
    }
  }

  despachar_Comanda_Dialog(){
    if (this.validarSeleccionPlatillosComanda()) {
      this.options_msg.message="¿Confirma despachar la Comanda?";
      this.options_msg.isErrorMsg=false;
      this.dialog.open(ConfirmDialogComponent, {data: this.options_msg})
        .afterClosed().pipe(take(1)).subscribe(res=>{
            if (res) { this.guardar_Comanda();}
        });
    }
  }
}
