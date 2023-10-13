
/* WEBSOCKETS */
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SocketClient } from '../models/socket-client-model';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { of, Subject, Subscription } from 'rxjs';
import { StorageService } from './storage.service';
import { SocketRquestModalComponent } from '../components/socket-request-modal/socket-rquest-modal.component';
import { ModalController } from '@ionic/angular';

declare interface DeviceWsResponse {
  commandRequested?: string;
  completed?: boolean;
  timeout?: number;
}
@Injectable()
export class SocketProviderConnect {

  appKey; // Variable que permite asociar aplicaciones y dispositivos en una misma sala
  subscription: Subscription = new Subscription();

  public socketMessage = new Subject<any>(); // Último mensaje recibido
  public socketConversation = new Subject<any>(); // Lista de mensajes desde la últoima conexión

  subject: WebSocketSubject<any>; //La conexión en sí, es la que nos va a permitir leer (.subscribe) o escribir (.next())
  commandQueue: DeviceWsResponse[] = []; // Cola donde se almacenan los comandos enviados a los dispositivos y pendientes de respuesta

  private localConversation: string[] = []; // lista de mensajes alamacenada desde la última conexión

  constructor(
    private readonly storageService: StorageService,
  ) { }

  unsubscribe() {
    this.subscription.unsubscribe();
  }

  public getSocketServerUrl() {
    return environment.server_socket;
  }

  public getLocalConversation(): string[] {
    return this.localConversation;
  }

  public onConnect(_payload: SocketClient = {}): any { // ---> El payload recibido viene desde el appComponent en el ngOnInit()
    try {
      //Establecemos conexión
      this.subject = webSocket(environment.server_socket);
      // Leemos del servidor. Nos suscribimos. A partir de ahora vamos a recibir todos los mensajes del servidor aquí
      this.subscribeWsServer();
      // Notificamos un mensaje inicial con los datos necesarios para que el ws server nos identifique
      this.notifyConnectionToServer();
    } catch (err) {
      console.log('CONNECTION SOCKET SERVER ERROR ' + err);
    }
  }

  /* Establece un nuevo mensaje en la conexión con el servidor. El formato del mensaje viene defuinido por la interfaz SocketClient */
  send(payload: any) {
    this.subject.next(payload);
  }


  /**
   *  Lee y gestiona el guardado y la verificación de mensajes a través de handleSocketMessage()
   */
  private subscribeWsServer() {
    this.subscription = this.subject.subscribe(ws => {
      console.log('Socket Data', ws);
      this.socketMessage.next(ws);
      this.handleSocketMessage(ws);
    });
  }

  /**
   * Recupera el appKey del storage y envía un mensaje para identificar el usuario en el socket server
   */
  private notifyConnectionToServer() {
    this.storageService.getItem('USER').then(data => {
      this.appKey = data.user.appKey;
      this.send({ event: 'CONNECTION', data: { deviceType: 'APP', appKey: this.appKey, user: data.user.email } });
    });
  }

  /**
   * Identifica el tipo de mensaje y lo almacena en memoria
   *
   * @param socketData
   */
  private handleSocketMessage(socketData: any) {
    this.socketMessage.next(socketData);
    this.localConversation.push(socketData);
    this.socketConversation.next(this.localConversation);
  }
}

