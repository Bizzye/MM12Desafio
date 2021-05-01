import { HistoryService } from './../services/history.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { User } from './../services/user.model';
import { Component, OnInit } from '@angular/core';

import { AuthService } from '../services/auth.service';
import { ProdutosService } from './../services/produtos.service';

import * as moment from 'moment';
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

  entrada(product){
    Swal.mixin({
      input: 'text',
      confirmButtonText: 'Next &rarr;',
      showCancelButton: true,
      progressSteps: ['1'],
    }).queue([
      {
        title: 'Entrada de Estoque',
        text: 'Qual a quantidade de entrada'
      }
    ]).then((result:{value,dismiss}) => {
      if(!(result.dismiss === Swal.DismissReason.cancel)){
        let qtdR = parseInt(result.value[0]);
        let Newqtd = product.qtd + qtdR;
        if (qtdR > parseInt(product.qtd)){
        console.log(product.qtd);
          Swal.fire({
            title: 'All done!',
            html: `
              Your answers:
            `,
            confirmButtonText: 'Lovely!'
          })
        }
        else if (result.value) {
          const answers = JSON.stringify(result.value)
          let data = {
            dataT : new Date().getTime(),
            itemT : {
              id : product.id,
              nome: product.nome,
              qtdE: qtdR,
              qtdpassado: product.qtd,
              qtd: Newqtd
            },
            tipoT: "entrada",
            uid: this.uid
          }
          this.historyS.movimentacao(product.id, Newqtd);
          this.historyS.insertMovimentacao(data).then(d => {
            this.productsS.getProducts().then((products: any) => {
              this.products = products;
            });
          });
          Swal.fire({
            title: 'All done!',
            html: `
              Your answers:
              <pre><code>${answers}</code></pre>
            `,
            confirmButtonText: 'Lovely!'
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
        let Newqtd = product.qtd - qtdR;
        if (qtdR > parseInt(product.qtd)){
        console.log(product.qtd);
          Swal.fire({
            title: 'All done!',
            html: `
              Your answers:
            `,
            confirmButtonText: 'Lovely!'
          })
        }
        else if (result.value) {
          const answers = JSON.stringify(result.value)
          let data = {
            dataT : new Date().getTime(),
            itemT : {
              id : product.id,
              nome: product.nome,
              qtdS: qtdR,
              qtdpassado: product.qtd,
              qtd: Newqtd
            },
            tipoT: "saida",
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
            title: 'All done!',
            html: `
              Your answers:
              <pre><code>${answers}</code></pre>
            `,
            confirmButtonText: 'Lovely!'
          })
        }
      }
    })
  }

}
