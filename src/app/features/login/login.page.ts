import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonContent, IonIcon } from '@ionic/angular';

import { DEMO_LOGIN_HINT } from '../../core/infra/demo-login-hint';
import { AuthService } from '../../core/services/auth.service';
import { toUserMessage } from '../../core/utils/app-errors';

@Component({
  selector: 'app-login',
  imports: [IonContent, IonIcon, ReactiveFormsModule],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private readonly auth = inject(AuthService);

  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly demoHint = inject(DEMO_LOGIN_HINT);

  protected fillDemo(email: string, password: string): void {
    this.form.setValue({ email, password });
    this.errorMessage.set(null);
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage.set('Informe um e-mail válido e a senha.');
      return;
    }
    this.loading.set(true);
    this.errorMessage.set(null);
    try {
      const { email, password } = this.form.getRawValue();
      await this.auth.signIn(email, password);
    } catch (error) {
      this.errorMessage.set(toUserMessage(error));
      this.form.controls.password.reset();
    } finally {
      this.loading.set(false);
    }
  }
}
