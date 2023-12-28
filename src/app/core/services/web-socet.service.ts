import { Injectable } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';
import { ISignal } from '../interfaces/signal.interface';

@Injectable({
  providedIn: 'root',
})
export class WebSocetService {
  private subject!: WebSocketSubject<ISignal[]>;

  connect() {
    if (!this.subject) {
      this.subject = new WebSocketSubject('ws://localhost:3000');
    }
    return this.subject;
  }

  disconnect() {
    if (this.subject) {
      this.subject.complete();
    }
  }
}
