import { Injectable } from '@angular/core';
//Firestore
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
//Rxjs
import { catchError,  take } from 'rxjs/operators';
import { forkJoin, throwError, } from 'rxjs';
//Interface
import { ConfigLocal } from './config-local';
import { EmployeeI } from '../../../catalogos/employee/dbOperations/employee-i'
import { MesaMesero } from './mesa-mesero';
import { MesaOperacion } from './mesa-operacion';
//Utils
import { TraducirErrores } from '../../../shared/utils/traducirError';
import { FbErrorI } from '../../../shared/interface/fb-error-i';
import { global_Info_System_Service } from '../../../shared/utils/global_info.service';
import { OperacionI } from './operacion-i';
import { SnackNotisService } from '../../../shared/snackBarNotifications/snack-notis.service';

@Injectable({
  providedIn: 'root'
})
export class DbOperationsService {
  //collections
  private configLocalCollection: AngularFirestoreCollection<ConfigLocal>;
  private meserosCollection: AngularFirestoreCollection<EmployeeI>;
  private operationsCollection: AngularFirestoreCollection<OperacionI>;
  private transErr = new TraducirErrores();
  //mesasmeseros
  private mesasMeseros_Obj: MesaMesero[];
  private new_ID_local_config: string = "";

  constructor(
    private global_info: global_Info_System_Service, 
    private snackInfo: SnackNotisService,
    private afs: AngularFirestore)
    {    
      this.configLocalCollection = afs.collection<ConfigLocal>('ConfiguracionesLocal');
      this.meserosCollection = afs.collection<EmployeeI>('Employee', ref => ref.where('id_puesto', '==', '6h0QsTYFpoO6aP8bVJ9M'));
      this.operationsCollection = afs.collection<OperacionI>('Operaciones', ref => ref.orderBy('corteZ'));
    }

  public get get_NewLocal_Config(){
    return this.new_ID_local_config;
  }

  getConfigsLocal() {
    return this.configLocalCollection.valueChanges().pipe(catchError(this.errorHandler));
  }

  getConfigLocal(id:string){
    return this.afs.collection<ConfigLocal>('ConfiguracionesLocal', ref => ref.where('id_config','==',id)).valueChanges().pipe(take(1), catchError(this.errorHandler))
  }

  getMeseros() {
    return this.meserosCollection.valueChanges().pipe(catchError(this.errorHandler));
  }

  get mesasMeserosObj() {
    return this.mesasMeseros_Obj;
  }

  set setMesasMeserosObj(mesa_mesero: MesaMesero[]) {
    this.mesasMeseros_Obj = mesa_mesero;
  }

  getMesasMeserosSubCollection(id_collection: string) {
    return this.afs.collection<MesaMesero>('ConfiguracionesLocal').doc(id_collection).collection<MesaMesero>('Mesa-Meseros').valueChanges().pipe(take(1), catchError(this.errorHandler));
  }

  async saveNewLocaleConfig(config: ConfigLocal, mesas_meseros?: MesaMesero[],) {
    let new_id_local_config = this.afs.createId();
    config.id_company = this.global_info.get_user_info_service.id_company;
    config.id_config = new_id_local_config;

    let batch = this.afs.firestore.batch();
    let configLocal = this.afs.firestore.collection('ConfiguracionesLocal').doc(new_id_local_config)
    batch.set(configLocal, config);

    if (mesas_meseros !== undefined) {
      if (mesas_meseros.length > 0) {
        mesas_meseros.forEach((mesa) => {
          let new_id_mesa_doc = this.afs.createId();
          mesa.id_config_mesa = new_id_mesa_doc;
          let configMesasMeseros = this.afs.firestore.collection('ConfiguracionesLocal').doc(new_id_local_config).collection('Mesa-Meseros').doc(new_id_mesa_doc);
          batch.set(configMesasMeseros, mesa)
        });
      }
    }

    await batch.commit().then(() => {       
      this.new_ID_local_config = new_id_local_config;
      return true;
    }, (error) => {
      const err = this.transErr.traducir(error);
      throw new Error(err);
    })
  }

  public getLastCorteZ() {
    return this.operationsCollection.valueChanges()
      .pipe(
        catchError(this.errorHandler),
        take(1)
      )
  }

  async getCorteZ_getMesasConfig(id_config_mesa: string){
    const getCorteZ = this.getLastCorteZ();
    const getMesasConfig = this.getMesasMeserosSubCollection(id_config_mesa);
    const getConfigLocal = this.getConfigLocal(id_config_mesa);
    return await forkJoin([ getCorteZ, getMesasConfig, getConfigLocal ]).pipe(take(1), catchError(this.errorHandler)).toPromise();
  }

  async saveOperation(id_config_param: string, cortez: number, config: ConfigLocal[], mesas: MesaMesero[]) {
    let fecha_inicio: Date = new Date();
    let new_oper_id: string = this.afs.createId();
    const newOper: OperacionI = {
      id_operacion: new_oper_id,
      id_config: id_config_param,
      config_name: config[0].config_name,
      mesas: config[0].mesas,
      meseros: config[0].meseros,
      corteZ: cortez,
      total_Operaciones: 0,
      id_usuario: this.global_info.get_user_info_service.user_id,
      id_company: this.global_info.get_user_info_service.id_company,
      fecha_registro: fecha_inicio,
      estado: 'Abierto'
  
    }
    let batch = this.afs.firestore.batch();
    let updateNewOper = this.afs.firestore.collection('Operaciones').doc(new_oper_id);
    batch.set(updateNewOper, newOper);
    if (mesas.length > 0){
      mesas.forEach(mesa=> {  
        let new_id_mesa_oper:string = this.afs.createId();
        let new_mesa_oper: MesaOperacion = {
          id_operacion: new_oper_id,
          id_mesa_oper: new_id_mesa_oper,
          id_mesa: mesa.id_mesa,
          mesa_name: mesa.mesa_name,
          id_mesero: mesa.id_mesero,
          mesero: mesa.mesero,
          cliente_name: 'Sin Asignar',
          comandas: 0,
          despachadas: 0,
          pendientes: 0, 
        }
        let OperMesa = this.afs.firestore.collection('Operaciones').doc(new_oper_id).collection('Mesas_Operacion').doc(new_id_mesa_oper);
        batch.set(OperMesa, new_mesa_oper);                  
      });
    }
    await batch.commit().then(() => {       
      return true;
    }, (error) => {
      const err = this.transErr.traducir(error);
      throw new Error(err);
    })
  }

  async saveNewConfigMesasMeseros(id_config:string, mesasmeseros:MesaMesero[]){
    let batch = this.afs.firestore.batch();
    mesasmeseros.forEach(mesa=>{
      let config = this.afs.firestore.collection('ConfiguracionesLocal').doc(id_config).collection('Mesa-Meseros').doc(mesa.id_config_mesa);
      batch.set(config, mesa);
    });
    await batch.commit().then(() => { return true }, (error) => {
      const err = this.transErr.traducir(error);
      throw new Error(err);
    })
  }

  private errorHandler(error: FbErrorI) {
    let trans = new TraducirErrores();
    let errorMsg = trans.traducir(error);
    return throwError(errorMsg);
  }
}
