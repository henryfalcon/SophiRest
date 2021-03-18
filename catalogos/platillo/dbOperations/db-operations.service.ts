import { Injectable } from '@angular/core';
//Firestore
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
//Rxjs
import { last, switchMap, map, catchError, take } from 'rxjs/operators';
import { Observable, throwError, forkJoin } from 'rxjs';
  //Interface
import { PlatilloI } from './platillo-i';
import { FoodCategory } from './food-category';
import { FileI } from '../../../shared/interface/file-i';
import { FbErrorI } from '../../../shared/interface/fb-error-i';
//Utils
import { TraducirErrores } from '../../../shared/utils/traducirError';
import { convertTimestamp } from 'convert-firebase-timestamp';

@Injectable({
  providedIn: 'root'
})
export class DbOperationsService {
  //collections
  private platilloCollection: AngularFirestoreCollection<PlatilloI>;
  private FoodCategoryCollection: AngularFirestoreCollection<FoodCategory>;
  //variable
  public filePath: string;
  public downloadUrl: string;
  private transErr = new TraducirErrores();

  constructor( private afs:AngularFirestore, private storage: AngularFireStorage) {
    this.platilloCollection = afs.collection<PlatilloI>('Platillos');
    this.FoodCategoryCollection = afs.collection<FoodCategory>('FoodCategory');    
  }

  private errorHandler(error: FbErrorI) {
    let trans = new TraducirErrores();
    let errorMsg = trans.traducir(error);
    return throwError(errorMsg);
  }

  public getPlatillo(id: string): Observable<PlatilloI>{
    return this.afs.doc<PlatilloI>(`Platillos/${id}`).valueChanges().pipe(catchError(this.errorHandler));
  }

  public getFoodCategories(){
    return this.FoodCategoryCollection.valueChanges().pipe(catchError(this.errorHandler));
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

  public addPlatillo(platillo: PlatilloI) {
    let new_id = this.afs.createId();
    const platObj = {
      id: new_id,
      desc_corta: platillo.desc_corta,
      desc_larga: platillo.desc_larga,
      ingredientes: platillo.ingredientes,
      precio: platillo.precio,
      costo: platillo.costo,
      status: platillo.status,
      tiempo_prep: platillo.tiempo_prep,
      guarnicion: platillo.guarnicion,
      acompanamiento: platillo.acompanamiento,
      fecha_alta: new Date(),
      imagen: "",
      id_categoria: platillo.id_categoria,
      categoria: platillo.categoria,
      tiempo_alimento: platillo.tiempo_alimento,
      dashboard: false
    }
    return this.platilloCollection.doc(new_id).set(platObj).then(()=>{ return true; },
      (error)=>{ const err = this.transErr.traducir(error);
        throw new Error (err);});
  }

  public deletePlatillo(platillo: PlatilloI){
    return this.platilloCollection.doc(platillo.id).delete()
      .then(()=>{return true}, 
      (error)=>{const err = this.transErr.traducir(error);
                throw new Error(err);});
  }  

  private async deleteFotoStorage(fotoFileRef: string){
    await this.storage.storage.refFromURL(fotoFileRef).delete()
      .then(()=>{return true},
      (error)=>{const err = this.transErr.traducir(error);
                throw new Error(err);});
  }  

  public editPlatilloById(platillo: PlatilloI){
    return this.platilloCollection.doc(platillo.id).update(platillo)
   .then(()=>{return true},  
   (error)=>{ const err = this.transErr.traducir(error); 
              throw new Error(err);});
  }

  public savePhotoUrl(id_platillo: string, fotourl:string){
    return this.afs.collection('Platillos').doc(id_platillo).update({imagen: fotourl});
  }

  public editPhotoPlatillo(platillo: PlatilloI, PhotoFile: FileI, newPhoto: boolean){
    if (newPhoto){ //Reemplazo de foto
      return this.uploadFoto(platillo.id, PhotoFile);}
    else {        
      const deletephoto = this.deleteFotoStorage(platillo.imagen);
      const uploadphoto = this.uploadFoto(platillo.id, PhotoFile);
      return forkJoin([deletephoto, uploadphoto]).pipe(catchError(this.errorHandler), take(1));}
  }

  private photoNameAddedWithPlatilloKey(filename: string, id: string): string {
    const s = filename;
    const new_name = s.substring(0, s.lastIndexOf(".")) + id + s.substring(s.lastIndexOf("."));
    return new_name
  }  

  private uploadFoto(id: string, fotografia: FileI){
    //combinar el id del empleado con el nombre del archivo de la foto
    const photoName = this.photoNameAddedWithPlatilloKey(fotografia.name, id);
    this.filePath = `Repositorio-Imagenes/${photoName}`;
    const fileRef = this.storage.ref(this.filePath);
    const task = this.storage.upload(this.filePath, fotografia);
    return task.snapshotChanges().pipe(
      catchError(this.errorHandler),
      last(), 
      switchMap(() => fileRef.getDownloadURL()))
   }  
}
