import { Component } from '@angular/core';

import { AuthService } from './../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(public Auth:AuthService ) {}

  ngOnInit(): void {
  }

  logout(){
    this.Auth.signOut();
  }

}
