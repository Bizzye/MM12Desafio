import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { StockStatus, stockStatus } from '../../core/utils/stock.rules';

const VARIANTS: Readonly<Record<StockStatus, { css: string; label: string }>> = {
  out: { css: 'badge--danger', label: 'Esgotado' },
  low: { css: 'badge--warning', label: 'Estoque baixo' },
  ok: { css: 'badge--success', label: 'Em estoque' },
};

/** Quantidade com indicação visual (e textual, para leitores de tela) do nível de estoque. */
@Component({
  selector: 'app-stock-badge',
  template: `
    <span class="badge" [class]="variant().css" [title]="variant().label">
      {{ quantity() }}
      <span class="visually-hidden">— {{ variant().label }}</span>
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockBadgeComponent {
  readonly quantity = input.required<number>();

  protected readonly variant = computed(() => VARIANTS[stockStatus(this.quantity())]);
}
