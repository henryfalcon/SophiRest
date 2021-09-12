import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
//rxjs
import { take } from 'rxjs/operators';
//material
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
//database service
import { DbOperationsService } from '../dbOperations/db-operations.service';
import { global_Info_System_Service } from '../../../shared/utils/global_info.service';
//utils services
import { IsLoadingService } from '@service-work/is-loading';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { ModalComponent } from '../modal/modal.component';
import { SnackNotisService } from '../../../shared/snackBarNotifications/snack-notis.service';
//interfaces
import { PuestoI } from '../dbOperations/puesto-i';
import { OptionsMessageI } from '../../../shared/confirm-dialog/options-message-i';

@Component({
  selector: 'app-puesto-list',
  templateUrl: './puesto-list.component.html',
  styleUrls: ['./puesto-list.component.css']
})

export class PuestoListComponent implements OnInit, AfterViewInit, OnDestroy {
  user_role:string="";
  searchKey:string="";
  filterColumn:string="";
  dataSource=new MatTableDataSource();
  displayedColumns: string[] = ['puesto', 'departamento', 'formacion', 'actions'];
  options_msg: OptionsMessageI = {title:"Pregunta", message:"", confirmText:"Si", cancelText:"No", isErrorMsg:false};
  @ViewChild(MatPaginator, {static:true}) paginator:MatPaginator;
  @ViewChild(MatSort, {static:true}) sort:MatSort;

  constructor( private loadSvc: IsLoadingService,
    private user_info: global_Info_System_Service,
    private dialog: MatDialog,
    private db_puesto: DbOperationsService,
    private snackInfo: SnackNotisService ){}  

    private LoadPuestos():void {
      const load_puestos = this.db_puesto.getPuestos();
      this.loadSvc.add(load_puestos, {key: "loading"});
      load_puestos.subscribe(puestos => {this.dataSource.data= puestos;}, 
        error => {this.showErrorMessage(error);});
    }

    ngOnInit(): void {
      this.LoadPuestos();
      if (this.user_info.get_user_info_service != undefined) {
        this.user_role = this.user_info.get_user_info_service.role;
      }
    }

    ngAfterViewInit(){
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.dataSource.filterPredicate = (data, filter) => (data['puesto'].trim().toLowerCase().indexOf(filter.trim().toLowerCase()) != -1);
    }

    ngOnDestroy(): void {
      this.dataSource.disconnect();
    }
  
    onSearchClear(){
      this.searchKey = "";
      this.applyFilter();
    }
  
    applyFilter(){
      this.dataSource.filter = this.searchKey.trim().toLocaleLowerCase();    
    }
  
    isDataLoading(key_loading: string): boolean {
      return this.loadSvc.isLoading({key: key_loading});
    }
  
    onNewPuesto(){
      this.openDialog();
    }
  
    onEditPuesto(puesto: PuestoI){
      this.openDialog(puesto);
    }
  
    openDialog(puesto?: PuestoI):void{
      const config = { data:{
          toForm: puesto? 'edit_Puesto': 'new_Puesto',
          message: puesto? 'Editar Puesto': 'Nuevo Puesto',
          content: puesto }};
  
      const dialogRef = this.dialog.open(ModalComponent, config);
      dialogRef.afterClosed().pipe(take(1)).subscribe(result=>{
        console.log("close");
      });
    }
  
    DeletePuesto(puesto: PuestoI){
      const deleting = this.db_puesto.deletePuesto(puesto);
      this.loadSvc.add(deleting, {key:"loading"})
        .then(() => {this.snackInfo.succes('¡Registro eliminado!');})
        .catch(error => {this.showErrorMessage(error)});
    }
  
    confirm_Delete_Dialog(puesto: PuestoI): void {
      this.options_msg.message="¿Desea Eliminar el Registro?";
      this.options_msg.isErrorMsg=false;
      this.dialog.open(ConfirmDialogComponent, {data: this.options_msg})
        .afterClosed().pipe(take(1)).subscribe(res=>{
            if (res) { this.DeletePuesto(puesto); }
        });
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
