import {ChangeDetectionStrategy, Component, ContentChild, EventEmitter, input, Output, TemplateRef} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

import { PageLayoutComponent } from '../page-layout/page-layout.component';
import {
  DataTableComponent,
  DataTableColumn,
  DataTableAction
} from '../data-table/data-table.component';

@Component({
  selector: 'app-list-page',
  standalone: true,
  imports: [PageLayoutComponent, DataTableComponent, NgTemplateOutlet],
  templateUrl: './list-page.component.html',
  styleUrl: './list-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListPageComponent<T extends object> {
  readonly title = input.required<string>();
  readonly subtitle = input<string | undefined>(undefined);

  readonly rows = input.required<T[]>();
  readonly columns = input.required<DataTableColumn<T>[]>();
  readonly actions = input<DataTableAction<T>[]>([]);

  readonly searchPlaceholder = input<string>('Search…');
  readonly pageSize = input<number>(10);

  /** Whether the table should render its built-in client-side search box. */
  readonly searchable = input<boolean>(true);

  /** If false, the built-in search UI will not filter locally (use server-side search instead). */
  readonly clientSideSearch = input<boolean>(true);

  /** Callback invoked when the user types into the built-in search input. */
  readonly queryChange = input<((query: string) => void) | null>(null);

  /** Server-side pagination support */
  readonly serverSidePagination = input<boolean>(false);
  readonly totalItems = input<number>(0);
  readonly currentPage = input<number>(0);
  readonly pageChange = input<((page: number) => void) | null>(null);
  readonly pageSizeOptions = input<number[]>([5, 10, 20, 50]);
  readonly pageSizeChange = input<((size: number) => void) | null>(null);
  @Output() rowClick = new EventEmitter<any>();

  @ContentChild('pageActions') pageActionsTemplate?: TemplateRef<any>;

}
