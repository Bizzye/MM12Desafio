import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { User } from './user.model.js';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
// import { auth } from 'firebase/app';

import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user$: Observable<User>;

  constructor(
    private db: AngularFirestore,
    private Auth: AngularFireAuth,
    private router: Router
    ) {
      this.user$ = this.Auth.authState.pipe(
        switchMap(user => {
          if (user) {
            return this.db.doc<User>(`users/${user.uid}`).valueChanges();
          } else {
            return of(null);
          }
        })
      );
  }


  async fazLogin(email, senha) {
    const provider = await this.Auth.signInWithEmailAndPassword(email, senha);
    this.router.navigate(['home']);
    return this.newUser(provider.user);
  }

  async signOut() {
    await this.Auth.signOut();
    this.router.navigate(['/']);
  }

  private newUser(user){
    const userRef: AngularFirestoreDocument<User> = this.db.doc(`users/${user.uid}`);

    const data = {
      uid: user.uid,
      email: user.email,
      nome: user.nome,
      categoria: user.categoria
    };

    return user.Ref.set(data, { merge:true });

  };

  pegaIdUsuario():void {
      this.Auth.onAuthStateChanged(user =>{
      return user.uid
      })
  };

}
