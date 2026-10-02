import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { IonIcon } from '@ionic/angular';

import { Product } from '../../core/models/product.model';
import { DialogService } from '../../core/services/dialog.service';
import { InventoryService } from '../../core/services/inventory.service';
import { ValidationError } from '../../core/utils/app-errors';
import { filterBySearch } from '../../core/utils/search';
import { parseQuantity } from '../../core/utils/stock.rules';
import { StockBadgeComponent } from '../../shared/components/stock-badge.component';

@Component({
  selector: 'app-products',
  imports: [DatePipe, FormsModule, IonIcon, StockBadgeComponent],
  templateUrl: './products.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsPage {
  private readonly inventory = inject(InventoryService);
  private readonly dialog = inject(DialogService);

  private readonly products = toSignal(this.inventory.products$);

  protected readonly loading = computed(() => this.products() === undefined);
  protected readonly search = signal('');
  protected readonly filtered = computed(() =>
    filterBySearch(this.products() ?? [], this.search(), (product) => product.name),
  );

  protected async registerEntry(product: Product): Promise<void> {
    const quantity = await this.dialog.prompt({
      header: 'Entrada de estoque',
      message: `Quantas unidades de "${product.name}" entraram?`,
      fields: [{ name: 'quantity', label: 'Quantidade', type: 'number' }],
      confirmText: 'Registrar entrada',
      parse: (values) => parseQuantity(values['quantity']),
    });
    if (quantity === null) {
      return;
    }
    await this.run(() => this.inventory.registerEntry(product.id, quantity), 'Entrada registrada com sucesso!');
  }

  protected async registerExit(product: Product): Promise<void> {
    const request = await this.dialog.prompt({
      header: 'Saída de estoque',
      message: `Disponível: ${product.quantity} unidade(s) de "${product.name}".`,
      fields: [
        { name: 'quantity', label: 'Quantidade', type: 'number' },
        { name: 'reason', label: 'Motivo da saída', maxLength: 120 },
      ],
      confirmText: 'Registrar saída',
      parse: (values) => {
        const quantity = parseQuantity(values['quantity']);
        if (quantity > product.quantity) {
          throw new ValidationError(`Estoque insuficiente: há apenas ${product.quantity} unidade(s).`);
        }
        const reason = (values['reason'] ?? '').trim();
        if (!reason) {
          throw new ValidationError('Informe o motivo da saída.');
        }
        return { quantity, reason };
      },
    });
    if (request === null) {
      return;
    }
    await this.run(
      () => this.inventory.registerExit(product.id, request.quantity, request.reason),
      'Saída registrada com sucesso!',
    );
  }

  private async run(action: () => Promise<unknown>, successMessage: string): Promise<void> {
    try {
      await action();
      await this.dialog.success(successMessage);
    } catch (error) {
      await this.dialog.error(error);
    }
  }
}
