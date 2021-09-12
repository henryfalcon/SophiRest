import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, FormGroupDirective, Validators} from '@angular/forms';
import {STEPPER_GLOBAL_OPTIONS} from '@angular/cdk/stepper';
import { Router } from '@angular/router';
//rxjs
import { take } from 'rxjs/operators';
//service
import { DbOperationsService } from './dbOperations/db-operations.service';
//Material
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { MatTableDataSource } from '@angular/material/table';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatButton } from '@angular/material/button';
import { MatStepper } from '@angular/material/stepper';
//utils services
import { IsLoadingService } from '@service-work/is-loading';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { SnackNotisService } from '../../shared/snackBarNotifications/snack-notis.service';
import { ModalComponent } from  '../config-local/modal/modal.component'
import { global_Info_System_Service } from '../../shared/utils/global_info.service';
// interfaces
import { OptionsMessageI } from '../../shared/confirm-dialog/options-message-i';
import { ConfigLocal } from './dbOperations/config-local';
import { MesaMesero } from './dbOperations/mesa-mesero';
import { ThrowStmt } from '@angular/compiler';

@Component({
  selector: 'app-config-local',
  templateUrl: './config-local.component.html',
  styleUrls: ['./config-local.component.css'],
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS, 
    useValue: [
      {displayDefaultIndicatorType: true},
      {showError: true}
    ]
  }]
})

export class ConfigLocalComponent implements OnInit {
  displayedColumns: string[] = ['Mesa', 'Alias_Mesa', 'Mesero', 'actions'];
  options_msg: OptionsMessageI = {title:"Pregunta", message:"", confirmText:"Si", cancelText:"No"};
  rest1FormGroup: FormGroup;
  rest2FormGroup: FormGroup;
  asignarMesas: boolean = false;
  mesasMeseros: MesaMesero[] = [];
  dataSourceMesas=new MatTableDataSource();
  public mesas_meseros_has_edicion: boolean = false;
  public configlocal: ConfigLocal[];
  public isNewConfig: boolean = false;
  @ViewChild('matSelectConfig') matSelectConfig: MatSelect;
  @ViewChild('slide') slideToggle: MatSlideToggle;
  @ViewChild('stepper') stepper: MatStepper;
  @ViewChild('meseros') meseros_input: ElementRef
  @ViewChild('next1_button') next1_button: MatButton //primer next
  @ViewChild('next2_button') next2_button: MatButton //segundo next
  @ViewChild('next3_button') next3_button: MatButton //guardar config.
  @ViewChild('next4_button') next4_button: MatButton //guardar config.

  constructor( private formbuilder: FormBuilder,
               private dbOperations: DbOperationsService,
               private loadSvc: IsLoadingService, 
               private dialog: MatDialog,    
               private router: Router,
               private global_info: global_Info_System_Service,
               private snackInfo: SnackNotisService ) { }

  public get NoMesas(): number {
    return this.rest1FormGroup.get('mesas').value;
  }

  public get NoMeseros(): number {
    return this.rest1FormGroup.get('meseros').value;
  }
  
  LoadConfiguracionesLocal(){
    const loading_data = this.dbOperations.getConfigsLocal();
    this.loadSvc.add(loading_data, {key:"config_loading"});
    loading_data.subscribe( data => this.configlocal = data,
      error => { this.showErrorMessage( "ConfiguracionesLocal Collection" + error)});
  }

  InitializeFormGroup(){
    this.rest1FormGroup = this.formbuilder.group({
      mesas: ['0', Validators.required],
      meseros: ['0', Validators.required],
      id_config: [''],      
      asign_mesa_mesero: ['false', Validators.required],
    });
    this.rest2FormGroup = this.formbuilder.group({
      config_name: ['', Validators.required],
      hora_inicio: ['', Validators.required],
      fecha_inicio: ['']
    })
  }

  ngOnInit(): void {
    this.LoadConfiguracionesLocal();
    this.InitializeFormGroup();
  }

