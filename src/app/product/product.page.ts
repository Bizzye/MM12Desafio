import { HistoryService } from './../services/history.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { User } from './../services/user.model';
import { Component, OnInit } from '@angular/core';

import { AuthService } from '../services/auth.service';
import { ProdutosService } from './../services/produtos.service';

import Swal  from 'sweetalert2';
import 'sweetalert2/src/sweetalert2.scss'

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
  private uid;
  dns=false;

  constructor(private auth: AngularFireAuth,public Auth:AuthService, public productsS: ProdutosService, public historyS: HistoryService ) {}

  ngOnInit(): void {
    this.productsS.getProducts().then((products: any) => {
      this.products = products;
    });
    this.auth.onAuthStateChanged(user =>{
      this.uid = user.uid;
    })
  }

  logout(){
    this.Auth.signOut();
  }

  entrada(product){
    Swal.mixin({
      input: 'text',
      confirmButtonText: 'Next &rarr;',
      showCancelButton: true,
      progressSteps: ['1'],
      heightAuto: false
    }).queue([
      {
        title: 'Entrada de Estoque',
        text: 'Qual a quantidade de entrada?'
      }
    ]).then((result:{value,dismiss}) => {
      if(!(result.dismiss === Swal.DismissReason.cancel)){
        let qtdR:number = parseInt(result.value[0]);
        let Newqtd = parseInt(product.qtd) + qtdR;
        if(typeof qtdR !== 'number' || isNaN(qtdR)){
          return Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Número inválido!',
            heightAuto: false
          })
        }
        else if(qtdR < 0 ){
          return Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Digite uma quantidade maior que zero!',
            heightAuto: false
          })
        }
        else if (result.value) {
          let data = {
            dataT : new Date().getTime(),
            itemT : {
              id : product.id,
              nome: product.nome,
              qtdMovimentado: qtdR,
              qtdpassado: product.qtd,
              qtd: Newqtd
            },
            tipoT: "Entrada",
            uid: this.uid
          }
          this.historyS.movimentacao(product.id, Newqtd);
          this.historyS.insertMovimentacao(data).then(d => {
            this.productsS.getProducts().then((products: any) => {
              this.products = products;
            });
          });
          Swal.fire({
            icon: 'success',
            title: 'Chegou aqui no estoque!',
            text: 'Produto adicionado com sucesso!',
            heightAuto: false
          })
        }
      }
    })
  }

   saida(product){
    Swal.mixin({
      input: 'text',
      confirmButtonText: 'Next &rarr;',
      showCancelButton: true,
      progressSteps: ['1', '2'],
      heightAuto: false
    }).queue([
      {
        title: 'Retirada de Estoque',
        text: 'Qual a quantidade de retirada'
      },
      {
        title: 'Retirada de Estoque',
        text: 'Qual a razão da retirada?'
      }
    ]).then((result:{value,dismiss}) => {
      if(!(result.dismiss === Swal.DismissReason.cancel)){
        let qtdR = parseInt(result.value[0]);
        let desc = result.value[1];
        let Newqtd = parseInt(product.qtd) - qtdR;
        if(typeof qtdR !== 'number' || isNaN(qtdR)){
          return Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Número inválido',
            heightAuto: false
          })
        }
        else if(qtdR < 0 ){
          return Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Digite uma quantidade maior que zero!',
            heightAuto: false
          })
        }
        else if (qtdR > parseInt(product.qtd)){
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Não temos tudo isso no estoque :(',
          heightAuto: false
        })
        }
        else if(qtdR < 0 ){
          return Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Digite uma quantidade maior que zero!',
            heightAuto: false
          })
        }
        else if (result.value) {
          const answers = JSON.stringify(result.value)
          let data = {
            dataT : new Date().getTime(),
            itemT : {
              id : product.id,
              nome: product.nome,
              qtdMovimentado: qtdR,
              qtdpassado: product.qtd,
              qtd: Newqtd
            },
            tipoT: "Saída",
            uid: this.uid,
            desc: desc
          }
          this.historyS.movimentacao(product.id, Newqtd);
          this.historyS.insertMovimentacao(data).then(d => {
            this.productsS.getProducts().then((products: any) => {
              this.products = products;
            });
          });
          Swal.fire({
            icon: 'success',
            title: 'Vendeu bastante!',
            text: 'A quantidade solicitada já está descontada!',
            heightAuto: false
          })
        }
      }
    })
  }

}
