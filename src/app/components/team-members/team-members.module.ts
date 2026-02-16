import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

import { TeamMembersComponent } from './team-members.component';
import { ListPageComponent } from '../../layout/list-page/list-page.component';
import { TEAM_MEMBERS_ROUTES } from './team-members.routes';

@NgModule({
  declarations: [TeamMembersComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    ListPageComponent,
    RouterModule.forChild(TEAM_MEMBERS_ROUTES)
  ],
  exports: [TeamMembersComponent]
})
export class TeamMembersModule {}
