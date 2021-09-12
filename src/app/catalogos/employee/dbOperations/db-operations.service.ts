import { Injectable } from '@angular/core';
//Firestore
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
//Rxjs
import { last, switchMap, map, catchError, take } from 'rxjs/operators';
import { throwError, forkJoin } from 'rxjs';
//Interface
import { EmployeeI } from './employee-i'
import { DepartmentI  } from './department-i';
import { PuestoI } from '../../puesto/dbOperations/puesto-i';
import { UserI } from '../../../shared/interface/user-i';
import { FileI } from '../../../shared/interface/file-i';
//Utils
import { TraducirErrores } from '../../../shared/utils/traducirError';
import { FbErrorI } from '../../../shared/interface/fb-error-i';
import { convertTimestamp } from 'convert-firebase-timestamp';

@Injectable({
  providedIn: 'root'
})
export class DbOperationsService {
  //collections
  private employeeCollection: AngularFirestoreCollection;
  private departmentsCollection: AngularFirestoreCollection<DepartmentI>;
  private usersCollection: AngularFirestoreCollection<UserI>;
  private puestosCollection: AngularFirestoreCollection<PuestoI>;
  //variable
  public filePath: string;
  public downloadUrl: string;
  private transErr = new TraducirErrores();
  
  constructor( private afs: AngularFirestore, private storage: AngularFireStorage ) {
    this.employeeCollection = afs.collection<EmployeeI>('Employee');
    this.departmentsCollection = afs.collection<DepartmentI>('Departamentos');
    this.usersCollection = afs.collection<UserI>('users', ref=>ref.where('employeeID','==',''));
    this.puestosCollection = afs.collection<PuestoI>('Puestos');
  }

  private errorHandler(error: FbErrorI) {
    let trans = new TraducirErrores();
    let errorMsg = trans.traducir(error);
    return throwError(errorMsg);
  }

  public getEmployee(id: string) {
    return this.afs.doc<EmployeeI>(`Employee/${id}`).valueChanges().pipe(catchError(this.errorHandler));
  }

  public getEmployees() {
    return this.employeeCollection.snapshotChanges().pipe(
      catchError(this.errorHandler),
      map(actions => actions.map(a => {const data = a.payload.doc.data() as EmployeeI;
        data.hiredate = convertTimestamp(data.hiredate);
        const id = a.payload.doc.id;
        return { id, ...data };})));     
  }

  public getDepartments(){
    return this.departmentsCollection.valueChanges().pipe(catchError(this.errorHandler));
  }  

  public getPuestos(){
    return this.puestosCollection.valueChanges().pipe(catchError(this.errorHandler));
  }

  public getUser(id: string){
    return this.afs.doc<UserI>(`users/${id}`).valueChanges().pipe(catchError(this.errorHandler));      
  }

  public getAvailableUsers(){
    return this.usersCollection.valueChanges().pipe(catchError(this.errorHandler));      
  }  

  public addEmployee(emp: EmployeeI){
    let new_id = this.afs.createId();
    const empObj = {
      id: new_id,
      fullname: emp.fullname,
      email: emp.email,
      gender: emp.gender,
      hiredate: emp.hiredate,
      ispermanent: emp.ispermanent,
      mobile: emp.mobile,
      city: emp.city,
      id_depto: emp.id_depto,
      department: emp.department,
      fotografia: "",
      userID: "",
      id_puesto: emp.id_puesto,
      puesto: emp.puesto
    };
    return this.employeeCollection.doc(new_id).set(empObj).then(()=>{ return true; },
      (error)=>{ const err = this.transErr.traducir(error);
        throw new Error (err);});
  }  

  public deleteEmployee(emp: EmployeeI){
    return this.employeeCollection.doc(emp.id).delete()
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

  public editEmployeeById(emp:EmployeeI) {
    return this.employeeCollection.doc(emp.id).update(emp)
       .then(()=>{return true},  
       (error)=>{ const err = this.transErr.traducir(error); 
                  throw new Error(err);});
  }

  public editPhotoEmployee(emp:EmployeeI, PhotoFile: FileI, newPhoto: boolean){
    if (newPhoto){ //Reemplazo de foto
      return this.uploadFoto(emp.id, PhotoFile, emp.userID);}
    else {        
      const deletephoto = this.deleteFotoStorage(emp.fotografia);
      const uploadphoto = this.uploadFoto(emp.id, PhotoFile, emp.userID);
      return forkJoin([deletephoto, uploadphoto]).pipe(take(1));    
    }
  }

  public async update_User_Employee(emp:EmployeeI , userid:string, rol:string){
    let batch = this.afs.firestore.batch();
    
    let employeeRef = this.afs.firestore.collection("Employee").doc(emp.id);
    batch.update(employeeRef, {userID: userid});
    
    if (emp.userID != "") {
      let userRef = this.afs.firestore.collection("users").doc(userid);
      batch.update(userRef, { employeeID: emp.id, role:rol, photoURL: emp.fotografia,         
        displayName: emp.fullname });    
    }
    await batch.commit().then(()=>{return true})
                        .catch(error => {const err = this.transErr.traducir(error); 
                                        throw new Error(err);});
  }

  private photoNameAddedWithEmpKey(filename:string, id:string):string{
    const s = filename;
    const new_name = s.substring(0, s.lastIndexOf(".")) + id + s.substring(s.lastIndexOf("."));
    return new_name;
  }

  private uploadFoto(id:string, fotografia: FileI, userid:string) {
    //combinar el id del empleado con el nombre del archivo de la foto
    const photoName =  this.photoNameAddedWithEmpKey(fotografia.name, id);
    this.filePath = `Repositorio-Imagenes/${photoName}`;
    const fileRef = this.storage.ref(this.filePath);
    const task = this.storage.upload(this.filePath, fotografia);
    return task.snapshotChanges().pipe(
      catchError(this.errorHandler),
      last(), 
      switchMap(() => fileRef.getDownloadURL()))                          
  }

  public async updatePhotoEmployeeandUser(employeeid: string, url:string, userid:string){
    let batch = this.afs.firestore.batch();
    let employeeRef = this.afs.firestore.collection('Employee').doc(employeeid);
    batch.update(employeeRef, {fotografia:url, fileRef: this.filePath});
    if (userid != ""){
      let userRef = this.afs.firestore.collection('users').doc(userid);
      batch.update(userRef, {photoURL: url});
    }
    await batch.commit().then(()=> {return true},
      (error)=>  {const err = this.transErr.traducir(error); 
                  throw new Error(err);});
  }

}
