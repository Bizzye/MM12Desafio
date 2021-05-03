import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit{
  constructor(private Auth:AngularFireAuth, private router: Router ) {}

  ngOnInit(){
    this.Auth.onAuthStateChanged(user => {
      if (user){
        this.router.navigate(['home'])
      } else{
        this.router.navigate(['login']);
      }
    })
  }
}
