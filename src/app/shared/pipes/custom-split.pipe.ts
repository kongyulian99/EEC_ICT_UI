import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'customsplit'
})
export class CustomSplitPipe implements PipeTransform {
    transform (value: any, key: string = ';') {       
        if (!value || value.length == 0) return [];
        return value.split(key);
    }
}