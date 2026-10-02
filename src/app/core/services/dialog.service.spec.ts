import { TestBed } from '@angular/core/testing';
import { AlertButton, AlertController, AlertOptions, ToastController } from '@ionic/angular';

import { ValidationError } from '../utils/app-errors';
import { DialogService } from './dialog.service';

interface FakeAlert {
  message?: string;
  cssClass?: string;
  present: jasmine.Spy;
  onDidDismiss: jasmine.Spy;
}

describe('DialogService', () => {
  let service: DialogService;
  let alerts: jasmine.SpyObj<AlertController>;
  let toasts: jasmine.SpyObj<ToastController>;
  let alert: FakeAlert;
  let dismissRole: string | undefined;

  const lastOptions = (): AlertOptions => alerts.create.calls.mostRecent().args[0]!;
  const confirmButton = (): AlertButton => (lastOptions().buttons as AlertButton[])[1];

  beforeEach(() => {
    dismissRole = undefined;
    alert = {
      present: jasmine.createSpy('present').and.resolveTo(),
      onDidDismiss: jasmine.createSpy('onDidDismiss').and.callFake(async () => ({ role: dismissRole })),
    };
    alerts = jasmine.createSpyObj<AlertController>('AlertController', ['create']);
    alerts.create.and.callFake(async (options?: AlertOptions) => {
      alert.message = options?.message as string;
      return alert as unknown as HTMLIonAlertElement;
    });
    toasts = jasmine.createSpyObj<ToastController>('ToastController', ['create']);
    toasts.create.and.resolveTo({ present: () => Promise.resolve() } as unknown as HTMLIonToastElement);

    TestBed.configureTestingModule({
      providers: [
        { provide: AlertController, useValue: alerts },
        { provide: ToastController, useValue: toasts },
      ],
    });
    service = TestBed.inject(DialogService);
  });

  describe('prompt', () => {
    it('monta os campos e devolve o valor convertido ao confirmar', async () => {
      alert.onDidDismiss.and.callFake(async () => {
        expect(confirmButton().handler!({ quantity: '5' })).toBeTrue();
        return { role: 'confirm' };
      });

      const result = await service.prompt({
        header: 'Entrada',
        message: 'Quantas?',
        fields: [
          { name: 'quantity', label: 'Quantidade', type: 'number' },
          { name: 'reason', label: 'Motivo', maxLength: 10 },
        ],
        confirmText: 'OK',
        parse: (values) => Number(values['quantity']),
      });

      expect(result).toBe(5);
      const inputs = lastOptions().inputs!;
      expect(inputs[0]).toEqual(
        jasmine.objectContaining({ name: 'quantity', type: 'number', placeholder: 'Quantidade' }),
      );
      expect(inputs[0].attributes).toEqual({ 'aria-label': 'Quantidade', min: 1, inputmode: 'numeric' });
      expect(inputs[1].attributes).toEqual({ 'aria-label': 'Motivo', maxlength: 10 });
    });

    it('mantém o diálogo aberto e mostra o erro de validação', async () => {
      alert.onDidDismiss.and.callFake(async () => {
        expect(confirmButton().handler!({})).toBeFalse();
        return { role: 'cancel' };
      });

      const result = await service.prompt({
        header: 'Entrada',
        message: 'Quantas?',
        fields: [{ name: 'quantity', label: 'Quantidade' }],
        confirmText: 'OK',
        parse: () => {
          throw new ValidationError('Número inválido');
        },
      });

      expect(result).toBeNull();
      expect(alert.message).toBe('⚠ Número inválido');
      expect(alert.cssClass).toContain('app-alert--error');
    });
  });

  it('confirm resolve verdadeiro apenas quando confirmado', async () => {
    dismissRole = 'confirm';
    expect(await service.confirm('Remover', 'Tem certeza?')).toBeTrue();
    dismissRole = 'cancel';
    expect(await service.confirm('Remover', 'Tem certeza?', 'Sim')).toBeFalse();
  });

  it('error exibe mensagem amigável', async () => {
    await service.error(new Error('detalhe interno'));
    expect(lastOptions().message).toBe('Algo deu errado. Tente novamente em instantes.');
    expect(alert.present).toHaveBeenCalled();
  });

  it('success exibe um toast', async () => {
    await service.success('Feito!');
    expect(toasts.create).toHaveBeenCalledWith(jasmine.objectContaining({ message: 'Feito!', color: 'success' }));
  });
});
