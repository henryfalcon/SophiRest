import { Injectable } from '@angular/core';
//Firestore
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';

//Rxjs
import { catchError,  take, map} from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

//Interface
import { OperacionI } from '../../../operaciones/config-local/dbOperations/operacion-i';
import { PlatilloI } from '../../../catalogos/platillo/dbOperations/platillo-i';
import { ComandaI } from './comanda';
import { EmployeeI } from '../../../catalogos/employee/dbOperations/employee-i';
import { ComandaDetalleI } from './comanda-detalle-i';
import { platillo_selected_I } from '../nueva-comanda/nueva-comanda.component';
import { MesaOperacion } from '../../config-local/dbOperations/mesa-operacion';
//Utils
import { TraducirErrores } from '../../../shared/utils/traducirError';
import { FbErrorI } from '../../../shared/interface/fb-error-i';
import { global_Info_System_Service } from '../../../shared/utils/global_info.service';
import { convertTimestamp } from 'convert-firebase-timestamp';

@Injectable({
  providedIn: 'root'
})
export class DbComaOperationsService {
  //collections
  private transErr = new TraducirErrores();
  private OperacionCollection: AngularFirestoreCollection<OperacionI>;
  private currentOperationInfo:OperacionI; 
  private platilloCollection: AngularFirestoreCollection<PlatilloI>;  
  public new_Info_MesaOperacion = new BehaviorSubject({id_oper:'',id_mesa:''});

  constructor( private global_info: global_Info_System_Service,
               private afs: AngularFirestore ) {
    let id_company:string=this.global_info.get_user_info_service.id_company;
    this.OperacionCollection = this.afs.collection('Operaciones', ref =>
      ref.where('estado', '==', 'Abierto')
      .where('id_company', '==', id_company));
    this.platilloCollection = afs.collection<PlatilloI>('Platillos');
  }

  public set setOperationInfo(operation: OperacionI){
    this.currentOperationInfo = operation;    
  }

  public get getOperacionInfo(): OperacionI {
    return this.currentOperationInfo;
  }

  public getPlatillo(id: string): Observable<PlatilloI>{
    return this.afs.doc<PlatilloI>(`Platillos/${id}`).valueChanges().pipe(catchError(this.errorHandler));
  }

  public getPlatillos() {
    return this.platilloCollection
      .snapshotChanges()
      .pipe(
        catchError(this.errorHandler),
        map(actions =>
          actions.map(a => {
            const data = a.payload.doc.data() as PlatilloI;
            data.fecha_alta = convertTimestamp(data.fecha_alta);
            const id = a.payload.doc.id;
            return { id, ...data };
          })));
  }

  get_OpenCorteZ(){
    return this.OperacionCollection.valueChanges().pipe(take(1), catchError(this.errorHandler));
  }

  get_Meseros(){
    return this.afs.collection<EmployeeI>('Employee', ref => ref.where('id_puesto', '==', '6h0QsTYFpoO6aP8bVJ9M')).valueChanges().pipe(take(1), catchError(this.errorHandler));
  }

  get_Operacion(id_oper: string){
    return this.afs.collection<OperacionI>('Operaciones').doc(id_oper);
  }

  get_Operacion_Mesa(idOper: string, id_mesa_oper: string) {
    return this.afs.collection<OperacionI>('Operaciones').doc(idOper).collection<MesaOperacion>('Mesas_Operacion').doc(id_mesa_oper).valueChanges().pipe(take(1), catchError(this.errorHandler));
  }

  get_Operacion_Mesas(idOper: string){
    return this.afs.collection<OperacionI>('Operaciones').doc(idOper).collection<MesaOperacion>('Mesas_Operacion').valueChanges().pipe(take(1), catchError(this.errorHandler));
  }

