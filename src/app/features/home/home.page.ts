import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { IonIcon } from '@ionic/angular';

import { ROLE_LABELS } from '../../core/models/app-user.model';
import { AuthService } from '../../core/services/auth.service';
import { InventoryService } from '../../core/services/inventory.service';
import { stockStatus } from '../../core/utils/stock.rules';

interface Shortcut {
  readonly path: string;
  readonly title: string;
  readonly description: string;
  readonly icon: string;
  readonly adminOnly?: boolean;
}

const SHORTCUTS: readonly Shortcut[] = [
  {
    path: '/products',
    title: 'Produtos',
    description: 'Consulte o estoque e registre entradas e saídas.',
    icon: 'clipboard-outline',
  },
  {
    path: '/history',
    title: 'Histórico',
    description: 'Acompanhe todas as movimentações realizadas.',
    icon: 'time-outline',
  },
  {
    path: '/admin',
    title: 'Administração',
    description: 'Cadastre, renomeie e remova produtos.',
    icon: 'add-circle-outline',
    adminOnly: true,
  },
];

@Component({
  selector: 'app-home',
  imports: [IonIcon, RouterLink],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  private readonly auth = inject(AuthService);
  private readonly products = toSignal(inject(InventoryService).products$, { initialValue: [] });

  protected readonly user = this.auth.user;
  protected readonly roleLabel = computed(() => {
    const user = this.user();
    return user ? ROLE_LABELS[user.role] : '';
  });
  protected readonly shortcuts = computed(() => SHORTCUTS.filter((s) => !s.adminOnly || this.auth.isAdmin()));
  protected readonly stats = computed(() => {
    const products = this.products();
    return {
      products: products.length,
      units: products.reduce((total, p) => total + p.quantity, 0),
      lowStock: products.filter((p) => stockStatus(p.quantity) === 'low').length,
      outOfStock: products.filter((p) => stockStatus(p.quantity) === 'out').length,
    };
  });
}
