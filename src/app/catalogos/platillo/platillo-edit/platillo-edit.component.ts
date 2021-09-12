import { Component, OnInit, Input, ViewChild, AfterViewInit, OnDestroy  } from '@angular/core';
//Reactive Forms
import { FormGroup, FormControl, FormGroupDirective, Validators, NgForm } from "@angular/forms";
//rxjs
import { take } from 'rxjs/operators';
//Services
import { DbOperationsService } from '../dbOperations/db-operations.service';
//Material
import { MatDialog } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { ErrorStateMatcher } from '@angular/material/core'
import { MatCheckbox } from '@angular/material/checkbox';
//utils services
import { IsLoadingService } from '@service-work/is-loading';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { SnackNotisService } from '../../../shared/snackBarNotifications/snack-notis.service';
// interfaces
import { PlatilloI } from '../dbOperations/platillo-i';
import { OptionsMessageI } from '../../../shared/confirm-dialog/options-message-i';
import { FoodCategory } from '../dbOperations/food-category';
import { Status } from '../dbOperations/status';
import { TiempoAlimento } from '../dbOperations/tiempo-alimento';

export class ValidationsMatcher implements ErrorStateMatcher{
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean{
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-platillo-edit',
  templateUrl: './platillo-edit.component.html',
  styleUrls: ['./platillo-edit.component.css']
})

export class PlatilloEditComponent implements OnInit, AfterViewInit, OnDestroy {
  options_msg: OptionsMessageI = {title:"Pregunta", message:"", confirmText:"Si", cancelText:"No"};
  categories: FoodCategory[];
  @Input() plat: PlatilloI; 
  @ViewChild('matSelect') matSelectStatus: MatSelect;
  @ViewChild('matSelectCatego') matSelectCatego: MatSelect;
  @ViewChild('matSelectTiempoAlimento') matSelectTAlim: MatSelect;
  @ViewChild('check_dashboard') matCheck_dashboard: MatCheckbox;
  status: Status[]=[
    {value:'Activo-0', viewValue: 'Activo'},
    {value:'Activo-1', viewValue: 'Inactivo'}
  ];
    tiempo_alimento: TiempoAlimento[]=[
    {value: 'Tiempo-1', viewValue: 'Desayuno'},
    {value: 'Tiempo-2', viewValue: 'Comida'},
    {value: 'Tiempo-3', viewValue: 'Cena'}
  ];
  selected_sts: string = "";
  imagen_selected: any = undefined;
  subIsUploadingPhoto: boolean=false;
  matcher = new ValidationsMatcher();
  
  get precio(){return this.editPlatForm.get('precio');}  

  constructor( private dbOperations: DbOperationsService,
    private loadSvc: IsLoadingService, 
    private dialog: MatDialog,
    private snackInfo: SnackNotisService ) { }

  public editPlatForm = new FormGroup({
    id: new FormControl(''),
    desc_corta: new FormControl('', Validators.required),
    desc_larga: new FormControl('', Validators.required),
    ingredientes: new FormControl(''),
    costo: new FormControl(''),
    precio: new FormControl('', Validators.required),
    status: new FormControl('', Validators.required),
    tiempo_prep: new FormControl('', Validators.required),
    guarnicion: new FormControl(''),
    acompanamiento: new FormControl(''),
    imagen: new FormControl(''),
    id_categoria: new FormControl(''),
    categoria: new FormControl(''),
    tiempo_alimento: new FormControl(''),
    dashboard: new FormControl(''),
  });    

  private initValuesForm(): void {
    this.editPlatForm.patchValue({
      id: this.plat.id,
      desc_corta: this.plat.desc_corta,
      desc_larga: this.plat.desc_larga,
      ingredientes: this.plat.ingredientes,
      costo: this.plat.costo,
      precio: this.plat.precio,
      status:  this.plat.status,
      tiempo_prep: this.plat.tiempo_prep,
      guarnicion: this.plat.guarnicion,
      acompanamiento: this.plat.acompanamiento,       
      imagen: this.plat.imagen,
      id_categoria: this.plat.id_categoria,
      categoria: this.plat.categoria,
      tiempo_alimento: this.plat.tiempo_alimento,
      dashboard: this.plat.dashboard
    })        
  }

  private LoadCategorias(){
    const loading_data = this.dbOperations.getFoodCategories()
    this.loadSvc.add(loading_data, {key:'edit-loading'});
    loading_data.subscribe(cats=> this.categories = cats, 
      error => { this.showErrorMessage( "FoodCategory Collection" + error)});
  }

