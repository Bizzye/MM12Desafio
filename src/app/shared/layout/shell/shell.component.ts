import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';

import { environment } from '../../../../environments/environment';
import { ROLE_LABELS } from '../../../core/models/app-user.model';
import { AuthService } from '../../../core/services/auth.service';
import { DialogService } from '../../../core/services/dialog.service';
import { SideMenuComponent } from '../side-menu/side-menu.component';

/** Layout das rotas autenticadas: barra superior + menu lateral + conteúdo. */
@Component({
  selector: 'app-shell',
  imports: [IonContent, IonIcon, RouterLink, RouterOutlet, SideMenuComponent],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent {
  private readonly auth = inject(AuthService);
  private readonly dialog = inject(DialogService);

  protected readonly demoMode = environment.demoMode;
  protected readonly user = this.auth.user;
  protected readonly isAdmin = this.auth.isAdmin;
  protected readonly roleLabel = computed(() => {
    const user = this.user();
    return user ? ROLE_LABELS[user.role] : '';
  });

  protected async logout(): Promise<void> {
    try {
      await this.auth.signOut();
    } catch (error) {
      await this.dialog.error(error);
    }
  }
}
