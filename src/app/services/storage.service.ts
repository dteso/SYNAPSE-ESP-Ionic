import { Injectable } from '@angular/core';

//import { Events } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Subject } from 'rxjs';

@Injectable()
export class StorageService {

  public currentToken;

  private serialConnected = new Subject<any>();

  constructor(
    public storage: Storage
  ) {
    this.storage.create();
  }

  async getItem(key): Promise<any> {
    return await this.storage.get(key);
  }

  async setItem(key, value): Promise<any> {
    return await this.storage.set(key, value);
  }

  clear(key: string) {
    return this.storage.remove(key);
  }


  getSerialConnected() {
    return this.serialConnected;
  }

  setSerialConnected(connected) {
    this.serialConnected.next(connected);
  }
}
