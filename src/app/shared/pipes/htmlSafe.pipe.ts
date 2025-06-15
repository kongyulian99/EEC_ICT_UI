import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer} from '@angular/platform-browser';

@Pipe({ name: 'htmlsafe' })
export class HTMLSafePipe implements PipeTransform {
  constructor(private domSanitizer: DomSanitizer) {}
  transform(text) {
    return this.domSanitizer.bypassSecurityTrustHtml(text);
  }
} 