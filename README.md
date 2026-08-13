# Garage Flow API

Backend de um sistema de gerenciamento para oficina mecânica, desenvolvido como um monólito utilizando **NestJS, TypeScript, PostgreSQL, Prisma e Docker**.

## Tecnologias

* **NestJS + TypeScript**
* **PostgreSQL**
* **Prisma ORM**
* **Docker / Docker Compose**
* **Swagger**
* **class-validator**
* **Jest**
* **ESLint + Prettier**
* **Husky**

## Arquitetura

O projeto utiliza **Domain-Driven Design (DDD)** combinado com **arquitetura em camadas**, dentro de um monólito.

```text

├── src/
│   │
│   ├── clients/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   ├── value-objects/
│   │   │   ├── events/
│   │   │   └── repositories/
│   │   │
│   │   ├── application/
│   │   │   ├── use-cases/
│   │   │   └── dtos/
│   │   │
│   │   ├── infrastructure/
│   │   │   ├── repositories/
│   │   │   └── mappers/
│   │   │
│   │   └── presentation/
│   │       ├── controllers/
│   │       └── dtos/
│   │
│   ├── vehicles/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   ├── value-objects/
│   │   │   ├── events/
│   │   │   └── repositories/
│   │   │
│   │   ├── application/
│   │   │   ├── use-cases/
│   │   │   └── dtos/
│   │   │
│   │   ├── infrastructure/
│   │   │   ├── repositories/
│   │   │   └── mappers/
│   │   │
│   │   └── presentation/
│   │       ├── controllers/
│   │       └── dtos/
│   │
│   ├── services/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   ├── value-objects/
│   │   │   ├── events/
│   │   │   └── repositories/
│   │   │
│   │   ├── application/
│   │   │   ├── use-cases/
│   │   │   └── dtos/
│   │   │
│   │   ├── infrastructure/
│   │   │   ├── repositories/
│   │   │   └── mappers/
│   │   │
│   │   └── presentation/
│   │       ├── controllers/
│   │       └── dtos/
│   │
│   ├── service-orders/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   ├── value-objects/
│   │   │   ├── events/
│   │   │   └── repositories/
│   │   │
│   │   ├── application/
│   │   │   ├── use-cases/
│   │   │   └── dtos/
│   │   │
│   │   ├── infrastructure/
│   │   │   ├── repositories/
│   │   │   └── mappers/
│   │   │
│   │   └── presentation/
│   │       ├── controllers/
│   │       └── dtos/
│   │
│   ├── inventory/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   ├── value-objects/
│   │   │   ├── events/
│   │   │   └── repositories/
│   │   │
│   │   ├── application/
│   │   │   ├── use-cases/
│   │   │   └── dtos/
│   │   │
│   │   ├── infrastructure/
│   │   │   ├── repositories/
│   │   │   └── mappers/
│   │   │
│   │   └── presentation/
│   │       ├── controllers/
│   │       └── dtos/
│   │
│   ├── auth/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   ├── value-objects/
│   │   │   ├── events/
│   │   │   └── repositories/
│   │   │
│   │   ├── application/
│   │   │   ├── use-cases/
│   │   │   └── dtos/
│   │   │
│   │   ├── infrastructure/
│   │   │   ├── repositories/
│   │   │   └── mappers/
│   │   │
│   │   └── presentation/
│   │       ├── controllers/
│   │       └── dtos/
│   │
│   ├── infra/
│   │   ├── database/
│   │   │   └── prisma/
│   │   │       ├── prisma.module.ts
│   │   │       └── prisma.service.ts
│   │   │
│   │   └── health/
│   │       ├── health.module.ts
│   │       ├── health.controller.ts
│   │       └── health.service.ts
│   │
│   ├── common/
│   │   ├── guards/
│   │   ├── filters/
│   │   ├── pipes/
│   │   └── decorators/
│   │
│   ├── app.module.ts
│   └── main.ts
```

### Bounded Contexts

* **Auth:** autenticação, usuários, credenciais e papéis de acesso.
* **Clients:** cadastro e gerenciamento dos clientes da oficina.
* **Vehicles:** veículos associados aos clientes.
* **Service Orders:** ciclo de vida da ordem de serviço, incluindo recebimento, diagnóstico, orçamento, aprovação, execução, finalização e entrega.
* **Inventory:** peças, insumos e controle de estoque utilizados nas ordens de serviço.
* **Services:** serviços padronizados da oficina, como troca de óleo, alinhamento etc., com preço/tabela de mão de obra.

Além dos contextos de negócio, `common` contém elementos compartilhados pela aplicação e `infra` contém recursos de infraestrutura que não pertencem a um contexto específico.

## Executando o projeto

### Pré-requisitos

* Docker
* Node.js 20+
* npm

### 1. Configuração

Crie o arquivo `.env` a partir do `.env.example`:

```env
NODE_ENV=producttion
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/garage-flow?schema=public
```

O `NODE_ENV` determina o modo de execução da aplicação:

* `development`: executa com `start:debug` e hot reload.
* `production`: executa com `start:prod` utilizando o build da aplicação.

### 2. Subir a aplicação

Na raiz do projeto:

```bash
docker compose up --build
```

O Docker Compose inicia:

* PostgreSQL;
* API NestJS;
* aplicação das migrations do Prisma.

A aplicação aguarda o PostgreSQL estar saudável antes de iniciar.

No modo `development`, o código da aplicação é montado como volume, permitindo **hot reload** durante o desenvolvimento.

### 3. Acessos

* **API:** `http://localhost:3000`
* **Swagger:** `http://localhost:3000/api`

### Prisma Studio

Com o PostgreSQL em execução, o Prisma Studio pode ser aberto localmente:

```bash
npx prisma studio
```

Acesse:

`http://localhost:5555`

O Prisma Studio é utilizado para visualizar e manipular os dados do banco durante o desenvolvimento.

## Validações

A aplicação utiliza diferentes níveis de validação:

* **class-validator:** validação dos dados recebidos pelos DTOs;
* **regras de domínio:** validações específicas do negócio;
* **Prisma/PostgreSQL:** integridade, relacionamentos, campos únicos e restrições do banco.

Antes de cada `git push`, o Husky executa automaticamente:

* Prettier;
* ESLint;
* testes Jest.

O push é interrompido caso alguma dessas verificações falhe.

## Testes

O projeto utiliza **Jest** para testes unitários e de integração. Todos os testes ficam na pasta `test/`, separados por tipo e organizados de acordo com os contextos e fluxos da aplicação.

```text
test/
├── unit/
│   ├── health/
│   ├── clients/
│   ├── vehicles/
│   ├── services/
│   ├── inventory/
│   └── service-orders/
│
└── integration/
    ├── clients/
    ├── vehicles/
    ├── services/
    ├── inventory/
    └── service-orders/
```

### Testes unitários

Validam componentes de forma isolada, sem depender de outros componentes externos.

### Testes de integração

Validam a interação entre diferentes componentes da aplicação, incluindo a integração com **Prisma e PostgreSQL**. Alguns testes podem abranger mais de um contexto quando o fluxo exigir a interação entre eles.

A organização por contexto facilita a localização e manutenção dos testes, sem limitar um teste de integração a apenas um contexto.
