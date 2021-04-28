import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(value: any, arg: any): any {
    const product = value;
    console.log(product);
    if (arg === '' || arg.length < 2 ) return value;
    const products = [];
    for(let i = 0; i < product.length; i++){
      console.log('test');
      if(product[i].nome.toLowerCase().indexOf(arg.toLowerCase()) > -1){
        products.push(product[i]);
        console.log('test');
      };
    };
    return products;
  }

}
