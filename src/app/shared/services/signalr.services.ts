import { Injectable, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';
declare var $: any;
@Injectable({ providedIn: 'root' })
export class SignalrService {

    // Declare the variables
    private proxy: any;
    private proxyName = 'qtcsdlHub';
    private connection: any;
    // create the Event Emitter
    
    public announcementThongBaoChiDao: EventEmitter<any>;
    public announcementThongBaoChiDao_DaXem: EventEmitter<any>;
    public connectionEstablished: EventEmitter<boolean>;
    public connectionExists: boolean;

    constructor() {
        // Constructor initialization
        this.connectionEstablished = new EventEmitter<boolean>();
        this.announcementThongBaoChiDao = new EventEmitter<any>();
        this.announcementThongBaoChiDao_DaXem = new EventEmitter<any>();
        this.connectionExists = false;
        // create hub connection
        this.connection = $.hubConnection('/signalr');
        // create new proxy as name already given in top
        this.proxy = this.connection.createHubProxy(this.proxyName);
        // register on server events
        this.registerOnServerEvents();
        // call the connecion start method to start the connection to send and receive events.
        this.startConnection();
    }
    // check in the browser console for either signalr connected or not
    private startConnection(): void {
        this.connection.start().done((data: any) => {
            console.log('Now connected ' + data.transport.name + ', connection ID= ' + data.id);
            this.connectionEstablished.emit(true);
            this.connectionExists = true;
        }).fail((error: any) => {
            console.log('Could not connect ' + error);
            this.connectionEstablished.emit(false);
        });
    }

    public sendUserInfoToHub = (userInfo) => {
        if (this.connection === undefined) {
            this.startConnection();
        } else {
            this.connection.send('UserInfo',  userInfo)
        }
    }

    private registerOnServerEvents(): void {
        this.proxy.on('addThongBaoChiDao', (thongbao) => {
            this.announcementThongBaoChiDao.emit(thongbao);
        })
        this.proxy.on('updateThongBaoChiDaoDaXem', (idThongBao, madonvinhan) => {
            this.announcementThongBaoChiDao_DaXem.emit({ IdThongBao: idThongBao, MaDonViNhan: madonvinhan});
        })
    }
}
