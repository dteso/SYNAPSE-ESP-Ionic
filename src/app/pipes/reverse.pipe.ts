import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'reverse'
})
export class ReversePipe implements PipeTransform {
  reversedArray: any[] = [];
  transform(value) {
    for (let i = 0; i < value.length; i++) {
      this.reversedArray.push(value[(value.length - 1) - i]);
    }
    return this.reversedArray;
  }
}
