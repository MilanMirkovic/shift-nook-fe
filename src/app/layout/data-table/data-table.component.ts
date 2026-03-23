import {
  ChangeDetectionStrategy,
  Component,
  computed, EventEmitter,
  input, Output,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export type DataTableAlign = 'start' | 'center' | 'end';

export interface DataTableColumn<T extends object> {
  /** Unique column id; also used as the Material column def name. */
  id: string;
  header: string;

  /** Either provide a field key to read from the row, or a custom function. */
  field?: keyof T;
  value?: (row: T) => unknown;

  /** Optional custom formatting for display. */
  format?: (value: unknown, row: T) => string;

  /** If true, this column participates in free-text search. Default true. */
  searchable?: boolean;

  /** Optional alignment. */
  align?: DataTableAlign;

  /** Optional fixed width. Example: '120px' */
  width?: string;
}

export interface DataTableAction<T extends object> {
  icon: string;
  label: string;
  color?: 'primary' | 'accent' | 'warn';
  handler: (row: T) => void;
  visible?: (row: T) => boolean;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataTableComponent<T extends object> {
  readonly rows = input.required<T[]>();
  readonly columns = input.required<DataTableColumn<T>[]>();
  readonly actions = input<DataTableAction<T>[]>([]);
  readonly loading = input<boolean>(false);
  @Output() rowClick = new EventEmitter<any>();
  /** Enable/disable the search input UI. */
  readonly searchable = input<boolean>(true);

  /** If true, filter rows locally using the query. If false, just emit query changes and render rows as-is. */
  readonly clientSideSearch = input<boolean>(true);

  /** Callback invoked when the search query changes (useful for server-side search). */
  readonly queryChange = input<((query: string) => void) | null>(null);

  /** Placeholder text for the search input. */
  readonly searchPlaceholder = input<string>('Search…');

  /** Rows per page; set to 0 to disable pagination. */
  readonly pageSize = input<number>(10);

  /** Optional page size options for the dropdown */
  readonly pageSizeOptions = input<number[]>([5, 10, 15, 20]);

  /** Callback for page size changes (useful for server-side pagination) */
  readonly pageSizeChange = input<((size: number) => void) | null>(null);

  /** Optional initial search query. */
  readonly initialQuery = input<string>('');

  /** Server-side pagination support */
  readonly serverSidePagination = input<boolean>(false);
  readonly totalItems = input<number>(0);
  readonly currentPage = input<number>(0);
  readonly pageChange = input<((page: number) => void) | null>(null);

  protected readonly query = signal<string>('');
  protected readonly page = signal<number>(1);

  constructor() {
    this.query.set(this.initialQuery());
  }

  protected readonly displayedColumnIds = computed(() => {
    const cols = this.columns().map((c) => c.id);
    if (this.actions().length > 0) {
      cols.push('actions');
    }
    return cols;
  });

  private readonly searchTextForRow = computed(() => {
    const cols = this.columns();
    const searchableCols = cols.filter((c) => c.searchable !== false);

    return (row: T) =>
      searchableCols
        .map((c) => {
          const v = this.resolveValue(row, c);
          return v == null ? '' : String(v);
        })
        .join(' ')
        .toLowerCase();
  });

  protected readonly filteredRows = computed(() => {
    const q = this.query().trim().toLowerCase();
    const rows = this.rows();

    // If client-side search is disabled, keep UI but do not filter locally.
    if (!this.searchable() || !this.clientSideSearch() || q.length === 0) return rows;

    const rowText = this.searchTextForRow();
    return rows.filter((r) => rowText(r).includes(q));
  });

  protected readonly totalPages = computed(() => {
    const size = this.pageSize();
    if (size <= 0) return 1;

    // Use server-side total if enabled
    if (this.serverSidePagination()) {
      return Math.max(1, Math.ceil(this.totalItems() / size));
    }

    return Math.max(1, Math.ceil(this.filteredRows().length / size));
  });

  protected readonly currentPageDisplay = computed(() => {
    if (this.serverSidePagination()) {
      return this.currentPage() + 1; // Backend uses 0-based, display is 1-based
    }
    return this.page();
  });

  protected readonly canGoPrev = computed(() => {
    if (this.serverSidePagination()) {
      return this.currentPage() > 0;
    }
    return this.page() > 1;
  });

  protected readonly canGoNext = computed(() => {
    if (this.serverSidePagination()) {
      return this.currentPage() < this.totalPages() - 1;
    }
    return this.page() < this.totalPages();
  });

  protected readonly pagedRows = computed(() => {
    const size = this.pageSize();
    const rows = this.filteredRows();

    if (size <= 0) return rows;

    // For server-side pagination, show all rows (already paginated by server)
    if (this.serverSidePagination()) {
      return rows;
    }

    const total = this.totalPages();
    const clampedPage = Math.min(Math.max(this.page(), 1), total);
    if (clampedPage !== this.page()) this.page.set(clampedPage);

    const start = (clampedPage - 1) * size;
    return rows.slice(start, start + size);
  });

  protected setQuery(v: string): void {
    this.query.set(v);
    this.page.set(1);

    const cb = this.queryChange();
    if (cb) cb(v);
  }

  protected clearQuery(): void {
    this.setQuery('');
  }

  protected prevPage(): void {
    if (this.serverSidePagination()) {
      const cb = this.pageChange();
      const newPage = Math.max(0, this.currentPage() - 1);
      if (cb) cb(newPage);
    } else {
      this.page.update((p) => Math.max(1, p - 1));
    }
  }

  protected nextPage(): void {
    if (this.serverSidePagination()) {
      const cb = this.pageChange();
      const maxPage = Math.ceil(this.totalItems() / this.pageSize()) - 1;
      const newPage = Math.min(maxPage, this.currentPage() + 1);
      if (cb) cb(newPage);
    } else {
      this.page.update((p) => Math.min(this.totalPages(), p + 1));
    }
  }

  protected onPageSizeChange(newSize: number): void {
    const cb = this.pageSizeChange();
    if (cb) {
      cb(newSize);
    }
  }

  protected resolveValue(row: T, col: DataTableColumn<T>): unknown {
    if (col.value) return col.value(row);
    if (col.field) return (row as any)[col.field];
    return undefined;
  }

  protected formatValue(row: T, col: DataTableColumn<T>): string {
    const v = this.resolveValue(row, col);
    if (col.format) return col.format(v, row);
    return v == null ? '' : String(v);
  }

  protected colStyle(col: DataTableColumn<T>): Record<string, string> {
    const style: Record<string, string> = {};
    if (col.width) style['width'] = col.width;
    if (col.align === 'center') style['text-align'] = 'center';
    if (col.align === 'end') style['text-align'] = 'right';
    return style;
  }

  protected isActionVisible(action: DataTableAction<T>, row: T): boolean {
    return action.visible ? action.visible(row) : true;
  }

  onRowClick(row: any): void {
    this.rowClick.emit(row);
  }

}
