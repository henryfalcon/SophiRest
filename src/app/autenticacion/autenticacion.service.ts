import { Injectable, OnInit } from '@angular/core';
//Firestore
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
//rxjs
import { BehaviorSubject, throwError } from 'rxjs';
import { take, switchMap, tap, catchError } from 'rxjs/operators';
//interfaces
import { UserI } from '../shared/interface/user-i';
import { EmployeeI } from '../catalogos/employee/dbOperations/employee-i';
import { GlobalInformation } from '../shared/interface/global_info';
import { FbErrorI } from '../shared/interface/fb-error-i';
//Utils
import { TraducirErrores } from '../shared/utils/traducirError';
import { global_Info_System_Service } from '../shared/utils/global_info.service';

@Injectable({
  providedIn: 'root'
})
export class AutenticacionService implements OnInit{
  //behavior subject
  public userLogged = new BehaviorSubject(false);
  public newUserRegistered = new BehaviorSubject(false);
  //variables
  private user: UserI[];
  private gloablInfo: GlobalInformation = { user_id: "", user_email: "", email_verified: false, displayName: "", photoURL: "", role: "GUEST", employeeID: "", employee_email: "", id_company: "", company_name: ""};
  //error handler
  private transErr = new TraducirErrores();

  constructor( public afAuth: AngularFireAuth, 
               private afs: AngularFirestore,
               private global_info_service: global_Info_System_Service) { }

  ngOnInit(): void {
    //
  }

  private errorHandler(error: FbErrorI) {
    let trans = new TraducirErrores();
    let errorMsg = trans.traducir(error);
    return throwError(errorMsg);
  }

  setObjGlobalInfoUser(data:UserI): void {
    this.gloablInfo.user_id = data.uid;
    this.gloablInfo.user_email = data.email
    this.gloablInfo.email_verified = data.emailVerified;
    this.gloablInfo.photoURL = data.photoURL;
    this.gloablInfo.role = data.role;
    this.gloablInfo.id_company = data.id_company;
    this.gloablInfo.company_name = data.company_name;
  }

  public getUserEmployeeInfo(uid: string) {
    const user_query = this.afs.collection<UserI>('users', ref => ref.where('uid', '==', uid).limit(1));
    const employee_query = this.afs.collection<EmployeeI>('Employee', ref => ref.where('userID', '==', uid).limit(1));
    const updateemailVerified = this.afs.collection('users').doc(uid).update({emailVerified: true});
    //this.employeeCollection.doc(emp.id).update(emp)
    user_query.valueChanges().pipe(
      catchError(this.errorHandler),
      take(1),
      switchMap(user_data => {
        if (user_data[0] != undefined){ //Basic user Fill           
           this.setObjGlobalInfoUser(user_data[0])
           if (!user_data[0].emailVerified) {
              updateemailVerified.catch(error=>this.errorHandler(error));
           }
        }
        return employee_query.valueChanges().pipe(
          catchError(this.errorHandler),
          take(1),
          tap(emp_data => {    
            if (emp_data[0] != undefined) { //user has assigned employee
              this.gloablInfo.employeeID = emp_data[0].id;
              this.gloablInfo.employee_email = emp_data[0].email; }
            this.global_info_service.set_user_info_service = this.gloablInfo;
          }));})
    ).subscribe(()=>this.userLogged.next(true), error => {return error;});
  }
  
  public async login(email: string, password: string) {
    return await this.afAuth.signInWithEmailAndPassword(email, password)
      .then(data => {
        if (data.user.emailVerified){
          const {user} = data;
          this.getUserEmployeeInfo(user.uid);
        }
        else {
          throw new Error("¡El usuario no ha Verificado su Correo!");
        }      
      },
      error => {
        const err = this.transErr.traducir(error);
        throw new Error(err);
      });
  }

  public async register(email: string, password: string) {
    return await this.afAuth.createUserWithEmailAndPassword(email, password)
  }

  public async sendEmailVerification() {
    let user = this.afAuth.currentUser;
    return (await user).sendEmailVerification();
  }

  public async logout() {
    await this.afAuth.signOut().
      then(() => { 
        this.userLogged.next(false); 
        this.global_info_service.set_user_info_null_service();
      },
      error => {
        const err = this.transErr.traducir(error);
        throw new Error(err);
      });
  }

  public saveNewUser(user: UserI){
    const data: UserI = {
      uid: user.uid,
      email: user.email,
      emailVerified: false,
      displayName: user.displayName,
      photoURL: "",
      employeeID: "",
      role: 'GUEST'
    };
    return this.afs.collection('users').doc(data.uid).set(data);
  }

  public isLogged(): boolean {
    return this.userLogged.getValue();   
  }
}
