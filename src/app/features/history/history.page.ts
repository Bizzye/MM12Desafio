import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { IonIcon } from '@ionic/angular';

import { MOVEMENT_LABELS, MovementType } from '../../core/models/stock-movement.model';
import { InventoryService } from '../../core/services/inventory.service';
import { filterBySearch } from '../../core/utils/search';

export type MovementFilter = MovementType | 'all';

@Component({
  selector: 'app-history',
  imports: [DatePipe, FormsModule, IonIcon],
  templateUrl: './history.page.html',
  styleUrl: './history.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryPage {
  private readonly movements = toSignal(inject(InventoryService).movements$);

  protected readonly labels = MOVEMENT_LABELS;
  protected readonly loading = computed(() => this.movements() === undefined);
  protected readonly search = signal('');
  protected readonly type = signal<MovementFilter>('all');
  protected readonly filtered = computed(() => {
    const type = this.type();
    const byType = (this.movements() ?? []).filter((movement) => type === 'all' || movement.type === type);
    return filterBySearch(byType, this.search(), (movement) => movement.productName);
  });
}
