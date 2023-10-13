import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SocketProviderConnect } from 'src/app/services/web-socket.service';

@Component({
  selector: 'app-custom-modal',
  templateUrl: './custom-modal.component.html',
  styleUrls: ['./custom-modal.component.scss'],
})
export class CustomModalComponent implements OnInit {

  title = 'default title';
  message;
  buttons;
  style;
  icon;

  socketMessage;
  detectResponseEnabled;
  responseOk;

  constructor(
    private readonly modalController: ModalController,
    private readonly sockets: SocketProviderConnect,
  ) { }

  ngOnInit() {
    this.sockets.socketMessage.subscribe(message => {
      this.socketMessage = message;
    });
  }

  async setOnclosePayload(selectedValue) {
    await this.dismiss(selectedValue);
  }

  async dismiss(value) {
    console.log('dismissValue', value);
    await this.modalController.dismiss({
      // eslint-disable-next-line quote-props
      'selection': value,
    });
  }

  getButtonStyle(button) {
    return `color: ${button.color}; --background: ${button.background};`;
  }

  getModalStyle() {
    return `color: ${this.style?.color}; --background: ${this.style?.background}; text-align: ${this.style?.textAlignment};`;
  }

  getContentColor() {
    return `margin-top: 1rem; padding: 1.2rem; color: ${this.style?.contentColor}`;
  }

  getMessage() {
    return this.message;
  }

  showImage() {
    return (
      this.icon
      && this.icon.url
      && this.icon.url !== ''
      && this.socketMessage
      && this.socketMessage.response
      && this.socketMessage.response.status === 'OK'
      && this.detectResponseEnabled === true
    )
      || (this.icon && this.icon.url && this.icon.url !== '' && !this.detectResponseEnabled);
  }
}
