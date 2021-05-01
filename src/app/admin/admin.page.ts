import { ProdutosService } from './../services/produtos.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {

  public products: any[] = [];
  public nome: string = null;
  public qtd: number = null;
  public search = '';
  public editar:boolean = false;

  constructor(public productsS: ProdutosService) { }

  ngOnInit() {
    this.productsS.getProducts().then((products: any) => {
      this.products = products;
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


}