  private AsignarExistenteDatosConfig(datos_config: ConfigLocal){
    this.rest1FormGroup.patchValue({ 
       id_config: datos_config.id_config,            
       mesas: datos_config.mesas,
       meseros: datos_config.meseros,                    
       asign_mesa_mesero: datos_config.asign_mesa_mesero
     });

     //let newDate: Date = convertTimestamp(datos_config.hora_inicio);
     //let horaInicio: string = newDate.getHours() + ":"  + newDate.getMinutes();
    this.rest2FormGroup.patchValue({
      config_name: datos_config.config_name,
      hora_inicio: datos_config.hora_inicio,
      //fecha_inicio: newDate
    });    
    if (datos_config.asign_mesa_mesero) { //obtener mesa-meseros sub-collection
       const get_mesas_meseros = this.dbOperations.getMesasMeserosSubCollection(datos_config.id_config);
       this.loadSvc.add(get_mesas_meseros, {key: 'config_loading'});
       get_mesas_meseros.subscribe( mesas => {
          this.mesasMeseros = mesas;
          this.dataSourceMesas.data = this.mesasMeseros;
          this.dataSourceMesas._updateChangeSubscription();                                          
       }, error=> this.showErrorMessage(error));
    };
  }

  CleanForm(): void {
    this.mesasMeseros=[];
    this.dataSourceMesas.data = this.mesasMeseros;
    this.dataSourceMesas._updateChangeSubscription();
    this.asignarMesas = false;
    this.rest1FormGroup.reset();
    this.rest2FormGroup.reset();
    this.rest1FormGroup.clearValidators();
    this.rest2FormGroup.clearValidators();
    this.mesas_meseros_has_edicion = false;
    this.isNewConfig = false
  }

  private setControlsDisabled(disable: boolean){  
    setTimeout(() => {
      this.next1_button.disabled = disable; //primer next
      this.next2_button.disabled = disable; //segundo next
      //this.next4_button.disabled = disable; //Iniciar Operacion
      //this.slideToggle.disabled = !disable;
    }, 500); //guardar config
  }

  ngAfterViewInit():void {
    this.matSelectConfig.valueChange.subscribe(datos_config => {    
      switch (datos_config) {
        case 'Nuevo':
          this.CleanForm();
          this.setControlsDisabled(false);          
          this.isNewConfig = true;
          break;
        default://an existing configuration
          this.AsignarExistenteDatosConfig(datos_config);
          this.setControlsDisabled(true);
          this.isNewConfig = false;
          break;
      }
    })
    this.slideToggle.change.subscribe( value => {
      this.asignarMesas = value.checked;
      this.rest1FormGroup.patchValue({
        asign_mesa_mesero: value.checked
      })
    })
  }

  ngOnDestroy():void {
    this.matSelectConfig.valueChange.unsubscribe();
    this.slideToggle.change.unsubscribe();
  }

  crearNewArrayMesasMeseros():void {   
    this.mesasMeseros=[];
    let mesas = this.rest1FormGroup.get('mesas').value;
    for (let i = 1; i <= mesas; i++) {
      this.mesasMeseros.push({
        id_mesa: i,
        mesa_name: 'Mesa ' + i,
        id_mesero: '',
        mesero:  ''
      });
    }
    this.dataSourceMesas.data = this.mesasMeseros;
    this.dataSourceMesas._updateChangeSubscription();
  }

  private validateMesas_Meseros(): boolean{
    //validar Meseros No mayor a Mesas
    let noMesas = this.rest1FormGroup.get('mesas').value;
    let noMeseros = this.rest1FormGroup.get('meseros').value;
    let valido = (noMeseros > noMesas? false: true);
    if (!valido) {
        let message = "¡El numero de Meseros debe ser menor o igual que el numero de Mesas, corrija en el paso 1!"
        let confirm = this.showErrorValidacion(message)
        confirm.afterClosed().pipe(take(1)).subscribe(()=>{
          this.stepper.previous(),
          setTimeout(()=>{this.meseros_input.nativeElement.focus()},2000);
          return false;
      });
    }
    //validar Meseros no asignado a Mesas
    if (this.slideToggle.checked) {
      let mesa_no_asignada: boolean = false;
      this.mesasMeseros.some((element)=>{
        if (!element.id_mesero) {          
          mesa_no_asignada = true;
        }
      })
      if (mesa_no_asignada) {
        let mensaje = "Existen meseros sin asignar, elimine o corrija en el paso 2";
        let confirm = this.showErrorValidacion(mensaje)
          confirm.afterClosed().pipe(take(1)).subscribe(()=>{
          this.stepper.steps.get(1).select();
          return false;
        })    
      }
    } 
    return true;       
  }

