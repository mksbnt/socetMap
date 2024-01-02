import { Injectable, inject } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';
import { ISignal } from '../interfaces/signal.interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  BehaviorSubject,
  catchError,
  distinctUntilChanged,
  retry,
  skip,
  tap,
  throwError,
} from 'rxjs';
import { createWebSocketSubjectFactory } from '../factories/web-socket.factory';

const message = {
  established: 'The websocket connection is established',
  lost: 'The websocket connection is lost',
};

const url = 'ws://localhost:3000';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private _webSocket: WebSocketSubject<ISignal[]> =
    createWebSocketSubjectFactory(url)();
  public get webSocket(): WebSocketSubject<ISignal[]> {
    return this._webSocket;
  }
  public set webSocket(value: WebSocketSubject<ISignal[]>) {
    this._webSocket = value;
  }

  public connectionStatus$: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);

  private snackBar: MatSnackBar = inject(MatSnackBar);

  private _isConnected = new BehaviorSubject<boolean>(false);
  public isConnected$ = this._isConnected.asObservable();

  private _previousWebSocket: WebSocketSubject<ISignal[]> | null = null;
  public get previousWebSocket(): WebSocketSubject<ISignal[]> | null {
    return this._previousWebSocket;
  }
  public set previousWebSocket(value: WebSocketSubject<ISignal[]> | null) {
    this._previousWebSocket = value;
  }

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
        retry({ delay: 5000 }), // Retry with 5-second delay
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
          ? this.showMessage(message.established)
          : this.showMessage(message.lost);
      });
  }

  showMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}
