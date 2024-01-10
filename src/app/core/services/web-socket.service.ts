import {Injectable, inject} from '@angular/core';
import {WebSocketSubject} from 'rxjs/webSocket';
import {ISignal} from '../interfaces/signal.interface';
import {MatSnackBar} from '@angular/material/snack-bar';
import {
  BehaviorSubject,
  catchError,
  distinctUntilChanged,
  retry,
  skip,
  tap,
  throwError,
} from 'rxjs';
import {createWebSocketSubjectFactory} from '../factories/web-socket.factory';
import {NotificationService} from "./notification.service";

const message = {
  established: 'The websocket connection is established',
  lost: 'The websocket connection is lost',
};

const url = 'ws://localhost:3000';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private notificationService = inject(NotificationService);
  public connectionStatus$ = new BehaviorSubject<boolean>(false);
  private _isConnected = new BehaviorSubject<boolean>(false);
  // public isConnected$ = this._isConnected.asObservable();

  constructor() {
    this._webSocket
      .pipe(
        tap(() => this.connectionStatus$.next(true)),
        catchError((error) => {
          this.connectionStatus$.next(false);

          return throwError(
            () => new Error('WebSocket connection failed', error)
          );
        }),
        retry({delay: 5000}), // Retry with 5-second delay
        tap(() => {
          this.connectionStatus$.next(true);
        })
      )
      .subscribe();

    this.connectionStatus$
      .asObservable()
      .pipe(distinctUntilChanged(), skip(1))
      .subscribe((value) => {
        value
          ? this.showNotification(message.established)
          : this.showNotification(message.lost);
      });
  }

  private _webSocket: WebSocketSubject<ISignal[]> =
    createWebSocketSubjectFactory(url)();

  public get webSocket(): WebSocketSubject<ISignal[]> {
    return this._webSocket;
  }

  public set webSocket(value: WebSocketSubject<ISignal[]>) {
    this._webSocket = value;
  }

  showNotification(message: string): void {
    this.notificationService.showNotification(message)
  }
}
