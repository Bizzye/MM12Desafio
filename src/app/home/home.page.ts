import { User } from './../services/user.model';
import { AuthService } from './../services/auth.service';

import { Component } from '@angular/core';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(public Auth:AuthService) {}

  logout(){
    this.Auth.signOut();
  }
}
