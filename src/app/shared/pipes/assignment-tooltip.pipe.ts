import { Pipe, PipeTransform } from '@angular/core';
import { WorkerAssignment } from '../../store/subcontractors/subcontractors.models';

/**
 * Transforms a list of WorkerAssignment objects into a readable tooltip string.
 * e.g. "Acme Corp\nBeta Ltd\nGamma Inc"
 */
@Pipe({
  name: 'assignmentTooltip',
  standalone: true,
})
export class AssignmentTooltipPipe implements PipeTransform {
  transform(assignments: WorkerAssignment[]): string {
    if (!assignments?.length) return '';
    return assignments.map(a => a.ownerCompanyName).join('\n');
  }
}

