import { Component } from '@angular/core';
import { AuthService } from './../services/auth.service';

import { User } from './../services/user.model';

import * as moment from 'moment';

import { ProdutosService } from './../services/produtos.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  public products: any[] = [];
  public nome: string = null;
  public qtd: number = null;
  public search = '';

  constructor(public Auth:AuthService, public productsS: ProdutosService ) {}

  ngOnInit(): void {
    this.productsS.getProducts().then((products: any) => {
      this.products = products;
    });
  }

  logout(){
    this.Auth.signOut();
  }

  addProduct(){
    let product = {
      nome: this.nome,
      qtd: this.qtd
    };

    this.productsS.insertProduct(product).then(d => {
      this.productsS.getProducts().then((products: any) => {
        this.products = products;
      });
    });
  }

  removeProduct(id){
    this.productsS.removeProduct(id).then(d => {
      this.productsS.getProducts().then((products: any) => {
        this.products = products;
      });
    });
  }

  atualizar(product){
    let id = product.id
    let data = parseInt(product.qtd) + 30;
    this.productsS.updateQtd(id, data).then(d => {
      this.productsS.getProducts().then((products: any) => {
        this.products = products;
      });
    });
  }

}
