// Prepara o backend Firebase de produção: cria/atualiza as contas de administrador e
// estoquista, grava os perfis em users/{uid} e, se o catálogo estiver vazio, cadastra
// produtos e um histórico inicial coerente com os saldos.
//
// Roda com privilégios de Admin SDK (ignora as regras do Firestore), por isso fica no
// workflow manual `.github/workflows/seed.yml`, que lê tudo de secrets:
//   FIREBASE_SERVICE_ACCOUNT, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD,
//   SEED_STOCKIST_EMAIL, SEED_STOCKIST_PASSWORD
// É idempotente: rodar de novo só redefine as senhas e os perfis.
import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variável de ambiente ausente: ${name}`);
  }
  return value;
}

initializeApp({ credential: cert(JSON.parse(required('FIREBASE_SERVICE_ACCOUNT'))) });
const auth = getAuth();
const db = getFirestore();

const ACCOUNTS = [
  {
    email: required('SEED_ADMIN_EMAIL'),
    password: required('SEED_ADMIN_PASSWORD'),
    name: 'Administrador',
    role: 'adm',
  },
  {
    email: required('SEED_STOCKIST_EMAIL'),
    password: required('SEED_STOCKIST_PASSWORD'),
    name: 'Estoquista',
    role: 'est',
  },
];

async function upsertAccount({ email, password, name, role }) {
  let user;
  try {
    user = await auth.getUserByEmail(email);
    await auth.updateUser(user.uid, { password, displayName: name });
  } catch (error) {
    if (error?.code !== 'auth/user-not-found') {
      throw error;
    }
    user = await auth.createUser({ email, password, displayName: name, emailVerified: true });
  }
  await db.doc(`users/${user.uid}`).set({ nome: name, categoria: role }, { merge: true });
  console.log(`✔ Conta ${role === 'adm' ? 'administrador' : 'estoquista'} pronta (${user.uid})`);
  return user.uid;
}

const uids = [];
for (const account of ACCOUNTS) {
  uids.push(await upsertAccount(account));
}

const products = db.collection('products');
if (!(await products.limit(1).get()).empty) {
  console.log('ℹ Catálogo já possui produtos — seed de dados ignorado.');
  process.exit(0);
}

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const now = Date.now();

// [nome, saldo final, dias desde o cadastro]
const CATALOG = [
  ['Café torrado 500g', 48, 30],
  ['Açúcar refinado 1kg', 120, 30],
  ['Arroz tipo 1 5kg', 35, 28],
  ['Feijão carioca 1kg', 64, 28],
  ['Óleo de soja 900ml', 0, 21],
  ['Leite integral 1L', 210, 14],
  ['Macarrão espaguete 500g', 87, 10],
  ['Farinha de trigo 1kg', 15, 7],
  ['Molho de tomate 340g', 156, 3],
];

// [índice do produto, tipo, quantidade, horas atrás, conta (0 admin, 1 estoquista), motivo]
const MOVEMENTS = [
  [0, 'Saída', 12, 2, 1, 'Venda balcão'],
  [5, 'Entrada', 60, 5, 1, null],
  [4, 'Saída', 24, 9, 1, 'Pedido atacado #1042'],
  [7, 'Saída', 25, 26, 0, 'Transferência para filial'],
  [8, 'Entrada', 60, 30, 0, null],
  [1, 'Entrada', 40, 50, 1, null],
  [2, 'Saída', 15, 74, 1, 'Venda online'],
];

const batch = db.batch();
const productRefs = CATALOG.map(([name, quantity, daysAgo]) => {
  const ref = products.doc();
  batch.set(ref, { nome: name, qtd: quantity, dataC: now - daysAgo * DAY });
  return ref;
});

for (const [index, type, moved, hoursAgo, account, reason] of MOVEMENTS) {
  const [name, finalQuantity] = CATALOG[index];
  const previous = type === 'Entrada' ? finalQuantity - moved : finalQuantity + moved;
  const ref = db.collection('history').doc();
  batch.set(ref, {
    id: ref.id,
    dataT: now - hoursAgo * HOUR,
    tipoT: type,
    uid: uids[account],
    ...(reason ? { desc: reason } : {}),
    itemT: {
      id: productRefs[index].id,
      nome: name,
      qtdpassado: previous,
      qtdMovimentado: moved,
      qtd: finalQuantity,
    },
  });
}

await batch.commit();
console.log(`✔ ${CATALOG.length} produtos e ${MOVEMENTS.length} movimentações cadastrados.`);
