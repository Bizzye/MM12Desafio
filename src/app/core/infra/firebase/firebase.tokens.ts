import { InjectionToken, inject } from '@angular/core';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

import { environment } from '../../../../environments/environment';

export const FIREBASE_APP = new InjectionToken<FirebaseApp>('FIREBASE_APP', {
  providedIn: 'root',
  factory: () => {
    if (!environment.firebase) {
      throw new Error('Firebase não configurado para este ambiente.');
    }
    return initializeApp(environment.firebase);
  },
});

export const FIREBASE_AUTH = new InjectionToken<Auth>('FIREBASE_AUTH', {
  providedIn: 'root',
  factory: () => getAuth(inject(FIREBASE_APP)),
});

export const FIRESTORE = new InjectionToken<Firestore>('FIRESTORE', {
  providedIn: 'root',
  factory: () => getFirestore(inject(FIREBASE_APP)),
});
