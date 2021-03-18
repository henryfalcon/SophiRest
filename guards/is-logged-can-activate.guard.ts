import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AutenticacionService } from '../autenticacion/autenticacion.service';
import { SnackNotisService } from '../shared/snackBarNotifications/snack-notis.service';

@Injectable({
  providedIn: 'root'
})
export class IsLoggedActivate implements CanActivate {
  constructor(  private authSvc: AutenticacionService, 
    private snackInfo: SnackNotisService,
    private router: Router
  ) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    console.log("LOGGED from can-activate: ", this.authSvc.isLogged());
    if (this.authSvc.isLogged()) {      
      console.log("can-activate retorna true");
      return true;      
    }
    else
    {
      this.router.navigate(['login']);
      this.snackInfo.succes("¡Utilize la Navegación del Sistema!")
      return false;
    }
  }
}
