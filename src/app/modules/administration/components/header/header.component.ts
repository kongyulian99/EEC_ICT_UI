import { ModalChangePasswordComponent } from './../modal-change-password/modal-change-password.component';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  AuthenService,
  NotificationService,
  SystemConstants,
  User,
} from 'src/app/shared';
import { SignalrService } from 'src/app/shared/services/signalr.services';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  // @ViewChild(ModalChangePasswordComponent,{static: true}) comptChangePassword!: ModalChangePasswordComponent;
  public pushRightClass: string = '';
  public user: User;
  @Input() isAdmin: boolean = false;

  countThongBaoChiDao = 0;
  listThongBaoChuaXem: any = [];

  constructor(public router: Router, private modalService: NgbModal) {
    this.router.events.subscribe((val) => {
      if (
        val instanceof NavigationEnd &&
        window.innerWidth <= 992 &&
        this.isToggled()
      ) {
        this.toggleSidebar();
      }
    });
  }

  ngOnInit() {
    this.pushRightClass = 'push-right';
    this.user = JSON.parse(
      localStorage.getItem(SystemConstants.CURRENT_USER) as string
    );
  }

  isToggled(): boolean {
    const dom: Element | null = document.querySelector('body');
    return dom != null ? dom.classList.contains(this.pushRightClass) : false;
  }

  toggleSidebar() {
    const dom: any = document.querySelector('body');
    dom.classList.toggle(this.pushRightClass);
    this.onToggle.emit();
  }

  rltAndLtr() {
    const dom: any = document.querySelector('body');
    dom.classList.toggle('rtl');
  }
  onChangePassword() {
    const modalRef = this.modalService.open(ModalChangePasswordComponent, {
      backdrop: 'static',
      animation: false,
    });
    //    console.log(modalRef.componentInstance.whoAmI());
  }

  onLoggedout() {
    localStorage.removeItem(SystemConstants.CURRENT_USER);
    localStorage.removeItem(SystemConstants.SIDEBAR_ID);
  }

  @Output() onToggle = new EventEmitter();

  toggleCollapseSidebar() {
    this.onToggle.emit();
  }
}
