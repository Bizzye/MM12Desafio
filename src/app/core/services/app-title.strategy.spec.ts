import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { TitleStrategy, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { AppTitleStrategy } from './app-title.strategy';

@Component({ template: '' })
class BlankComponent {}

describe('AppTitleStrategy', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'products', title: 'Produtos', component: BlankComponent },
          { path: 'untitled', component: BlankComponent },
        ]),
        { provide: TitleStrategy, useClass: AppTitleStrategy },
      ],
    }),
  );

  it('compõe o título da página com o nome do app', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/products');
    expect(TestBed.inject(Title).getTitle()).toBe('Produtos · MM12 Estoque');

    await harness.navigateByUrl('/untitled');
    expect(TestBed.inject(Title).getTitle()).toBe('MM12 Estoque');
  });
});