  get_Platillos_Despachar(idMesa: string, status: string) {    
      return this.afs.collectionGroup('Comanda_detalle', ref => ref
        .where('id_mesa_oper','==', idMesa)
          .where('status','==', status))
            .valueChanges().pipe(catchError(this.errorHandler));
  }

  get_OperacionInfo_Observable(id_operacion:string) {
    return this.afs.collection<OperacionI>('Operaciones', ref=>ref.where('id_operacion', '==', id_operacion))
    .snapshotChanges().pipe(
     map(actions =>
       actions.map(a => {
         const data = a.payload.doc.data() as OperacionI;
         data.fecha_registro = convertTimestamp(data.fecha_registro);
         const id = a.payload.doc.id;
         return { id, ...data };
       })));
  }

  get_OperacionMesa_Observable(id_operacion:string){
    return this.afs.collection<OperacionI>('Operaciones').doc(id_operacion).collection<MesaOperacion>('Mesas_Operacion')
    .snapshotChanges().pipe(
     map(actions =>
       actions.map(a => {
         const data = a.payload.doc.data() as MesaOperacion;
         const id = a.payload.doc.id;
         return { id, ...data };
       })));
  }

  get_status_comanda( id_oper: string,
                      id_mesa: string,
                      id_comanda: string
                      ){                      
    return this.afs
      .collection<OperacionI>('Operaciones').doc(id_oper)
        .collection<MesaOperacion>('Mesas_Operacion').doc(id_mesa)
          .collection<ComandaI>('Comandas').doc(id_comanda).valueChanges().pipe(take(1), catchError(this.errorHandler));
  }

  async cancel_Comanda(id_oper: string, id_mesa:string, id_comanda:string, status: string){    
    let batch = this.afs.firestore.batch();
    //decrementar en 1 el numero de comandas despachadas
    const decrementar = this.afs.firestore
      .collection('Operaciones').doc(id_oper)
        .collection('Mesas_Operacion').doc(id_mesa);
    batch.update(decrementar, {"comandas": firebase.default.firestore.FieldValue.increment(-1)});
  
    const comanda_update = this.afs.firestore
      .collection('Operaciones').doc(id_oper)
        .collection('Mesas_Operacion').doc(id_mesa)
          .collection('Comandas').doc(id_comanda)
    batch.update(comanda_update, {status: status});

    await batch.commit().then(()=>{return true},
    (error)=>  {const err = this.transErr.traducir(error); 
      throw new Error(err);});
  }

  save_Status_Comanda(id_oper: string, id_mesa:string, id_comanda:string, status: string){
    return this.afs
      .collection('Operaciones').doc(id_oper)
        .collection('Mesas_Operacion').doc(id_mesa)
          .collection('Comandas').doc(id_comanda)
            .update({status: status})
    .then(()=>{return true},  
       (error)=>{ const err = this.transErr.traducir(error); 
                  throw new Error(err);});    
  }

  save_Platillo_sts(id_oper: string, id_mesa:string, id_comanda:string, id_detalle: string, sts: string){
    return this.afs
      .collection('Operaciones').doc(id_oper)
        .collection('Mesas_Operacion').doc(id_mesa)
          .collection('Comandas').doc(id_comanda)
            .collection('Comanda_detalle').doc(id_detalle).update({status:sts})
    .then(()=>{return true},  
       (error)=>{ const err = this.transErr.traducir(error); 
                  throw new Error(err);});
  }

