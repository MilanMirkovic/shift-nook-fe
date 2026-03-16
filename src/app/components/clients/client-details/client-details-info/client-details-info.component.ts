import { Component, Input } from '@angular/core';
import { DatePipe, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Client } from '../../../../store/clients/clients.models';

@Component({
  selector: 'app-client-details-info',
  standalone: true,
  templateUrl: './client-details-info.component.html',
  styleUrls: ['./client-details-info.component.scss'],
  imports: [
    DatePipe,
    NgIf,
    MatIconModule,
  ],
})
export class ClientDetailsInfoComponent {
  @Input({ required: true }) client!: Client;
}

