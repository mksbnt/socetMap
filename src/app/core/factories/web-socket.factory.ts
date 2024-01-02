import { WebSocketSubject } from 'rxjs/webSocket';
import { ISignal } from '../interfaces/signal.interface';

export function createWebSocketSubjectFactory(url: string) {
  return () => new WebSocketSubject<ISignal[]>(url);
}
