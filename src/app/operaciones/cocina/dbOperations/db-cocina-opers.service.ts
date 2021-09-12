import { Injectable } from '@angular/core';
//Firestore
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
//Utils
import { TraducirErrores } from '../../../shared/utils/traducirError';
import { FbErrorI } from '../../../shared/interface/fb-error-i';
import { convertTimestamp } from 'convert-firebase-timestamp';
//Interface
import { ComandaI } from '../../comandas/dbOperations/comanda';
import { ComandaDetalleI } from '../../comandas/dbOperations/comanda-detalle-i';
import { OperacionI } from '../../../operaciones/config-local/dbOperations/operacion-i';
import { PlatilloI } from '../../../catalogos/platillo/dbOperations/platillo-i';
import { MesaOperacion } from '../../config-local/dbOperations/mesa-operacion';  
//Rxjs
import { catchError, map, take } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
//utils
import { global_Info_System_Service } from '../../../shared/utils/global_info.service';

@Injectable({
  providedIn: 'root'
})
export class DbCocinaOpersService {
  private transErr = new TraducirErrores();
  private OperacionCollection: AngularFirestoreCollection<OperacionI>;

  constructor( private afs: AngularFirestore, private global_info: global_Info_System_Service ) { 
    let id_company:string=this.global_info.get_user_info_service.id_company;
    this.OperacionCollection = this.afs.collection('Operaciones', ref =>
      ref.where('estado', '==', 'Abierto')
      .where('id_company', '==', id_company));    
  }

  get_OpenCorteZ(){
    return this.OperacionCollection.valueChanges().pipe(take(1), catchError(this.errorHandler));
  }

  get_Comandas(id_operacion:string)
  {    
    return this.afs.collectionGroup<ComandaI>('Comandas', 
      ref=>ref.where('id_operacion', '==', id_operacion)
        .where('status', 'in', ["SOLICITADO", "PARCIAL"])        
            .orderBy('id_mesa')
              .orderBy('hora_solicitado'))
      .snapshotChanges().pipe(
        map(actions => actions.map( a=> {
          const data = a.payload.doc.data() as ComandaI;
          data.hora_solicitado = convertTimestamp(data.hora_solicitado);
          const id = a.payload.doc.id;
          return { id, ...data };
        })));
  }

  get_Comandas_Detalle(id_comanda:string){
    return this.afs.collectionGroup<ComandaDetalleI>
      ('Comanda_detalle', ref=>ref
        .where('id_comanda','==',id_comanda)
          .where('status','==','ORDENADO'))
          .valueChanges().pipe(take(1), catchError(this.errorHandler))
  }

  async despachar_Comandas_Detalle(id_operacion:string, id_mesa_Operacion: string, id_comanda: string, comanda_detalle: ComandaDetalleI[], status_comanda: string){
    let batch = this.afs.firestore.batch();
    //status de comanda
    let comanda = this.afs.firestore.collectionGroup('Comandas').firestore
      .doc(`Operaciones/${id_operacion}/Mesas_Operacion/${id_mesa_Operacion}/Comandas/${id_comanda}`)
    batch.update(comanda, {status: status_comanda})
    //comandas detalle
    comanda_detalle.forEach(detalle => {
      let detalle_modif = this.afs.firestore.
        collectionGroup('Comanda_detalle').firestore
          .doc(`Operaciones/${id_operacion}/Mesas_Operacion/${id_mesa_Operacion}/Comandas/${id_comanda}/Comanda_detalle/${detalle.id_detalle}`)
      batch.update(detalle_modif, {status: detalle.status})
    });
    await batch.commit().then(() => {       
      return true;
    }, (error) => {
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
