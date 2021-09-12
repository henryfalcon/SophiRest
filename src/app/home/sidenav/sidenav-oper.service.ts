import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class SidenavOperService {
  public showSideNavMenu = new BehaviorSubject(false);

  constructor() { }

  public setSideNavMenu(show: boolean){
    this.showSideNavMenu.next(show);
  }

  public getSideNavState(): boolean {
    return this.showSideNavMenu.value;
  }
}
  