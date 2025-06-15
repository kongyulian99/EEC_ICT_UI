import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-view-ckeditor',
  templateUrl: './view-ckeditor.component.html',
  styleUrls: ['./view-ckeditor.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class ViewCkeditorComponent implements OnInit {

  @Input() data!: string;
  @Input() stamp: string ='';
  constructor() { }

  ngOnInit(): void {
  }

}
