import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuOperations } from './menu-operations'


@Component({
  selector: 'app-toolbar-menu',
  templateUrl: './toolbar-menu.component.html',
  styleUrls: ['./toolbar-menu.component.css']
})
export class ToolbarMenuComponent implements OnInit {

  constructor( private menu_opers: MenuOperations, private router: Router) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(){
    //
  }

  newComandaMenuItem(){
    this.menu_opers.newComanda();
  }

  cancelComandaMenuItem(){
    this.menu_opers.cancelComanda();
  }

  closeComandaMenuItem(){
    this.menu_opers.closeComanda();
  }

  despacharComanda(){
    this.menu_opers.despacharComanda();    
  } 
}
