import {
  Component,
  DestroyRef,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { SignalsService } from '../../services/signals.service';

@Component({
  selector: 'app-code',
  templateUrl: './code.component.html',
  styleUrls: ['./code.component.scss'],
  standalone: true,
  imports: [CommonModule, MatExpansionModule, MatIconModule],
})
export default class CodeComponent {
  @ViewChild(MatAccordion) accordion!: MatAccordion;
  public signalsService: SignalsService = inject(SignalsService);
}
