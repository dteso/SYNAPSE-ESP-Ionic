import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SocketClient } from 'src/app/models/socket-client-model';
import { StorageService } from 'src/app/services/storage.service';
import { SocketProviderConnect } from 'src/app/services/web-socket.service';

@Component({
  selector: 'app-sockets-client',
  templateUrl: './sockets-client.component.html',
  styleUrls: ['./sockets-client.component.scss'],
})
export class SocketsClientComponent implements OnInit {

  @ViewChild('file') file: ElementRef;

  socketServerUrl;
  socketClient: SocketClient;
  message;

  conversation: string[] = [];
  fullStream: Observable<any[]>;

  constructor(
    protected socketService: SocketProviderConnect,
    private readonly storageService: StorageService,
  ) {

  }

  ngOnInit(): void {
    this.socketService.onConnect();

    this.fullStream = of(this.socketService.getLocalConversation());
    this.socketService.socketConversation.subscribe(conversation => {
      const reversedConversation = this.getReversedConversation(conversation);
      this.fullStream = of(reversedConversation);
      console.log(conversation);
    });
  }

  getReversedConversation(conversation: any[]) {
    const reversedArray: any[] = [];
    for (let i = 0; i < conversation.length; i++) {
      const message = conversation[(conversation.length - 1) - i];
      reversedArray.push({ date: new Date(), event: message.event, data: message.data });
    }
    return reversedArray;
  }

  sendMessage() {
    if (this.message) {
      this.storageService.getItem('USER').then(item => {
        const commandMessage = {
          event: 'USER_COMMAND',
          data: {
            payload: this.message,
            appKey: item.user.appKey
          }
        };
        this.socketService.send(commandMessage);
        this.message = '';
      });
    }
  }
}