  NextStep(step:string){
    switch (step) {
      case 'step2':
        if (this.slideToggle.checked) {
          if (this.validateMesas_Meseros()) {
            this.crearNewArrayMesasMeseros();
          }
        }
        break;
      case 'step3':
        if (this.slideToggle.checked) {
          this.validateMesas_Meseros();
        }
        break;
      case 'step4':
        if (this.validateMesas_Meseros()) {
          this.confirmSaveConfiguration();                                
        }
        break;
      case 'step5':
        if (this.isNewConfig) {
          this.confirmSaveOperation();
        } else {
          this.confirmInitOperation();
        }        
        break;
      default:
        break;
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
    dialogconfirm.afterClosed().pipe(take(1)).subscribe(()=>this.setDefaultConfirmDialogConfig());
  }

  showErrorValidacion(message: string): MatDialogRef<ConfirmDialogComponent> {
    this.options_msg.title = "Mensaje";
    this.options_msg.confirmText = "De acuerdo";
    this.options_msg.isErrorMsg=true;
    this.options_msg.message = message;
    const dialogconfirm = this.dialog.open(ConfirmDialogComponent, {
      data: this.options_msg
    });
    return dialogconfirm;
  }

  setDefaultConfirmDialogConfig(){
    this.options_msg.title = "Pregunta";
    this.options_msg.confirmText ="Si";
    this.options_msg.isErrorMsg=false;
  }

  AsignarMesero(elem: MesaMesero):void {
    const config = { 
      data: {
        toForm: 'edit_Mesa_Mesero',
        message: 'Asigna Mesas a Meseros',
        content: elem 
      }
    };
    const dialogRef = this.dialog.open(ModalComponent, config);
    dialogRef.afterClosed().pipe(take(1)).subscribe(result=>{
      if (!result) {
        //sin accion
      }       
      else 
      { //asginar los datos del mesero al array
        this.mesasMeseros.forEach(element => {
          if (element.id_mesa == result.id_mesa ){
            if (element.mesero != result.mesero){
              element.mesero = result.mesero;
              element.mesa_name = result.mesa_name;
              element.id_mesero = result.id_mesero;
              if (this.matSelectConfig.value!="Nuevo"){
                this.mesas_meseros_has_edicion = true;
              }
              return;
            }
          }
        });
      }
    });
  }

  QuitarMesa(elem: MesaMesero): void {
    this.mesasMeseros.forEach(mesa => {
      if (mesa.id_mesa == elem.id_mesa ) {
        this.mesasMeseros.splice(mesa.id_mesa-1,1);
      }
    });
    this.dataSourceMesas._updateChangeSubscription();
    this.rest1FormGroup.patchValue({
      mesas: this.mesasMeseros.length
    })
    this.validateMesas_Meseros();
  }

  InitOperations(){
    let id_config: string = this.rest1FormGroup.get('id_config').value;    
    const updating = this.dbOperations.getCorteZ_getMesasConfig(id_config)
    this.loadSvc.add(updating, {key:"config_loading"});
    updating.then((result)=>{  
      let corteZ = result[0][0]==undefined? 0: result[0][0].corteZ + 1;
      let mesas: MesaMesero[] = result[1];
      let config_local: ConfigLocal[] = result[2];
      this.dbOperations.saveOperation(id_config, corteZ, config_local, mesas ).then(()=>{
         this.snackInfo.succes("¡Operacion Guardada, Inicie toma de comandas"!)
         this.router.navigate(["/comandas"]);
      }).catch(error=>this.showErrorMessage(error));
    }, error => this.showErrorMessage(error));
  }

  confirmSaveOperation(){
    this.options_msg.message="No ha guardado la nueva configuracion, Desea Guardarlo?";
    this.options_msg.isErrorMsg=false;
    this.options_msg.confirmText ="Si";
    this.options_msg.cancelText ="No";
    return this.dialog.open(ConfirmDialogComponent, {data: this.options_msg})
      .afterClosed().pipe(take(1)).subscribe(res=>{
        if (res) {
          this.saveNewLocaleConfig();
        }
      })
  }

  confirmInitOperation(){ 
    this.options_msg.message="¿Confirma Iniciar Operacion?";
    this.options_msg.isErrorMsg=false;
    this.options_msg.confirmText ="Si";
    this.options_msg.cancelText ="No";
    this.dialog.open(ConfirmDialogComponent, {data: this.options_msg})
      .afterClosed().pipe(take(1)).subscribe(res=>{
        if (res) {
          this.InitOperations();
        }
      })
  }

  confirm_Delete_Mesa(elem: MesaMesero): void {
    this.options_msg.message="¿Confirma quitar la mesa?";
    this.options_msg.isErrorMsg=false;
    this.options_msg.confirmText ="Si";
    this.options_msg.cancelText ="No";
    this.dialog.open(ConfirmDialogComponent, {data: this.options_msg})
      .afterClosed().pipe(take(1)).subscribe(res=>{
        if (res){
          this.QuitarMesa(elem);
        }
      })
  }

  confirmSaveConfiguration() {
    if (this.matSelectConfig.value == "Nuevo"){
      this.options_msg.isErrorMsg=false;
      this.options_msg.confirmText ="Si";
      this.options_msg.cancelText ="No";
      this.options_msg.message="¿Confirma Guardar la configuracion?";
      this.dialog.open(ConfirmDialogComponent, {data: this.options_msg})
        .afterClosed().pipe(take(1)).subscribe(res=>{
            if (res) { this.saveNewLocaleConfig(); }
      });
    }
  }

  isDataLoading(key_loading: string): boolean {
    return this.loadSvc.isLoading({key: key_loading});
  }

  saveNewLocaleConfig(): void {
    const newConfig: ConfigLocal = {
      mesas: this.rest1FormGroup.get('mesas').value,
      meseros: this.rest1FormGroup.get('meseros').value,
      id_config: this.rest1FormGroup.get('id_config').value,
      config_name: this.rest2FormGroup.get('config_name').value,
      asign_mesa_mesero: this.rest1FormGroup.get('asign_mesa_mesero').value,
      hora_inicio: this.rest2FormGroup.get('hora_inicio').value,
      id_company: ''
    }
    const updating = this.dbOperations.saveNewLocaleConfig(newConfig, this.mesasMeseros);
    this.loadSvc.add(updating, {key: 'config_loading'});
    updating.then(()=>{
      this.rest1FormGroup.patchValue({id_config: this.dbOperations.get_NewLocal_Config});
      this.snackInfo.succes("¡Configuracion Guardada!");      
      setTimeout(() => {this.next3_button.disabled = true;}, 0);  
    })
    .catch(error=>this.showErrorMessage(error));             
  }

  SaveMesasMeserosConfig(): void {
    if (this.matSelectConfig.value != "Nuevo"){
      this.options_msg.isErrorMsg=false;
      this.options_msg.confirmText ="Si";
      this.options_msg.cancelText ="No";
      this.options_msg.message="¿Desea guardar los cambios en la asignación?";
      this.dialog.open(ConfirmDialogComponent, {data: this.options_msg})
        .afterClosed().pipe(take(1)).subscribe(res=>{
            if (res) { 
              this.dbOperations.saveNewConfigMesasMeseros(
                this.rest1FormGroup.get('id_config').value,
                this.mesasMeseros).then(()=>{
                  this.snackInfo.succes("Cambios Guardados");      
                }).catch(error=>this.showErrorMessage(error)
              )}
            });
        }  
  }
}
