import { Injectable } from '@angular/core';
//Firestore
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
//Rxjs
import {  map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
//Interface
import { EmployeeI } from '../../employee/dbOperations/employee-i'
import { UserI } from '../../../shared/interface/user-i';
import { FbErrorI } from '../../../shared/interface/fb-error-i';
//Utils
import { TraducirErrores } from '../../../shared/utils/traducirError';
import { global_Info_System_Service } from '../../../shared/utils/global_info.service';


@Injectable({
  providedIn: 'root'
})
export class DbUserOperationsService {
  //collections
  private usersCollection: AngularFirestoreCollection<UserI>;
  private employeeCollection: AngularFirestoreCollection<EmployeeI>;
  //variable
  private transErr = new TraducirErrores();

  constructor( private afs: AngularFirestore, 
               private storage: AngularFireStorage,
               private global_info: global_Info_System_Service ) {
    this.usersCollection = afs.collection<UserI>('users');
    this.employeeCollection = afs.collection<EmployeeI>('Employee', ref=>ref.where('userID','==',''));    
  }

  private errorHandler(error: FbErrorI) {
    let trans = new TraducirErrores();
    let errorMsg = trans.traducir(error);
    return throwError(errorMsg);
  }

  public getUsers() {
    return this.usersCollection.snapshotChanges().pipe(
      catchError(this.errorHandler),
      map(actions => actions.map(a => {const data = a.payload.doc.data() as UserI;
        //data.hiredate = convertTimestamp(data.hiredate);
        const id = a.payload.doc.id;
        return { id, ...data };})));     
  }

  public getEmployeesWithoutUser() {
    return this.employeeCollection.valueChanges().pipe(catchError(this.errorHandler));
  }

  public async delete_User(userid: string) {
    return this.usersCollection.doc(userid).delete();
  }

  public async delete_User_Employee(user: UserI) {
    let batch = this.afs.firestore.batch();
    let employeeRef = this.afs.firestore.collection("Employee").doc(user.employeeID);
    batch.update(employeeRef, {userID: ""});
    let userRef = this.afs.firestore.collection("users").doc(user.uid);
    batch.update(userRef, { employeeID:"", role: "GUEST", photoURL: "", displayName: "" });
    await batch.commit()
      .then(()=>{return true})
      .catch(error => {
        const err = this.transErr.traducir(error);
        throw new Error(err);});
  }

  public async update_User_Employee(emp: EmployeeI , userid:string, rol:string){
    let employeeRef = this.afs.firestore.collection("Employee").doc(emp.id);
    let userRef = this.afs.firestore.collection("users").doc(userid);  
    
    let batch = this.afs.firestore.batch();
    batch.update(employeeRef, {userID: userid });
    batch.update(userRef, { employeeID: emp.id,
                            role:rol, 
                            photoURL: emp.fotografia, 
                            displayName: emp.fullname,
                            id_company: this.global_info.get_user_info_service.id_company,
                            company_name: this.global_info.get_user_info_service.company_name 
                          });
    await batch.commit().then(()=>{return true})
                        .catch(error => {const err = this.transErr.traducir(error); 
                                        throw new Error(err);});
  }
}
