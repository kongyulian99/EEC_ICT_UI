import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'base-angular';
  public serviceUrl: string;
  public reportPath: string;

    constructor() {
    }

}