  async save_NewComanda(
    id_operacion_p: string, 
    id_mesa_operacion_p: string, 
    id_mesa_p: number, 
    mesa_name_p: string, 
    id_mesero_p:string, 
    mesero_p:string, 
    cliente_name_p:string, 
    platillos_p: platillo_selected_I[] ) { 
    //incrementar en 1 el numero de comanda
    const num_comandas = this.afs.firestore.collection('Operaciones').doc(id_operacion_p)
      .collection('Mesas_Operacion').doc(id_mesa_operacion_p);
    num_comandas.update({"comandas": firebase.default.firestore.FieldValue.increment(1)}).then()

    let batch = this.afs.firestore.batch();

    //guardar en Mesas_Operacion el nombre de cliente
    const datos_mesa = {
      cliente_name: cliente_name_p,
      id_mesero: id_mesero_p,
      mesero: mesero_p,
      id_mesa: id_mesa_p,
      mesa_name: mesa_name_p     
    }
    const updateMesaOperacion = this.afs.firestore.collection('Operaciones').doc(id_operacion_p)
      .collection('Mesas_Operacion').doc(id_mesa_operacion_p)
    batch.update(updateMesaOperacion, datos_mesa)

    //guardar la comanda
    let fechahora_solicitado : Date = new Date();
    let comandaId: string = this.afs.createId();
    const newComanda_obj = {
      id_operacion: id_operacion_p,
      id_comanda: comandaId,
      id_mesa_oper: id_mesa_operacion_p,
      id_mesa: id_mesa_p,
      mesa_name: mesa_name_p,
      id_mesero: id_mesero_p,
      cliente_name: cliente_name_p,
      mesero: mesero_p,
      status: 'SOLICITADO',
      hora_solicitado: fechahora_solicitado,
    };      
    let newComandaOper = this.afs.firestore.collection('Operaciones').doc(id_operacion_p)
      .collection('Mesas_Operacion').doc(id_mesa_operacion_p)
         .collection('Comandas').doc(comandaId);
    batch.set(newComandaOper, newComanda_obj);
    
    //guardar los platillos de la comanda
    platillos_p.forEach(plat => {
      let comanda_detalle_id = this.afs.createId();
      let newComanda_detalle = this.afs.firestore.collection('Operaciones').doc(id_operacion_p)
        .collection('Mesas_Operacion').doc(id_mesa_operacion_p)
           .collection('Comandas').doc(comandaId).collection('Comanda_detalle').doc(comanda_detalle_id);  

      let new_comanda_platillos: ComandaDetalleI = {
        id_comanda: comandaId,
        id_mesa_oper: id_mesa_operacion_p,
        id_platillo: plat.id_platillo,
        id_detalle: comanda_detalle_id,
        platillo: plat.plat_desc_larga,
        acompanamiento: plat.acompanamiento,
        cant: plat.cant,
        precio: plat.precio,
        subtotal: plat.subtotal,
        observacion: plat.observacion,
        status: 'ORDENADO'
      }
      batch.set(newComanda_detalle, new_comanda_platillos);
    });

    await batch.commit().then(() => {       
      return true;
    }, (error) => {
      const err = this.transErr.traducir(error);
      throw new Error(err);
    })
  }

  async save_Despachar_Detalle_Comanda(    
    id_operacion: string,
    id_mesa_oper: string, 
    id_comanda: string,
    id_detalle: string, ){
    
    let batch = this.afs.firestore.batch();

    let detalle_update = this.afs.firestore.collection('Operaciones').doc(id_operacion)
    .collection('Mesas_Operacion').doc(id_mesa_oper)
       .collection('Comandas').doc(id_comanda).collection('Comanda_detalle').doc(id_detalle);  
    
    //incrementar en 1 el numero de comandas despachadas
    const num_despachadas = this.afs.firestore
      .collection('Operaciones').doc(id_operacion)
        .collection('Mesas_Operacion').doc(id_mesa_oper);
    num_despachadas.update(
      {"despachadas": firebase.default.firestore.FieldValue.increment(1)})
    .then()

    batch.update( detalle_update, {status: 'SERVIDO'}  )
    await batch.commit().then(()=>{return true},
    (error)=>  {const err = this.transErr.traducir(error); 
      throw new Error(err);});
  }

  private errorHandler(error: FbErrorI) {
    let trans = new TraducirErrores();
    let errorMsg = trans.traducir(error);
    return throwError(errorMsg);
  }
}
