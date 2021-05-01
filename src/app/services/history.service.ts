import { Injectable } from '@angular/core';

import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {

  constructor(private db: AngularFirestore) { }

  getHistory() {
    return new Promise((resolve, reject) => {
      this.db.collection("history").ref.orderBy('dataT', 'desc').get().then(history => {
        let historyData = [];
        history.docs.map(order => historyData.push(order.data()));
        resolve(historyData);
      }).catch(err => {
        reject();
      });
    });
  }

  async insertMovimentacao(body) {
    try {
      let id = new Date().getTime().toString();
      body.id = id
      return await this.db.collection('history').doc(id).set(body);
    } catch (err) {
    console.log(err)
      return err
    }
  }

  async movimentacao(id, data){
    try {
      return this.db.collection('products').doc(id).update({qtd: data});
    } catch (err) {
      console.log(err)
      return err
    }
  }

}
