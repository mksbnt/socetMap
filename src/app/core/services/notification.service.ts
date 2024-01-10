import {inject, Injectable} from '@angular/core';
import {MatSnackBar, MatSnackBarConfig} from "@angular/material/snack-bar";

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private snackBar: MatSnackBar = inject(MatSnackBar);
  private notificationConfig: MatSnackBarConfig = {
    duration: 3000,
    horizontalPosition: 'center',
    verticalPosition: 'top',
  }

  showNotification(message: string) {
    this.snackBar.open(message, 'Close', this.notificationConfig);
  }
}
