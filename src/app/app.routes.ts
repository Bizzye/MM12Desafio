import { Routes } from '@angular/router';

import { adminGuard, authGuard, guestGuard } from './core/guards/auth.guards';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Entrar',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    loadComponent: () => import('./shared/layout/shell/shell.component').then((m) => m.ShellComponent),
    children: [
      {
        path: 'home',
        title: 'Início',
        loadComponent: () => import('./features/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'products',
        title: 'Produtos',
        loadComponent: () => import('./features/products/products.page').then((m) => m.ProductsPage),
      },
      {
        path: 'history',
        title: 'Histórico',
        loadComponent: () => import('./features/history/history.page').then((m) => m.HistoryPage),
      },
      {
        path: 'admin',
        title: 'Administração',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/admin/admin.page').then((m) => m.AdminPage),
      },
      { path: '', pathMatch: 'full', redirectTo: 'home' },
    ],
  },
  { path: '**', redirectTo: '' },
];
