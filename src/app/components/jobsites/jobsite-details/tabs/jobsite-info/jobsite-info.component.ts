import { Component, Input } from '@angular/core';
import { Jobsite } from '../../../../../store/jobsites/jobsites.models';
import { Client } from '../../../../../store/clients/clients.models';

@Component({
  selector: 'app-jobsite-info',
  standalone: false,
  templateUrl: './jobsite-info.component.html',
  styleUrls: ['./jobsite-info.component.scss']
})
export class JobsiteInfoComponent {
  @Input() jobsite!: Jobsite;
  @Input() client: Client | null = null;
}

