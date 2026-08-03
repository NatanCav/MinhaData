# 📅 Sistema de Agendamentos para Espaços de Lazer

> **Uma plataforma web que conecta proprietários de espaços de lazer a clientes, simplificando o processo de reserva e reduzindo faltas ou atrasos através de lembretes automáticos via WhatsApp.**

---

## 🎯 Proposta de Valor

* **Para os Donos dos Espaços (Anfitriões):** Acaba com a confusão da agenda de papel e mensagens perdidas. O dono tem um painel centralizado onde cadastra seus espaços (chácaras, salões de festas, quiosques, quadras), define preços e acompanha a ocupação. O WhatsApp automatizado poupa o tempo de ter que cobrar confirmação um por um.
* **Para os Clientes:** Traz autonomia. O cliente pode visualizar a disponibilidade dos espaços em tempo real, solicitar o agendamento de forma rápida e receber a confirmação e o lembrete da reserva na palma da mão, direto no WhatsApp.

## 🚀 Tecnologias Utilizadas (Stack)

### Front-end
* **React** ou **Vue.js** (Interface de Usuário dinâmica)
* **CSS Nativo (Flexbox)** / **Tailwind CSS** (Estilização responsiva)

### Back-end
* **Node.js** com **Express** (API de gerenciamento)
* **Prisma ORM** (Modelagem de dados e queries ágeis)
* **whatsapp-web.js** (Integração de envio automático de mensagens)

### Banco de Dados
* **PostgreSQL** (Banco relacional para garantir integridade entre usuários, espaços e agendamentos)

## 🛠️ Escopo Principal (Versão 1.0)

- [ ] **Catálogo:** Uma vitrine digital mostrando detalhes, fotos e preços dos espaços disponíveis.
- [ ] **Agendamento:** Calendário interativo para o cliente selecionar data e hora livre.
- [ ] **Painel de Gestão:** Dashboard simples para o proprietário aprovar, recusar ou visualizar reservas.
- [ ] **Mensageria Automática:** Disparo via WhatsApp confirmando a reserva e enviando lembretes 24h antes do evento.

---

## ⚙️ Como rodar o projeto localmente

### Pré-requisitos
* [Node.js](https://nodejs.org/) instalado
* Banco de Dados [PostgreSQL](https://www.postgresql.org/) rodando localmente

### Passo a passo

**1. Clone o repositório**
```bash
git clone https://github.com/seu-usuario/nome-do-repositorio.git
```

**2. Configuração do Back-end**
```bash
cd backend
npm install
```
* Crie um arquivo `.env` na raiz da pasta `backend` com a URL do seu banco de dados:
  `DATABASE_URL="postgresql://usuario:senha@localhost:5432/agendamentos"`
* Crie as tabelas no banco de dados com o Prisma:
```bash
npx prisma migrate dev --name init
```
* Rode a API:
```bash
npm run dev
```

**3. Configuração do Front-end**
Em uma nova aba do terminal:
```bash
cd frontend
npm install
npm run dev
```

---
*Projeto desenvolvido como prática colaborativa de desenvolvimento Full-Stack.*