import { Injectable } from '@angular/core';
//Firestore
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
//Rxjs
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
//Interface
import { PuestoI } from './puesto-i'
import { DepartmentI  } from './department-i';
import { FbErrorI } from '../../../shared/interface/fb-error-i';
//Utils
import { TraducirErrores } from '../../../shared/utils/traducirError';

@Injectable({
  providedIn: 'root'
})
export class DbOperationsService {
  //collections
  private puestoCollection: AngularFirestoreCollection;
  private departmentsCollection: AngularFirestoreCollection<DepartmentI>;
  //variable
  private transErr = new TraducirErrores();
  
  constructor( private afs: AngularFirestore, private storage: AngularFireStorage ) {
    this.puestoCollection = afs.collection<PuestoI>('Puestos');
    this.departmentsCollection = afs.collection<DepartmentI>('Departamentos');
  }

  private errorHandler(error: FbErrorI) {
    let trans = new TraducirErrores();
    let errorMsg = trans.traducir(error);
    return throwError(errorMsg);
  }

  public getPuesto(id: string) {
    return this.afs.doc<PuestoI>(`Puesto/${id}`).valueChanges().pipe(catchError(this.errorHandler));
  }

  public getPuestos() {
    return this.puestoCollection.snapshotChanges().pipe(
      catchError(this.errorHandler),
      map(actions => actions.map(a => {const data = a.payload.doc.data() as PuestoI;
        const id = a.payload.doc.id;
        return { id, ...data };})));     
  }

  public getDepartments(){
    return this.departmentsCollection.valueChanges().pipe(catchError(this.errorHandler));
  }  

  public addPuesto(puesto: PuestoI){
    let new_id = this.afs.createId();
    const puestoObj = {
      departamento: puesto.departamento,
      disp_cambio: puesto.disp_cambio,
      disp_viajar: puesto.disp_viajar,
      formacion: puesto.formacion,
      habilidades: puesto.habilidades,
      id_departamento: puesto.id_departamento,
      id_puesto: new_id,
      requisitos: puesto.requisitos,
      puesto: puesto.puesto,
      remuneracion_de: puesto.remuneracion_de,
      remuneracion_hasta: puesto.remuneracion_hasta,
      responsabilidad: puesto.responsabilidad
    };
    return this.puestoCollection.doc(new_id).set(puestoObj).then(()=>{ return true; },
      (error)=>{ const err = this.transErr.traducir(error);
        throw new Error (err);});
  }  

  public deletePuesto(puesto: PuestoI){
    return this.puestoCollection.doc(puesto.id_puesto).delete()
      .then(()=>{return true}, 
      (error)=>{const err = this.transErr.traducir(error);
                throw new Error(err);});
  }  

  public editPuestoById(puesto:PuestoI) {
    return this.puestoCollection.doc(puesto.id_puesto).update(puesto)
       .then(()=>{return true},  
       (error)=>{ const err = this.transErr.traducir(error); 
                  throw new Error(err);});
  }

}
