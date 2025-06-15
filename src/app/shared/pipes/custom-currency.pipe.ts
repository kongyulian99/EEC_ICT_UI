import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'customcurrency'
})
export class CustomCurrencyPipe implements PipeTransform {
    transform (value: any, hideZero: boolean = false) {
        if (!value) {
            if (hideZero) return '';
            return '0';
        }

        if (value == 0) {
            if (hideZero) return '';
        }
        // new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

        let stringValue = value.toString();
        // case value is 
        if (stringValue.split('.').length < 2)
        {
            return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        } else
        {
            let parts = stringValue.split('.');
            return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + parts[1];
        }
        
        
    }
}