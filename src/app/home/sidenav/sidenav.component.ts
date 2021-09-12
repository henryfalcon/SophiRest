import { Component, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { SidenavOperService } from './sidenav-oper.service';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css']
})
export class SidenavComponent implements AfterViewInit, OnDestroy {
  @ViewChild('sidenav') sidenav: MatSidenav;

  constructor(private sidenavShowSvs: SidenavOperService) { }
  
  ngAfterViewInit(){
     this.sidenavShowSvs.showSideNavMenu.subscribe(show => {
       if (show) {this.sidenav.open();}
       else {this.sidenav.close();}
     })
  }

  ngOnDestroy() {
    //this.sidenavShowSvs.showSideNavMenu.unsubscribe();    
  }
}
