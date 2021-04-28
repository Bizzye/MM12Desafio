import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from './../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  public email: string = null;
  public password: string = null;

  constructor(
    private Auth: AuthService,
    private router: Router
    ) { }

  ngOnInit() {}

  login(){
    this.Auth.fazLogin(this.email, this.password).then(() => {
    }).catch((err) => {
      if (err.code === "auth/wrong-password") {
        alert("Senha Incorreta");
        console.log(err.code);
      } else if (err.code === 'auth/user-not-found') {
        alert('E-mail não encontrado');
        console.log(err.code);
      } else if (err.code) {
        alert("Dados errados");
        console.log(err.code);
      }
    });
    console.log(this.password,this.email);
  };

}
