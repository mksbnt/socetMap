import { MatButton } from '@angular/material/button';

export interface ActionDetails {
  button: MatButton;
  actionHandler: () => void;
}
