import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SocketProviderConnect } from 'src/app/services/web-socket.service';

@Component({
  selector: 'app-socket-rquest-modal',
  templateUrl: './socket-rquest-modal.component.html',
  styleUrls: ['./socket-rquest-modal.component.scss'],
})
export class SocketRquestModalComponent implements OnInit {

  title = 'default title';
  message;
  buttons;
  style;
  icon;

  socketMessage;
  detectResponseEnabled;

  responseOk;
  requestFinished = false;


  step = '';

  constructor(
    private readonly modalController: ModalController,
    private readonly sockets: SocketProviderConnect,
  ) { }

  ngOnInit() {
    this.step = 'requesting';
    this.requestFinished = false;

    // Si desde que se manda la petición pasan 10 minutos y no hay respuesta se pone en moda error
    setTimeout(() => {
      if (!this.requestFinished) { this.step = 'failed'; }
    }, 10000);

    this.sockets.socketMessage.subscribe(message => {
      this.socketMessage = message;

      this.responseOk = !this.responseOk ?
        this.socketMessage && this.socketMessage.response && this.socketMessage.response.status === 'OK'
        : this.responseOk;

      this.message = this.responseOk ?
        'La solicitud ha sido recibida por el dispositivo' : this.message;

      if (this.responseOk) {
        this.step = 'done';
        this.responseOk = false;
        setTimeout(() => {
          this.dismiss();
          this.requestFinished = true;
        }, 3000);
      }
    });
  }

  async dismiss() {
    await this.modalController.dismiss();
  }

  getButtonStyle(button) {
    return `color: ${button.color}; --background: ${button.background};`;
  }
}
