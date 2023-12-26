import { Injectable } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';
import { ISignal } from '../interfaces/signal.interface';

@Injectable({
  providedIn: 'root',
})
export class WebSocetService {
  private subject!: WebSocketSubject<ISignal[]>;

  constructor() {}

  connect() {
    if (!this.subject) {
      this.subject = new WebSocketSubject('ws://localhost:3000'); // Replace with your server URL
    }
    return this.subject;
  }

  disconnect() {
    if (this.subject) {
      this.subject.complete(); // Complete the subject to close the WebSocket connection
      // this.subject = null; // Reset the subject
    }
  }
}
