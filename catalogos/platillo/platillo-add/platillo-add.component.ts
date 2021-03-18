import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
//Reactive Forms
import { FormGroup, FormControl, FormGroupDirective, Validators, NgForm } from "@angular/forms";
//Rxjs
import { take } from 'rxjs/operators';
//Services
import { DbOperationsService } from '../dbOperations/db-operations.service';
//Material
import { MatSelect } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { ErrorStateMatcher } from '@angular/material/core'
//utils services
import { IsLoadingService } from '@service-work/is-loading';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { SnackNotisService } from '../../../shared/snackBarNotifications/snack-notis.service';
//interfaces
import { FoodCategory } from '../dbOperations/food-category';
import { Status } from '../dbOperations/status';
import { TiempoAlimento } from '../dbOperations/tiempo-alimento';
import { OptionsMessageI } from '../../../shared/confirm-dialog/options-message-i';

export class ValidationsMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-platillo-add',
  templateUrl: './platillo-add.component.html',
  styleUrls: ['./platillo-add.component.css']
})

export class PlatilloAddComponent implements OnInit, AfterViewInit {
  options_msg: OptionsMessageI = {title:"Pregunta", message:"", confirmText:"Si", cancelText:"No"};
  status: Status[] = [{ value: 'Activo-0', viewValue: 'Activo' }];
  tiempo_alimento: TiempoAlimento[] = [
    { value: 'Tiempo-1', viewValue: 'Desayuno' },
    { value: 'Tiempo-2', viewValue: 'Comida' },
    { value: 'Tiempo-3', viewValue: 'Cena' }];
  categories: FoodCategory[];
  @ViewChild('matSelect') matSelect: MatSelect;
  @ViewChild('matSelectCateg') matSelectCateg: MatSelect;
  @ViewChild('matSelectTAlim') matSelectTAlim: MatSelect;
  matcher = new ValidationsMatcher();
  get precio() { return this.platilloForm.get('precio'); }

  constructor( private dbOperations: DbOperationsService,
    private loadSvc: IsLoadingService, 
    private dialog: MatDialog,
    private snackInfo: SnackNotisService ) { }

  platilloForm: FormGroup = new FormGroup({
    $key: new FormControl(null),
    desc_corta: new FormControl('', Validators.required),
    desc_larga: new FormControl('', Validators.required),
    ingredientes: new FormControl(''),
    costo: new FormControl(''),
    precio: new FormControl('', Validators.required),
    status: new FormControl('', Validators.required),
    tiempo_prep: new FormControl(''),
    guarnicion: new FormControl(''),
    acompanamiento: new FormControl(''),
    id_categoria: new FormControl(''),
    categoria: new FormControl(''),
    tiempo_alimento: new FormControl('')
  });

  initializeFormGroup() {
    //inicializa valores default
    this.platilloForm.setValue({
      $key: null,
      desc_corta: '',
      desc_larga: '',
      ingredientes: '',
      costo: 0,
      precio: 0,
      status: 'Activo',
      tiempo_prep: '',
      guarnicion: '',
      acompanamiento: '',
      id_categoria: '',
      categoria: '',
      tiempo_alimento: ''
    })
  };

  ngOnInit(): void {
    const loading_data = this.dbOperations.getFoodCategories()
    this.loadSvc.add(loading_data, {key:"add_loading"});
    loading_data.subscribe(cats => this.categories=cats ) 
  }

  ngAfterViewInit() {
    this.matSelect.valueChange.subscribe(value => {
      this.platilloForm.patchValue({
        status: value.viewValue
      });
    });
    this.matSelectCateg.valueChange.subscribe(value => {
      this.platilloForm.patchValue({
        id_categoria: value.id_categoria,
        categoria: value.categoria
      });
    });
    this.matSelectTAlim.valueChange.subscribe(value => {
      this.platilloForm.patchValue({
        tiempo_alimento: value.viewValue
      })
    });
  }

  ngOnDestroy(): void {
    this.matSelect.valueChange.unsubscribe();
    this.matSelectCateg.valueChange.unsubscribe();
    this.matSelectTAlim.valueChange.unsubscribe();
  }

  onSubmit(formDirective: FormGroupDirective){
    if (this.platilloForm.valid) {
      const updating = this.dbOperations.addPlatillo(this.platilloForm.value)
      this.loadSvc.add(updating, {key:'add_loading'});
      updating.then(()=>{this.snackInfo.succes('¡Registro Guardado!');})
              .catch(error=>this.showErrorMessage(error));
      formDirective.resetForm();
      this.platilloForm.reset();  
    }
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

  CleanForm():void {
    this.platilloForm.reset();
    this.platilloForm.clearValidators();    
  }

  isDataLoading(key_loading: string): boolean {
    return this.loadSvc.isLoading({key: key_loading})
  }
}
