import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonIcon } from '@ionic/angular';

export interface MenuItem {
  readonly path: string;
  readonly label: string;
  /** Rótulo visível (curto); `label` completo vai para aria-label/tooltip. */
  readonly shortLabel?: string;
  readonly icon: string;
  readonly adminOnly?: boolean;
}

export const MENU_ITEMS: readonly MenuItem[] = [
  { path: '/home', label: 'Início', icon: 'home-outline' },
  { path: '/products', label: 'Produtos', icon: 'clipboard-outline' },
  { path: '/history', label: 'Histórico', icon: 'time-outline' },
  { path: '/admin', label: 'Administração', shortLabel: 'Admin', icon: 'add-circle-outline', adminOnly: true },
];

@Component({
  selector: 'app-side-menu',
  imports: [IonIcon, RouterLink, RouterLinkActive],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideMenuComponent {
  readonly isAdmin = input(false);
  readonly logout = output();

  protected readonly items = computed(() => MENU_ITEMS.filter((item) => !item.adminOnly || this.isAdmin()));
}
