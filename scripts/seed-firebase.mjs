// Prepara o backend Firebase de produção: cria/atualiza as contas de administrador e
// estoquista, grava os perfis em users/{uid} e cadastra produtos e um histórico inicial
// coerente com os saldos (se o catálogo estiver vazio, ou sempre com RESET_DATA=true).
//
// Roda com privilégios de Admin SDK (ignora as regras do Firestore), por isso fica no
// workflow `.github/workflows/seed.yml`. Variáveis:
//   FIREBASE_SERVICE_ACCOUNT                         (secret)
//   SEED_ADMIN_EMAIL/PASSWORD, SEED_STOCKIST_*       (secrets — contas privadas do dono)
//   PUBLIC_ADMIN_*, PUBLIC_STOCKIST_*                (contas públicas divulgadas no README)
//   RESET_DATA=true                                  (apaga e recria produtos/histórico)
// As contas públicas têm UID fixo: a cada execução e-mail, senha e perfil são restaurados
// e as sessões revogadas — se alguém trocar a senha via API, o próximo reset devolve o acesso.
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
  {
    uid: 'public-admin',
    email: required('PUBLIC_ADMIN_EMAIL'),
    password: required('PUBLIC_ADMIN_PASSWORD'),
    name: 'Visitante (Administrador)',
    role: 'adm',
  },
  {
    uid: 'public-stockist',
    email: required('PUBLIC_STOCKIST_EMAIL'),
    password: required('PUBLIC_STOCKIST_PASSWORD'),
    name: 'Visitante (Estoquista)',
    role: 'est',
  },
];

async function findUser({ uid, email }) {
  try {
    return uid ? await auth.getUser(uid) : await auth.getUserByEmail(email);
  } catch (error) {
    if (error?.code === 'auth/user-not-found') {
      return null;
    }
    throw error;
  }
}

async function upsertAccount(account) {
  const { uid, email, password, name, role } = account;
  const profile = { email, password, displayName: name, emailVerified: true, disabled: false };
  const existing = await findUser(account);
  const user = existing ? await auth.updateUser(existing.uid, profile) : await auth.createUser({ uid, ...profile });
  if (uid) {
    await auth.revokeRefreshTokens(user.uid);
  }
  await db.doc(`users/${user.uid}`).set({ nome: name, categoria: role });
  console.log(`✔ ${name} pronta (${user.uid})`);
  return user.uid;
}

const uids = [];
for (const account of ACCOUNTS) {
  uids.push(await upsertAccount(account));
}

const products = db.collection('products');
if (process.env.RESET_DATA === 'true') {
  await db.recursiveDelete(products);
  await db.recursiveDelete(db.collection('history'));
  console.log('✔ Produtos e histórico apagados para restaurar o estado inicial.');
} else if (!(await products.limit(1).get()).empty) {
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
