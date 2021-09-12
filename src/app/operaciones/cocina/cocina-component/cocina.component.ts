import { Component, OnInit, ViewChild } from '@angular/core';
//utils service
import { IsLoadingService } from '@service-work/is-loading';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { ModalComponent } from '../modal/modal.component';
//material
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
//database service
import { DbCocinaOpersService } from '../dbOperations/db-cocina-opers.service';
import { global_Info_System_Service } from '../../../shared/utils/global_info.service';
//interfaces
import { OptionsMessageI } from '../../../shared/confirm-dialog/options-message-i';
import { ComandaI } from '../../comandas/dbOperations/comanda';
//rxjs
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-cocina',
  templateUrl: './cocina.component.html',
  styleUrls: ['./cocina.component.css']
})

export class CocinaComponent implements OnInit {
  user_role:string="";
  searchKey:string="";
  filterColumn:string="";
  dataSource=new MatTableDataSource();
  displayedColumns: string[] = ['mesa_name', 'mesero', 'cliente_name', 'status', 'hora_solicitado', 'actions'];
  options_msg: OptionsMessageI = {title:"Pregunta", message:"", confirmText:"Si", cancelText:"No", isErrorMsg:false};

  @ViewChild(MatPaginator, {static:true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static:true}) sort: MatSort;

  constructor(
    private loadSvc: IsLoadingService, 
    private user_info: global_Info_System_Service,
    private db_opers: DbCocinaOpersService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    const cortez = this.db_opers.get_OpenCorteZ();
    cortez.subscribe(z=>{
      if (z!=null){
        const load_comandas = this.db_opers.get_Comandas(z[0].id_operacion);
        this.loadSvc.add(load_comandas, {key: "loading"});      
        load_comandas.subscribe(comandas => {
          this.dataSource.data = comandas;
        }, error => {this.showErrorMessage(error);});
        if (this.user_info.get_user_info_service != undefined){
          this.user_role = this.user_info.get_user_info_service.role;
        }  
      }
    }, error => { this.showErrorMessage(error);})
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

  ngAfterViewInit(){
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = (data, filter) => (data['cliente'].trim().toLowerCase().indexOf(filter.trim().toLowerCase()) != -1);
  }

  isDataLoading(key_loading: string): boolean {
    return this.loadSvc.isLoading({key: key_loading})
  }

  onSearchClear(){
    this.searchKey = "";
    this.applyFilter();
  } 

  applyFilter(){
    this.dataSource.filter = this.searchKey.trim().toLocaleLowerCase();    
  }

  onDespachar(comanda: ComandaI){
    this.openDialog(comanda);
  }

  openDialog(com?: ComandaI):void{
    const config = { data:{
        toForm: 'comanda_detalle',
        message: 'Despachar Comanda',
        content: com }};

    const dialogRef = this.dialog.open(ModalComponent, config);
    dialogRef.afterClosed().pipe(take(1)).subscribe(result=>{
      console.log("close");
    });
  }

  confirm_Delete_Dialog(comanda: ComandaI): void {

  }
}
