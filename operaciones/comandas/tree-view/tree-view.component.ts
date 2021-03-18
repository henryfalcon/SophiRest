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

@Component({
  selector: 'app-tree-view',
  templateUrl: './tree-view.component.html',
  styleUrls: ['./tree-view.component.css'],
  providers: [
    { provide: TreeviewEventParser, useClass: OrderDownlineTreeviewEventParser },
  ]
})

export class TreeViewComponent implements OnInit {
  itemsTree: TreeviewItem[];
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
    const loadOpers = this.dbOpers.get_OpenCorteZ()
    this.loadSvc.add(loadOpers,{key:'Loading_treeview'})
    loadOpers.subscribe( res => {
      if (res != undefined) {
        let id_oper: string = res[0].id_operacion; 
        this.dbOpers.get_OperacionInfo_OperacionMesas(id_oper).subscribe(res=>{        
          this.itemsTree = this.getTreeOperacionInfo(res[0], res[1]);
        });        
      } else {
        this.showErrorMessage("No se encontró corte Z con estado Abierto, Inicie una nueva Operacion en el módulo de Operaciones");
      }
    });
  }

  ngOnInit(): void {
    this.loadOperation();
  }

  getTreeOperacionInfo(operacion: OperacionI, mesas_oper: MesaOperacion[]): TreeviewItem[] {
    let Cortez:string = `Corte Z: ${operacion.corteZ}`;
    let fecharegistro:string = convertTimestamp(operacion.fecha_registro).toLocaleDateString();
    fecharegistro = `Fecha: ${fecharegistro}`;
    let config:string = `Config: ${operacion.config_name}`;
    let mesas:string = `Mesas: ${operacion.mesas}`;
    let meseros:string = `Meseros: ${operacion.meseros}`;
    const OperacionInfo = new TreeviewItem({
      text: Cortez, value: 'corte', children: [
        { text: fecharegistro, value: 'fecha' },
        { text: config, value: '' },
        { text: mesas, value: '' },
        { text: meseros, value: '' }
      ]
    });
    const MesasOperacion = new TreeviewItem({
      text: "Mesas", value:"mesas", children:[
        {text:"", value:""}
      ]
    })
    //mesas 
    if ( mesas_oper != undefined ) {
      if ( mesas_oper.length > 0 ) {        
        mesas_oper.forEach(mesa=>{
          let new_mesa = new TreeviewItem({
            text: mesa.mesa_name, value: mesa.id_mesa,
            children: [
              { text: `Cliente: ${mesa.cliente_name}`, value:'cliente' },
              { text: `Mesero: ${mesa.mesero}`, value: mesa.id_mesero },
              { text: `Comandas: ${mesa.comandas}`, value: 'comanda' },
              { text: `Despachadas: ${mesa.despachadas}`, value: 'despachadas' },
              { text: `Pendientes: ${mesa.pendientes}`, value: 'pendientes' },
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
