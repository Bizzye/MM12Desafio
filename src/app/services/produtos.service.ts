import { Injectable } from '@angular/core';

import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ProdutosService {

  constructor(private db: AngularFirestore) { }

  getProducts() {
    return new Promise((resolve, reject) => {
      this.db.collection("products").ref.get().then(products => {
        let productsData = [];
        products.docs.map(product => productsData.push(product.data()));
        resolve(productsData);
      }).catch(err => {
        reject();
      });
    });
  }

  async insertProduct(body) {
    try {
      let id = new Date().getTime().toString();
      body.id = id
      return await this.db.collection('products').doc(id).set(body);
    } catch (err) {
    console.log(err)
      return err
    }
  }

  async removeProduct(id) {
    try {
      return await this.db.collection('products').doc(id).delete();
    } catch (err) {
      console.log(err)
      return err
    }
  }

  async updateQtd(id, data){
    try {
      return this.db.collection('products').doc(id).update({qtd: data});
    } catch (err) {
      console.log(err)
      return err
    }
  }

}
