import { Injectable, inject } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';

import { toUserMessage } from '../utils/app-errors';

export interface PromptField {
  readonly name: string;
  readonly label: string;
  readonly type?: 'text' | 'number';
  readonly maxLength?: number;
}

export interface PromptOptions<T> {
  readonly header: string;
  readonly message: string;
  readonly fields: readonly PromptField[];
  readonly confirmText: string;
  /** Converte/valida os valores digitados; se lançar erro, o diálogo continua aberto exibindo a mensagem. */
  readonly parse: (values: Record<string, string>) => T;
}

/**
 * Adapter sobre os overlays do Ionic (alert/toast). Os componentes dependem desta
 * abstração, o que facilita os testes e evita espalhar configuração de UI pelo app.
 *
 * Observação de segurança: o Ionic trata `message` como texto puro
 * (`innerHTMLTemplatesEnabled` é `false` por padrão), então nomes digitados pelo
 * usuário não são interpretados como HTML.
 */
@Injectable({ providedIn: 'root' })
export class DialogService {
  private readonly alerts = inject(AlertController);
  private readonly toasts = inject(ToastController);

  async prompt<T>(options: PromptOptions<T>): Promise<T | null> {
    let result: T | null = null;
    const alert = await this.alerts.create({
      header: options.header,
      message: options.message,
      cssClass: 'app-alert',
      inputs: options.fields.map((field) => ({
        name: field.name,
        type: field.type ?? 'text',
        placeholder: field.label,
        attributes: {
          'aria-label': field.label,
          ...(field.type === 'number' ? { min: 1, inputmode: 'numeric' } : {}),
          ...(field.maxLength ? { maxlength: field.maxLength } : {}),
        },
      })),
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: options.confirmText,
          role: 'confirm',
          handler: (values: Record<string, string>) => {
            try {
              result = options.parse(values);
              return true;
            } catch (error) {
              alert.message = `⚠ ${toUserMessage(error)}`;
              alert.cssClass = 'app-alert app-alert--error';
              return false;
            }
          },
        },
      ],
    });
    await alert.present();
    await alert.onDidDismiss();
    return result;
  }

  async confirm(header: string, message: string, confirmText = 'Confirmar'): Promise<boolean> {
    const alert = await this.alerts.create({
      header,
      message,
      cssClass: 'app-alert',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: confirmText, role: 'confirm', cssClass: 'app-alert__danger' },
      ],
    });
    await alert.present();
    const { role } = await alert.onDidDismiss();
    return role === 'confirm';
  }

  async error(error: unknown): Promise<void> {
    const alert = await this.alerts.create({
      header: 'Ops...',
      message: toUserMessage(error),
      cssClass: 'app-alert',
      buttons: ['OK'],
    });
    await alert.present();
  }

  async success(message: string): Promise<void> {
    const toast = await this.toasts.create({
      message,
      duration: 2500,
      color: 'success',
      position: 'top',
      icon: 'checkmark-circle-outline',
    });
    await toast.present();
  }
}
