import { Component, OnInit } from '@angular/core';

import { AuthService } from '../services/auth.service';
import { ProdutosService } from './../services/produtos.service';
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";

import * as moment from 'moment';
import { MovimentacaoComponent } from './movimentacao/movimentacao.component';

@Component({
  selector: 'app-product',
  templateUrl: './product.page.html',
  styleUrls: ['./product.page.scss'],
})
export class ProductPage implements OnInit {

  public products: any[] = [];
  public nome: string = null;
  public qtd: number = null;
  public search = '';
  public editar:boolean = false;

  constructor(private dialog: MatDialog,public Auth:AuthService, public productsS: ProdutosService ) {}

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
      qtd: this.qtd,
      dataC: moment().format('DD/MM/YYYY'),
      saida: [],
      entrada: [{qtdE: this.qtd, dataE: moment().format('DD/MM/YYYY')}]
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
    let id = product.id;
    let data = product.nome;
    let campo = Object.keys(product);
    console.log(campo);
    this.productsS.updateQtd(id, data).then(d => {
      this.productsS.getProducts().then((products: any) => {
        this.products = products;
      });
    });
    this.editar = !this.editar;
  }

  edit(){
    this.editar = !this.editar;
  }

  openDialog() {

    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    this.dialog.open(MovimentacaoComponent, {data: this.nome});
  }
}
