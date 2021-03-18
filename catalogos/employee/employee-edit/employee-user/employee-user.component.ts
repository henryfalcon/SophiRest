import { Component, OnInit, Input } from '@angular/core';
// interfaces
import { UserI } from '../../../../shared/interface/user-i';
import { EmployeeI } from '../../dbOperations/employee-i';

@Component({
  selector: 'app-employee-user',
  templateUrl: './employee-user.component.html',
  styleUrls: ['./employee-user.component.css']
})
export class EmployeeUserComponent implements OnInit {
  @Input() user: UserI;
  @Input() employee: EmployeeI;
    
  constructor() { }

  ngOnInit(): void {
    //
  }
}
