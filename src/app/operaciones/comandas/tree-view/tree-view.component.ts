import { Component, OnInit, ViewChild, Injectable } from '@angular/core';
import {
  TreeviewItem, TreeviewConfig, TreeviewHelper, TreeviewComponent,
  TreeviewEventParser, OrderDownlineTreeviewEventParser, DownlineTreeviewItem
} from 'ngx-treeview';
//Rxjs
import { take } from 'rxjs/operators';
//material
import { MatDialog } from '@angular/material/dialog';
//utils service
import { IsLoadingService } from '@service-work/is-loading';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { convertTimestamp } from 'convert-firebase-timestamp';
//database
import { DbComaOperationsService } from '../dbOperations/db-coma-operations.service';
//interface
import { OptionsMessageI } from '../../../shared/confirm-dialog/options-message-i';
import { OperacionI } from '../../config-local/dbOperations/operacion-i';
import { MesaOperacion } from '../../config-local/dbOperations/mesa-operacion';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-tree-view',
  templateUrl: './tree-view.component.html',
  styleUrls: ['./tree-view.component.css'],
  providers: [
    { provide: TreeviewEventParser, useClass: OrderDownlineTreeviewEventParser },
  ]
})

export class TreeViewComponent implements OnInit {
  operacion_Info: OperacionI[];
  subs_operacion: Subscription;
  mesas_info: MesaOperacion[];
  subs_mesas: Subscription;
  itemsTree: TreeviewItem[];
  comandas_pendientes: number;
  options_msg: OptionsMessageI = {title:"Pregunta", message:"", confirmText:"Si", cancelText:"No"};  
  @ViewChild(TreeviewComponent, { static: false }) treeviewComponent: TreeviewComponent;
  
  config: TreeviewConfig = {
    hasAllCheckBox: false,
    hasFilter: true,
    hasCollapseExpand: true,
    decoupleChildFromParent: true,
    maxHeight: 400,
    hasDivider: true
  };

  constructor( private dbOpers: DbComaOperationsService,
               private loadSvc: IsLoadingService,
               private dialog: MatDialog,
  ){}

  loadOperation(){
    const loadOpers = this.dbOpers.get_OpenCorteZ();
    this.loadSvc.add(loadOpers,{key:'Loading_treeview'});
    loadOpers.subscribe( res1 => {
      if (res1 != undefined && res1 != null && res1[0] != undefined ) {
        let id_oper: string = res1[0].id_operacion; 
        this.subs_operacion = this.dbOpers.get_OperacionInfo_Observable(id_oper).subscribe(
          res2 => { if (res2 != undefined) {
            this.operacion_Info = res2;
            this.subs_mesas = this.dbOpers.get_OperacionMesa_Observable(id_oper).subscribe(
              res3 => {                               
                if (res3 != undefined) {              
                  this.mesas_info = res3;                
                  this.itemsTree = this.getTreeOperacionInfo(this.operacion_Info, this.mesas_info)   
                }
            });
          }
        });
      } else {
        this.showErrorMessage("No se encontró corte Z con estado Abierto, Inicie una nueva Operacion en el módulo de Operaciones");
      }
    }, error => this.showErrorMessage(error));
  }

  ngOnInit(): void {
    this.loadOperation();
  }

  ngOnDestroy(): void {
    this.subs_operacion.unsubscribe();
    this.subs_mesas.unsubscribe();
  }
  
  getTreeOperacionInfo(operacion: OperacionI[], mesas_oper: MesaOperacion[]): TreeviewItem[] {
    let Cortez: string = `Corte Z: ${operacion[0].corteZ}`;
    let fecharegistro: string = convertTimestamp(operacion[0].fecha_registro).toLocaleDateString();
    fecharegistro = `Fecha: ${fecharegistro}`;
    let config: string = `Config: ${operacion[0].config_name}`;
    let mesas: string = `Mesas: ${operacion[0].mesas}`;
    let meseros: string = `Meseros: ${operacion[0].meseros}`;
    const OperacionInfo = new TreeviewItem({
      text: Cortez, value: 'corte', children: [
        { text: fecharegistro, value: 'fecha' },
        { text: config, value: 'config' },
        { text: mesas, value: 'mesas' },
        { text: meseros, value: 'meseros' }
      ]
    });
    const MesasOperacion = new TreeviewItem({
      text: "Mesas", value:"mesas", children:[
        {text:"", value:""}
      ]
    });
    if ( mesas_oper != undefined ) {
      if ( mesas_oper.length > 0 ) {        
        let pendiente:number
        mesas_oper.forEach(mesa=>{
          pendiente = 0
          pendiente = mesa.comandas - mesa.despachadas;
          let new_mesa = new TreeviewItem({          
            text: mesa.mesa_name, value: mesa.id_mesa,
            children: [
              { text: `Cliente: ${mesa.cliente_name}`, value:'cliente' },
              { text: `Mesero: ${mesa.mesero}`, value: mesa.id_mesero },
              { text: `Comandas: ${mesa.comandas}`, value: 'comanda' },
              { text: `Despachadas: ${mesa.despachadas}`, value: 'despachadas' },
              { text: `Pendientes: ${pendiente}`, value: 'pendientes' },
            ]
          })
          MesasOperacion.children.push(new_mesa);});    
          return [OperacionInfo, MesasOperacion]                 
       } else { return [MesasOperacion] }      
     } else { return [MesasOperacion] }
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
}
