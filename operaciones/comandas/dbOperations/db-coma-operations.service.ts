import { Injectable } from '@angular/core';
//Firestore
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
//Rxjs
import { catchError,  take, map } from 'rxjs/operators';
import { forkJoin, throwError, Observable } from 'rxjs';
//Interface
import { OperacionI } from '../../../operaciones/config-local/dbOperations/operacion-i';
import { PlatilloI } from '../../../catalogos/platillo/dbOperations/platillo-i';
//Utils
import { TraducirErrores } from '../../../shared/utils/traducirError';
import { FbErrorI } from '../../../shared/interface/fb-error-i';
import { global_Info_System_Service } from '../../../shared/utils/global_info.service';
import { MesaOperacion } from '../../config-local/dbOperations/mesa-operacion';
import { convertTimestamp } from 'convert-firebase-timestamp';

@Injectable({
  providedIn: 'root'
})
export class DbComaOperationsService {
  //collections
  private OperacionCollection: AngularFirestoreCollection<OperacionI>;
  private currentOperationInfo:OperacionI; 
  private platilloCollection: AngularFirestoreCollection<PlatilloI>;

  constructor( private global_info: global_Info_System_Service,
               private afs: AngularFirestore
             )
  {
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

  get_Operacion(id_oper: string){
    return this.afs.collection<OperacionI>('Operaciones').doc(id_oper);
  }

  get_Operacion_Mesas(idOper: string){
    return this.afs.collection<OperacionI>('Operaciones').doc(idOper).collection<MesaOperacion>('Mesas_Operacion').valueChanges().pipe(take(1), catchError(this.errorHandler));
  }

  get_OperacionInfo_OperacionMesas(id_operacion:string){
    const operaciones = this.afs.collection<OperacionI>('Operaciones').doc(id_operacion).valueChanges().pipe(take(1), catchError(this.errorHandler));
    const opera_mesas = this.afs.collection<MesaOperacion>('Operaciones').doc(id_operacion).collection<MesaOperacion>('Mesas_Operacion').valueChanges().pipe(take(1), catchError(this.errorHandler));
    return forkJoin([operaciones, opera_mesas]).pipe(take(1), catchError(this.errorHandler));
  }

  private errorHandler(error: FbErrorI) {
    let trans = new TraducirErrores();
    let errorMsg = trans.traducir(error);
    return throwError(errorMsg);
  }
}
