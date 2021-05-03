import { ProdutosService } from './../services/produtos.service';
import { Component, OnInit } from '@angular/core';

import Swal  from 'sweetalert2';

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


  addProduct(){
    if(this.nome == null || this.nome == ''){
      return Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Não esqueça do nome!',
        heightAuto: false
      })
    }
    else if(this.qtd == null){
      return Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Não esqueça da quantidade!',
        heightAuto: false
      })
    }
    else if(this.qtd < 0 ){
      return Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Digite uma quantidade maior que zero!',
        heightAuto: false
      })
    }
    else{
      let product = {
        nome: this.nome,
        qtd: this.qtd,
        dataC: new Date().getTime()
      };
      this.productsS.insertProduct(product).then(d => {
        this.productsS.getProducts().then((products: any) => {
          this.products = products;
        });
      });
      this.qtd = null;
      this.nome = null;
    }
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
