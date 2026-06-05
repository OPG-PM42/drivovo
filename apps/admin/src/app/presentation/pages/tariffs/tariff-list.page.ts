import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TuiTable, TuiTablePagination, TuiTablePaginationEvent } from '@taiga-ui/addon-table';
import { TuiButton, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { TuiSelect } from '@taiga-ui/kit';
import { TariffEntity } from '../../../domain/tariff';
import { TariffUseCase } from '../../../application/use-cases/tariff.use-case';
import { ConfirmDialogService } from '../../shared/ui/confirm-dialog.service';

@Component({
  selector: 'app-tariff-list-page',
  standalone: true,
  imports: [
    FormsModule,
    TuiTable,
    TuiTablePagination,
    TuiButton,
    TuiLoader,
    TuiTextfield,
    ...TuiSelect,
  ],
  templateUrl: './tariff-list.page.html',
  styleUrl: './tariff-list.page.scss',
})
export class TariffListPage implements OnInit {
  readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly tariffUseCase = inject(TariffUseCase);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly columns = ['name', 'type', 'options', 'actions'];
  readonly sizeOptions = [10, 20, 50] as const;
  readonly filterOptions = ['', 'leasing', 'subscription'] as const;
  readonly loading = signal(false);
  readonly items = signal<TariffEntity[]>([]);
  readonly total = signal(0);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(20);
  readonly typeFilter = signal<'' | TariffEntity['type']>('');

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    const filter = this.typeFilter();
    const params = {
      page: this.pageIndex(),
      limit: this.pageSize(),
      ...(filter ? { type: filter as TariffEntity['type'] } : {}),
    };
    this.tariffUseCase.getAll(params).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: ({ items, total }) => {
        this.items.set(items);
        this.total.set(total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onFilterChange(value: '' | TariffEntity['type']): void {
    this.typeFilter.set(value);
    this.pageIndex.set(0);
    this.load();
  }

  onPagination(event: TuiTablePaginationEvent): void {
    this.pageIndex.set(event.page);
    this.pageSize.set(event.size);
    this.load();
  }

  edit(tariff: TariffEntity): void {
    this.router.navigate(['/tariffs', tariff.id, 'edit']);
  }

  delete(tariff: TariffEntity): void {
    this.confirmDialog
      .confirm({
        title: 'Delete Tariff',
        message: `Delete "${tariff.name}"?`,
        confirmLabel: 'Delete',
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (confirmed) {
          this.tariffUseCase.delete(tariff.id).pipe(
            takeUntilDestroyed(this.destroyRef),
          ).subscribe(() => this.load());
        }
      });
  }
}
