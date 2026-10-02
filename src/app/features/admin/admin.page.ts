import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonIcon } from '@ionic/angular';

import { Product } from '../../core/models/product.model';
import { DialogService } from '../../core/services/dialog.service';
import { InventoryService } from '../../core/services/inventory.service';
import { filterBySearch } from '../../core/utils/search';
import { MAX_PRODUCT_NAME_LENGTH } from '../../core/utils/stock.rules';
import { StockBadgeComponent } from '../../shared/components/stock-badge.component';

interface EditState {
  readonly id: string;
  readonly name: string;
}

@Component({
  selector: 'app-admin',
  imports: [FormsModule, IonIcon, ReactiveFormsModule, StockBadgeComponent],
  templateUrl: './admin.page.html',
  styleUrl: './admin.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPage {
  private readonly inventory = inject(InventoryService);
  private readonly dialog = inject(DialogService);
  private readonly products = toSignal(this.inventory.products$);

  protected readonly maxNameLength = MAX_PRODUCT_NAME_LENGTH;
  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [Validators.required, Validators.maxLength(MAX_PRODUCT_NAME_LENGTH)]],
    quantity: [0, [Validators.required, Validators.min(0)]],
  });
  protected readonly saving = signal(false);
  protected readonly editing = signal<EditState | null>(null);
  protected readonly search = signal('');
  protected readonly loading = computed(() => this.products() === undefined);
  protected readonly filtered = computed(() =>
    filterBySearch(this.products() ?? [], this.search(), (product) => product.name),
  );

  protected async addProduct(): Promise<void> {
    const { name, quantity } = this.form.getRawValue();
    this.saving.set(true);
    try {
      await this.inventory.addProduct(name, quantity);
      this.form.reset();
      await this.dialog.success(`"${name.trim()}" cadastrado!`);
    } catch (error) {
      await this.dialog.error(error);
    } finally {
      this.saving.set(false);
    }
  }

  protected startEdit(product: Product): void {
    this.editing.set({ id: product.id, name: product.name });
  }

  protected updateDraft(name: string): void {
    this.editing.update((state) => (state ? { ...state, name } : state));
  }

  protected cancelEdit(): void {
    this.editing.set(null);
  }

  protected async saveEdit(): Promise<void> {
    const state = this.editing();
    if (!state) {
      return;
    }
    try {
      await this.inventory.renameProduct(state.id, state.name);
      this.editing.set(null);
      await this.dialog.success('Produto renomeado!');
    } catch (error) {
      await this.dialog.error(error);
    }
  }

  protected async remove(product: Product): Promise<void> {
    const confirmed = await this.dialog.confirm(
      'Remover produto',
      `Tem certeza que deseja remover "${product.name}"? O histórico de movimentações será mantido.`,
      'Remover',
    );
    if (!confirmed) {
      return;
    }
    try {
      await this.inventory.removeProduct(product.id);
      await this.dialog.success('Produto removido.');
    } catch (error) {
      await this.dialog.error(error);
    }
  }
}
