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
import { OptionsMessageI } from '../../../shared/confirm-dialog/options-message-i';
import { PlatilloI } from '../dbOperations/platillo-i';

@Component({
  selector: 'app-platillo-list',
  templateUrl: './platillo-list.component.html',
  styleUrls: ['./platillo-list.component.css']
})
export class PlatilloListComponent implements OnInit, AfterViewInit, OnDestroy {
  user_role:string="";
  searchKey:string="";
  filterColumn:string="";
  dataSource=new MatTableDataSource();
  displayedColumns: string[]=['desc_corta', 'desc_larga', 'acompanamiento', 'costo', 'precio', 'status', 'actions'];
  options_msg: OptionsMessageI = {title:"Pregunta", message:"", confirmText:"Si", cancelText:"No", isErrorMsg:false};
  @ViewChild(MatPaginator, {static:true}) paginator:MatPaginator;
  @ViewChild(MatSort, {static:true}) sort:MatSort;

  constructor( private loadSvc: IsLoadingService,
               private user_info: global_Info_System_Service,
               private dialog: MatDialog,
               private db_platillo: DbOperationsService,
               private snackInfo: SnackNotisService ){}  

    ngOnInit(): void {
      const loading_data = this.db_platillo.getPlatillos();
      this.loadSvc.add(loading_data, {key:"loading"})
      loading_data.subscribe( platillos => {this.dataSource.data = platillos;});
      if (this.user_info.get_user_info_service != undefined){
        this.user_role = this.user_info.get_user_info_service.role
      }
    }

    ngOnDestroy(): void {
      this.dataSource.disconnect();
    }

    ngAfterViewInit(){
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.dataSource.filterPredicate = (data, filter) => (data['desc_larga'].trim().toLowerCase().indexOf(filter.trim().toLowerCase()) != -1);
    }

    openDialog(plat?: PlatilloI):void{
      const config = {
        data: {
          toForm: plat ? 'edit_Platillo' : 'new_Platillo',
          message: plat ? 'Editar Platillo' : 'Nuevo Platillo',
          content: plat
        }
      };
      const dialogRef = this.dialog.open(ModalComponent, config);
      dialogRef.afterClosed().pipe(take(1)).subscribe(result => {
        console.log("close");
      });
    }

    onNewPlatillo(){
      this.openDialog();   
    }    

    onEditPlatillo(plat: PlatilloI){
      this.openDialog(plat);
    }

    onDeletePlatillo(plat: PlatilloI) {
      const deleting = this.db_platillo.deletePlatillo(plat)
      this.loadSvc.add(deleting, {key:'loading'})
      .then(() => {this.snackInfo.succes('¡Registro eliminado!');})
      .catch(error => {this.showErrorMessage(error)});
    }

    confirm_Delete_Dialog(plat: PlatilloI): void {
      this.options_msg.message="¿Desea Eliminar el Registro?";
      this.options_msg.isErrorMsg=false;
      this.dialog.open(ConfirmDialogComponent, {data: this.options_msg})
        .afterClosed().pipe(take(1)).subscribe(res=>{
            if (res) { this.onDeletePlatillo(plat); }
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

    isDataLoading(key_loading: string): boolean {
      return this.loadSvc.isLoading({key: key_loading});
    }

    applyFilter(){
      this.dataSource.filter = this.searchKey.trim().toLocaleLowerCase();    
    }
  
    onSearchClear(){
      this.searchKey = "";
      this.applyFilter();
    }    
}
