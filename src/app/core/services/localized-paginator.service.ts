import { effect, inject, Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { I18nService } from './i18n.service';

@Injectable()
export class LocalizedPaginator extends MatPaginatorIntl {
  private readonly i18n = inject(I18nService);
  constructor() {
    super();
    effect(() => {
      this.itemsPerPageLabel = this.i18n.t('pagination.items');
      this.nextPageLabel = this.i18n.t('pagination.next');
      this.previousPageLabel = this.i18n.t('pagination.previous');
      this.firstPageLabel = this.i18n.t('pagination.first');
      this.lastPageLabel = this.i18n.t('pagination.last');
      this.changes.next();
    });
  }
  override getRangeLabel = (page: number, size: number, length: number): string => {
    const start = length && size ? page * size + 1 : 0;
    return `${start}–${Math.min((page + 1) * size, length)} ${this.i18n.t('pagination.of')} ${length}`;
  };
}
