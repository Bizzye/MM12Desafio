import { Component, OnInit } from '@angular/core';
import { HistoryService } from '../services/history.service';
import { ProdutosService } from './../services/produtos.service';



@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
})
export class HistoryPage implements OnInit {

  public products: any[] = [];
  public nome: string = null;
  public qtd: number = null;
  public search = '';
  public editar:boolean = false;
  public history: any[] = [];

  constructor(public HistoryS: HistoryService, public productsS: ProdutosService) { }

  ngOnInit() {
    this.HistoryS.getHistory().then((history: any) => {
      this.history = history;
    });
  }

}
