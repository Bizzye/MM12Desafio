import { EnvironmentProviders, Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular';
import { addIcons } from 'ionicons';

import { DEMO_PASSWORD, DemoSeed, createDemoSeed } from '../app/core/infra/in-memory/demo-data';
import { provideInMemoryDataAccess } from '../app/core/infra/in-memory/in-memory.providers';
import { DEMO_SEED, DEMO_SESSION_STORAGE, SessionStorageLike } from '../app/core/infra/in-memory/in-memory.store';
import { AppUser } from '../app/core/models/app-user.model';
import { AuthRepository } from '../app/core/repositories/auth.repository';
import { DialogService } from '../app/core/services/dialog.service';
import { APP_ICONS } from '../app/shared/app-icons';

/** Data fixa para que datas dos dados de demonstração sejam determinísticas. */
export const FIXED_NOW = Date.UTC(2026, 0, 15, 12, 0, 0);

export class MemoryStorage implements SessionStorageLike {
  private readonly data = new Map<string, string>();

  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }
}

export function provideTestDataAccess(seed: DemoSeed = createDemoSeed(FIXED_NOW)): (Provider | EnvironmentProviders)[] {
  return [
    provideInMemoryDataAccess(),
    { provide: DEMO_SEED, useValue: seed },
    { provide: DEMO_SESSION_STORAGE, useValue: new MemoryStorage() },
  ];
}

export type DialogStub = jasmine.SpyObj<DialogService>;

export function createDialogStub(): DialogStub {
  const stub = jasmine.createSpyObj<DialogService>('DialogService', ['prompt', 'confirm', 'error', 'success']);
  stub.prompt.and.resolveTo(null);
  stub.confirm.and.resolveTo(true);
  stub.error.and.resolveTo();
  stub.success.and.resolveTo();
  return stub;
}

/** Providers comuns para testes de componentes: router "pega-tudo", Ionic, dados em memória e diálogos falsos. */
export function provideTestApp(dialog: DialogStub = createDialogStub()): (Provider | EnvironmentProviders)[] {
  addIcons(APP_ICONS);
  return [
    provideRouter([{ path: '**', children: [] }]),
    provideIonicAngular({ mode: 'md' }),
    ...provideTestDataAccess(),
    { provide: DialogService, useValue: dialog },
  ];
}

export async function signInAs(user: AppUser): Promise<void> {
  await TestBed.inject(AuthRepository).signIn(user.email, DEMO_PASSWORD);
}

/** Atalhos de consulta ao DOM renderizado. */
export function queryAll<T extends Element = HTMLElement>(root: HTMLElement, selector: string): T[] {
  return Array.from(root.querySelectorAll<T>(selector));
}

export function textOf(root: HTMLElement): string {
  return (root.textContent ?? '').replace(/\s+/g, ' ').trim();
}

export function setInputValue(input: HTMLInputElement | HTMLSelectElement, value: string): void {
  input.value = value;
  input.dispatchEvent(new Event(input instanceof HTMLSelectElement ? 'change' : 'input'));
}
