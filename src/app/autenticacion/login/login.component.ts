import { Component , OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
//rxjs
import { take } from 'rxjs/operators';
//service
import { AutenticacionService } from '../autenticacion.service';
import { IsLoadingService } from '@service-work/is-loading';
//confirmation
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { OptionsMessageI } from '../../shared/confirm-dialog/options-message-i';
import { SnackNotisService } from '../../shared/snackBarNotifications/snack-notis.service';
//router
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnDestroy {
  options_msg: OptionsMessageI = {title:"Error", message:"", confirmText:"Si", cancelText:"Ok"};
  form: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.email, Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)])
  });

  constructor( private authSvc: AutenticacionService,
               private loadSvc: IsLoadingService,
               public dialog: MatDialog,
               private snackInfo: SnackNotisService,
               private router: Router   ) { }

  ngOnDestroy(): void {
    //
  }

  submit(){
    if (this.form.valid){
      const {username, password} = this.form.value; 
      const authenticating = this.authSvc.login(username, password);
      this.loadSvc.add(authenticating, {key:"loading"});
      authenticating.then((user)=> { 
        this.snackInfo.succes("Bienvenido");                                 
        this.router.navigate(['dashboard']);})
      .catch(error => this.showErrorMessage(error));
    } 
  }

  showErrorMessage(message: string){
    this.options_msg.title = "Ha ocurrido lo siguiente:";
    this.options_msg.confirmText ="Ok";
    this.options_msg.isErrorMsg=true;
    this.options_msg.message = message;
    const dialogconfirm = this.dialog.open(ConfirmDialogComponent, {
      data: this.options_msg
    });
    dialogconfirm.afterClosed().pipe(take(1)).subscribe(res=>this.setDefaultConfirmDialogConfig());
  }

  setDefaultConfirmDialogConfig(){
    this.options_msg.title = "Info:";
    this.options_msg.confirmText ="Yes";
    this.options_msg.isErrorMsg=false;
  }

  isDataLoading(key_loading: string): boolean {
    return this.loadSvc.isLoading({key: key_loading});
  }
}
