import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'romanNumeral'
})
export class RomanNumeralPipe implements PipeTransform {
  transform(value: number): string {
    if (isNaN(value) || value <= 0) {
      return '';
    }

    const romanNumerals: { [key: number]: string } = {
      1000: 'M',
      900: 'CM',
      500: 'D',
      400: 'CD',
      100: 'C',
      90: 'XC',
      50: 'L',
      40: 'XL',
      10: 'X',
      9: 'IX',
      5: 'V',
      4: 'IV',
      1: 'I'
    };

    let result = '';
    for (const key of Object.keys(romanNumerals).reverse()) {
      const numKey = parseInt(key, 10);
      while (value >= numKey) {
        result += romanNumerals[numKey];
        value -= numKey;
      }
    }

    return result;
  }
}
