import type { CapacitorConfig } from '@capacitor/cli';

/**
 * App Android empacotado com Capacitor.
 *
 * O APK usa o build `demo` (dados em memória) para que qualquer pessoa consiga testar
 * sem conta no Firebase. Para gerar a versão conectada ao Firebase, troque `webDir`
 * para `www` e rode `npm run build` antes do `cap sync`.
 */
const config: CapacitorConfig = {
  appId: 'io.github.bizzye.mm12estoque',
  appName: 'MM12 Estoque',
  webDir: 'www-demo',
  backgroundColor: '#053742',
  plugins: {
    SystemBars: {
      insetsHandling: 'native',
      initialViewportFitValueHint: 'cover',
      style: 'DARK',
    },
  },
};

export default config;
