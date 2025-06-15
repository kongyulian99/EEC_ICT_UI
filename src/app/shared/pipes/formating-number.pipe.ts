import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatingNumber'
})
export class FormatingNumber implements PipeTransform {

  transform(value: number | string, numberdecimal?: number, showZero: boolean = false): string {
    if(!showZero && (!value || Number(value) <= 0)) return '';
    return new Intl.NumberFormat('vi', {
      minimumFractionDigits: 0,
      maximumFractionDigits: numberdecimal ? numberdecimal : 2
    }).format(Number(value));
  }
}