  showErrorMessage(message: string){
    this.options_msg.title = "Ha ocurrido el siguiente Error:";
    this.options_msg.confirmText ="Ok";
    this.options_msg.isErrorMsg=true;
    this.options_msg.message = message;
    const dialogconfirm = this.dialog.open(ConfirmDialogComponent, {
      data: this.options_msg
    });
    dialogconfirm.afterClosed().subscribe(res=>this.setDefaultConfirmDialogConfig());
  }

  setDefaultConfirmDialogConfig(){
    this.options_msg.title = "Pregunta";
    this.options_msg.confirmText ="Yes";
    this.options_msg.isErrorMsg=false;
  }

  ngOnInit(): void {
    this.LoadCategorias();
    this.initValuesForm();
  }

  ngAfterViewInit() {  
    this.matSelectStatus.valueChange.subscribe(value => {        
         this.editPlatForm.patchValue({
           status: value.viewValue
         });
    });
    this.matSelectTAlim.valueChange.subscribe(value =>{
       this.editPlatForm.patchValue({
         tiempo_alimento: value.viewValue
       });
    })
    this.matSelectCatego.valueChange.subscribe(value=>{
      this.editPlatForm.patchValue({
        categoria: value.categoria,
        id_categoria: value.id_categoria         
      });
    });
    this.matCheck_dashboard.change.subscribe(value=>{
      this.editPlatForm.patchValue({
        dashboard: value.checked
      })
    })
  }  

  ngOnDestroy(): void {
    this.imagen_selected=undefined;
    this.matSelectStatus.valueChange.unsubscribe();
    this.matSelectCatego.valueChange.unsubscribe();
    this.matSelectTAlim.valueChange.unsubscribe();    
  }

  isDataLoading(key_loading: string): boolean {
    return this.loadSvc.isLoading({key: key_loading})
  } 

  confirm_Edit_Dialog() {
    this.options_msg.message="¿Confirma la Edición del Registro?";
    this.dialog.open(ConfirmDialogComponent, {data: this.options_msg})
      .afterClosed().pipe(take(1)).subscribe(res=>{
          if (res) { this.editPlatillo(); }
      });
  }

  editPlatillo(){
    if (this.editPlatForm.valid){
      const editing = this.dbOperations.editPlatilloById(this.editPlatForm.value);
      this.loadSvc.add(editing, {key:"edit-loading"});
      editing.then(()=> {this.snackInfo.succes(':: ¡Registro guardado!')})
             .catch(error=>this.showErrorMessage(error));}              
  }

  confirm_Edit_Photo() {
    this.options_msg.message="¿Confirma la Edición de la Imagen?";
    this.dialog.open(ConfirmDialogComponent, {data: this.options_msg})
      .afterClosed().pipe(take(1)).subscribe(res=>{
          if (res) { this.Edit_Photo_Platillo(); }
      });  
  }

  Edit_Photo_Platillo(){
    this.subIsUploadingPhoto=true;    
    const IsNewPhoto: boolean = (this.plat.imagen==="");  
    const editing =  this.dbOperations.editPhotoPlatillo(this.plat, this.imagen_selected, IsNewPhoto);
    this.loadSvc.add(editing, {key:"edit-loading"})
    editing.subscribe( 
      url=> { 
        if (url) { 
          let downloadurl: string= "";
          if (IsNewPhoto) { 
            downloadurl = url; }
          else { 
            downloadurl = url[1];
          }
          this.dbOperations.savePhotoUrl(this.plat.id, downloadurl)
          .then(()=>{          
              this.snackInfo.succes("¡Foto Editada!");
              this.editPlatForm.patchValue({fotografia: downloadurl});
              this.plat.imagen = downloadurl;
              this.subIsUploadingPhoto=false;})
          .catch(error => this.showErrorMessage(error));
        }
        else { 
          this.showErrorMessage("Error al subir la foto. No se pudo obtener la url");  
          this.subIsUploadingPhoto=false;
        }
      }, 
      error => { 
          this.showErrorMessage(error);  
          this.subIsUploadingPhoto=false;                 
          this.plat.imagen = "";
      });
  }

  selectFile(event:any):void {
    this.imagen_selected=event.target.files[0];
    this.confirm_Edit_Photo();
  }

  compareFuncStatus(sts1: any, sts2: any){
    return sts1.viewValue === sts2;
  }

  compareFuncCategory(cat1: any, cat2: any){
    return cat1.id_categoria === cat2;
  }

  compareFuncTiempoAlimento(t1: any, t2: any){
    return t1.viewValue === t2;
  }

  // confirmToDashBoard() {
  //   if (this.plat.imagen != ""){
  //     this.options_msg.message="¿Confirma la visualización en DashBoard?";
  //     this.dialog.open(ConfirmDialogComponent, {data: this.options_msg})
  //       .afterClosed().pipe(take(1)).subscribe(res=>{
  //           if (res) { this.editPlatillo(); }
  //       });  
  //   }
  // }
}
