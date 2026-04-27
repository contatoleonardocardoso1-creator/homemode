# 🏠 HomeMode — Deploy no Vercel

Siga esse passo a passo e em 15 minutos você vai ter notificação no celular.

---

## Passo 1 — Cria conta no GitHub

1. Acessa https://github.com
2. Clica em **Sign up**
3. Cria a conta (pode usar o email da escola)

---

## Passo 2 — Sobe o projeto no GitHub

1. Depois de criar a conta, clica no **+** no canto superior direito
2. Clica em **New repository**
3. Nome: `homemode`
4. Deixa como **Public**
5. Clica em **Create repository**

Agora você vai ver uma página vazia. Clica em **uploading an existing file**:

6. Arrasta TODOS os arquivos desta pasta pra lá
   - ⚠️ Arrasta as PASTAS também: `src/` e `public/`
7. Clica em **Commit changes**

---

## Passo 3 — Deploy no Vercel

1. Acessa https://vercel.com
2. Clica em **Sign up** → **Continue with GitHub**
3. Autoriza o Vercel a acessar seu GitHub
4. Clica em **Add New Project**
5. Seleciona o repositório `homemode`
6. Clica em **Deploy**

O Vercel detecta automaticamente que é um projeto Vite e faz tudo sozinho.

Em ~2 minutos ele gera um link tipo: `homemode.vercel.app`

---

## Passo 4 — Instala no celular como app

### Android (Chrome):
1. Abre o link no Chrome
2. Toca nos **3 pontinhos** no canto superior direito
3. Toca em **Adicionar à tela inicial**
4. Confirma

### iOS (Safari):
1. Abre o link no Safari
2. Toca no ícone de **compartilhar** (quadrado com setinha)
3. Toca em **Adicionar à Tela de Início**
4. Confirma

---

## Passo 5 — Ativa a notificação

1. Abre o app instalado
2. Na tela inicial, clica em **🔔 Ativar notificação diária**
3. Permite quando o navegador perguntar
4. Pronto — todo dia no horário que você definiu, vai chegar a notificação

---

## ⚠️ Observação importante

O Service Worker que agenda a notificação fica ativo enquanto o app estiver instalado. 
Em alguns celulares Android, pode ser necessário manter o Chrome rodando em background.
No iOS, notificações de PWA funcionam a partir do iOS 16.4+.

Se tiver qualquer problema, abre uma issue no repositório do GitHub.
