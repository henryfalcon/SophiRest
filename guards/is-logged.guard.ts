import { Injectable } from '@angular/core';
import { CanLoad, Route, Router, UrlSegment, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AutenticacionService } from '../autenticacion/autenticacion.service';
import { SnackNotisService } from '../shared/snackBarNotifications/snack-notis.service';

@Injectable({
  providedIn: 'root'
})
export class IsLoggedGuard implements CanLoad {
  constructor(  private authSvc: AutenticacionService, 
                private snackInfo: SnackNotisService,
                private router: Router
              ) {}

  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    console.log("LOGGED from canload: ", this.authSvc.isLogged());
    if (this.authSvc.isLogged()) {      
      console.log("canload retorna true");
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
