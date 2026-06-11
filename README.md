# CopaTracker 2026

<div align="center">

**Acompanhe sua jornada na Copa do Mundo 2026 - jogos, classificações e times em um só lugar.**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white)](#stack)
[![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)](#stack)
[![GitHub issues](https://img.shields.io/github/issues/AllonsoHenzo/CopaTracker)](https://github.com/AllonsoHenzo/CopaTracker/issues)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Live App](https://img.shields.io/badge/demo-ao%20vivo-brightgreen?logo=cloudflare)](https://copa.deividalmeida.com.br)

<p align="right">🌐 <strong>Português (BR)</strong></p>

</div>

---

## Sobre o projeto

O **CopaTracker** é uma aplicação web completa para acompanhar a Copa do Mundo de 2026, com dados em tempo real vindos da API do [football-data.org](https://www.football-data.org/).

- ⚽ Lista completa de **todos os jogos** com placar, horário e fase
- ✅ **Marque os jogos que você assistiu** e construa seu histórico pessoal
- 📊 **Classificação por grupo** calculada em tempo real a partir dos resultados
- 🏟️ **Detalhe do jogo** - confronto, placar, sede, fase e outros jogos do grupo
- 👥 **Perfil por time** com informações e histórico
- 🃏 **Cartão compartilhável** - gera imagem do seu progresso para postar nas redes
- 🔐 **Autenticação completa** - registro e login com JWT em cookies HttpOnly
- 🌙 **Tema claro/escuro**, suporte a 3 idiomas (PT · EN · ES) e time favorito
- 📱 **PWA** - instale no celular como app nativo

---

## Preview

<div align="center">

> 🔴 App ao vivo → **[copa.deividalmeida.com.br](https://copa.deividalmeida.com.br)**

</div>

---

## Versões

O projeto está disponível em duas versões dentro deste repositório:

| Versão | Pasta | Descrição |
|--------|-------|-----------|
| **DB** | `DB_version/` | Versão completa com MySQL, autenticação JWT e perfil por usuário |
| **LocalStorage** | `LocalStorage_version/` | Versão sem backend - sem banco de dados e sem login, tudo salvo no navegador |

A versão **LocalStorage** é mais fácil de rodar - só precisa do token da API e não exige banco de dados nem servidor de autenticação. Ideal para quem quer testar rápido ou hospedar de forma simples.

---

## Instalação

### Versão com banco de dados (DB_version)

#### Pré-requisitos

- Node.js 18+
- MySQL 8+
- Token gratuito em [football-data.org](https://www.football-data.org/) (plano free cobre Copa 2026)

#### Passos

1. Clone o repositório:

```bash
git clone https://github.com/AllonsoHenzo/CopaTracker.git
cd CopaTracker/DB_version
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:

```bash
cp .env.example .env.local
```

Edite o `.env.local` com seus valores:

```env
FD_TOKEN=seu_token_football_data_org

MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=copaapp
MYSQL_PASSWORD=sua_senha
MYSQL_DATABASE=copatracker

JWT_SECRET=gere_com_openssl_rand_hex_32
```

> Para gerar um `JWT_SECRET` seguro: `openssl rand -hex 32`

4. Crie o banco de dados:

```sql
CREATE DATABASE copatracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'copaapp'@'localhost' IDENTIFIED BY 'sua_senha';
GRANT ALL PRIVILEGES ON copatracker.* TO 'copaapp'@'localhost';
FLUSH PRIVILEGES;
```

5. Rode o projeto:

```bash
# Desenvolvimento
npm run dev

# Produção
npm run build && npm start
```

> Acesse em [http://localhost:3000](http://localhost:3000)

---

### Versão sem banco de dados (LocalStorage_version)

#### Pré-requisitos

- Node.js 18+
- Token gratuito em [football-data.org](https://www.football-data.org/)

#### Passos

1. Clone o repositório:

```bash
git clone https://github.com/AllonsoHenzo/CopaTracker.git
cd CopaTracker/LocalStorage_version
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:

```bash
cp .env.example .env.local
```

Edite o `.env.local`:

```env
FD_TOKEN=seu_token_football_data_org
```

4. Rode o projeto:

```bash
# Desenvolvimento
npm run dev

# Produção
npm run build && npm start
```

> Acesse em [http://localhost:3000](http://localhost:3000)

---

## Estrutura

```
├── DB_version/               # Versão com MySQL e autenticação
│   ├── app/
│   │   ├── api/              # API Routes (auth, copa, user)
│   │   ├── game/[id]/        # Detalhe do jogo
│   │   ├── teams/[code]/     # Perfil do time
│   │   ├── games/            # Lista de jogos
│   │   ├── scorers/          # Artilheiros
│   │   ├── profile/          # Perfil do usuário
│   │   └── layout.jsx
│   ├── components/
│   │   ├── layout/           # Topbar, Sidebar, BottomNav, Ticker
│   │   └── views/            # Dashboard, Games, GameDetail, Teams, ...
│   ├── lib/
│   │   ├── api.js            # Fetch + cache de dados da Copa
│   │   ├── auth.js           # JWT sign/verify + cookie helpers
│   │   ├── db.js             # Pool MySQL
│   │   ├── store.jsx         # Estado global (React Context)
│   │   ├── data.js           # Times, grupos, fases, i18n data
│   │   └── i18n.js           # Hook de tradução (PT/EN/ES)
│   ├── middleware.js         # Proteção de rotas de API via JWT
│   └── .env.example
│
└── LocalStorage_version/     # Versão sem backend
    ├── app/
    ├── components/
    ├── lib/
    │   ├── api.js            # Fetch + cache de dados da Copa
    │   ├── store.jsx         # Estado global salvo no localStorage
    │   ├── data.js
    │   └── i18n.js
    └── .env.example
```

---

## Stack

- **Framework:** Next.js 15 (App Router) + React 19
- **Estilização:** CSS puro - variáveis, Grid, Flexbox - sem frameworks de UI
- **Auth:** JWT assinado com HMAC-SHA256 + cookies HttpOnly via Web Crypto API (somente DB_version)
- **Banco de dados:** MySQL 8 com `mysql2` (somente DB_version)
- **API de dados:** [football-data.org](https://www.football-data.org/)
- **Imagens compartilháveis:** `html-to-image`
- **Deploy:** PM2 + Cloudflare Tunnel

---

## Contribuição

Contribuições são bem-vindas!

- 🐛 Abra uma **issue** para reportar bugs ou sugerir melhorias
- 🔧 Envie um **PR** com sua contribuição

### Guia rápido

1. Fork -> branch -> commit -> PR
2. Descreva claramente a mudança e como testar
3. (Opcional) Use Conventional Commits: `feat:`, `fix:`, `docs:`, ...

---

## Licença

Este projeto está sob a licença **MIT** - veja [LICENSE](./LICENSE).

---

<div align="center">

Se curtiu o projeto, deixa uma ⭐ no repositório!<br/>
Dúvidas ou ideias? Abre uma [issue](https://github.com/AllonsoHenzo/CopaTracker/issues).

</div>
