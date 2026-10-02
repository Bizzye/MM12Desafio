import { TestBed } from '@angular/core/testing';

import { textOf } from '../../../testing/test-helpers';
import { StockBadgeComponent } from './stock-badge.component';

describe('StockBadgeComponent', () => {
  async function render(quantity: number): Promise<HTMLElement> {
    const fixture = TestBed.createComponent(StockBadgeComponent);
    fixture.componentRef.setInput('quantity', quantity);
    await fixture.whenStable();
    return fixture.nativeElement.querySelector('.badge');
  }

  for (const [quantity, css, label] of [
    [0, 'badge--danger', 'Esgotado'],
    [5, 'badge--warning', 'Estoque baixo'],
    [50, 'badge--success', 'Em estoque'],
  ] as const) {
    it(`indica "${label}" para ${quantity} unidade(s)`, async () => {
      const badge = await render(quantity);
      expect(badge.classList).toContain('badge');
      expect(badge.classList).toContain(css);
      expect(textOf(badge)).toBe(`${quantity} — ${label}`);
    });
  }
});
