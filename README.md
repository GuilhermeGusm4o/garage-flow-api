# Garage Flow API

Backend de um sistema de gerenciamento para oficina mecânica, desenvolvido como um monólito utilizando **NestJS, TypeScript, PostgreSQL, Prisma e Docker**.

## Tecnologias

- **NestJS + TypeScript**
- **PostgreSQL**
- **Prisma ORM**
- **Docker / Docker Compose**
- **Swagger**
- **class-validator**
- **Jest + Supertest**
- **ESLint + Prettier**
- **Husky**
- **SonarQube** (análise estática de código, apenas em desenvolvimento)

## Arquitetura

O projeto utiliza **Domain-Driven Design (DDD)** combinado com **arquitetura em camadas**, dentro de um monólito. Todos os contextos de negócio ficam agrupados em `src/modules/`.

```text
├── src/
│   │
│   ├── modules/
│   │   │
│   │   ├── auth/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   ├── value-objects/
│   │   │   │   └── repositories/
│   │   │   ├── application/
│   │   │   │   └── use-cases/
│   │   │   ├── infrastructure/
│   │   │   │   ├── persistence/
│   │   │   │   └── security/
│   │   │   └── presentation/
│   │   │       ├── auth.controller.ts
│   │   │       └── dto/
│   │   │
│   │   ├── client/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   ├── value-objects/
│   │   │   │   └── repositories/
│   │   │   ├── application/
│   │   │   │   └── use-cases/
│   │   │   ├── infrastructure/
│   │   │   └── presentation/
│   │   │       ├── client.controller.ts
│   │   │       └── dtos/
│   │   │
│   │   ├── vehicle/
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   ├── infrastructure/
│   │   │   └── presentation/
│   │   │
│   │   ├── service/
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   ├── infrastructure/
│   │   │   └── presentation/
│   │   │
│   │   ├── inventory/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   ├── value-objects/
│   │   │   │   └── repositories/
│   │   │   ├── application/
│   │   │   │   └── use-cases/
│   │   │   ├── infrastructure/
│   │   │   └── presentation/
│   │   │       ├── inventory.controller.ts
│   │   │       └── dtos/
│   │   │
│   │   └── service-orders/
│   │       ├── domain/
│   │       │   ├── entities/
│   │       │   ├── value-objects/
│   │       │   └── repositories/
│   │       ├── application/
│   │       │   └── use-cases/
│   │       ├── infrastructure/
│   │       │   └── security/
│   │       └── presentation/
│   │           ├── service-orders.controller.ts
│   │           └── dtos/
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
│   │   ├── decorators/
│   │   └── errors/
│   │
│   ├── app.module.ts
│   └── main.ts
```

### Bounded Contexts

- **Auth:** autenticação, usuários, credenciais e papéis de acesso (JWT).
- **Client:** cadastro e gerenciamento dos clientes da oficina.
- **Vehicle:** veículos associados aos clientes.
- **Service:** serviços padronizados da oficina, como troca de óleo, alinhamento etc., com preço/tabela de mão de obra.
- **Inventory:** peças e insumos utilizados nas ordens de serviço, com controle de estoque físico e lógico. O estoque lógico desconta do físico tudo que já está comprometido com ordens de serviço em aberto, evitando que a mesma peça seja reservada duas vezes. Peças com estoque lógico abaixo do mínimo configurado são sinalizadas automaticamente.
- **Service Orders:** ciclo de vida da ordem de serviço, incluindo recebimento, diagnóstico, adição de serviços/peças, orçamento, aprovação, execução, finalização e entrega. Ao finalizar uma OS, as peças utilizadas são baixadas definitivamente do estoque. Cada OS gera um link público de rastreamento, que permite ao cliente consultar o status sem autenticação.

Além dos contextos de negócio, `common` contém elementos compartilhados pela aplicação (guards, filtros de exceção, pipes, decorators e erros de domínio) e `infra` contém recursos de infraestrutura que não pertencem a um contexto específico (conexão com o banco, health check).

## Executando o projeto

### Pré-requisitos

- Docker
- Node.js 20+
- npm

### 1. Configuração

Crie o arquivo `.env` a partir do `.env.example`:

```env
NODE_ENV=production
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/garage-flow?schema=public

# Autenticação (JWT)
JWT_SECRET=troque-por-um-segredo-forte
JWT_EXPIRES_IN=1d

# Link público de rastreamento da OS
TRACKING_TOKEN_SECRET=troque-por-outro-segredo-forte
```


O projeto tem dois arquivos de Docker Compose, um por ambiente:

- `docker-compose.production.yaml`: builda o estágio `production` (imagem enxuta, sem devDependencies), repassa as variáveis de autenticação e rastreamento definidas no `.env` e roda a aplicação já compilada (`node dist/src/main`).
- `docker-compose.development.yaml`: builda o estágio `development` do `Dockerfile` (com devDependencies), monta o código como volume e roda com **hot reload** (`start:debug`).

### 2. Subir a aplicação

Para avaliação (ambiente de produção), na raiz do projeto:

```bash
docker compose -f docker-compose.production.yaml up --build
```

Esse compose sobe, nessa ordem: PostgreSQL, um container `migrate` (que roda `prisma migrate deploy`), um container `seed` (que cria os usuários e dados de demonstração) e só então a API.

Os containers `migrate` e `seed` usam o estágio `build`, que ainda possui a CLI do Prisma, e encerram após concluir. A API só inicia quando ambos terminam com sucesso.

Os usuários do seed usam a senha padrão `Password123!`, adequada para o ambiente de avaliação local.

### Ambiente de desenvolvimento

```bash
docker compose -f docker-compose.development.yaml up --build
```

O Docker Compose inicia:

- PostgreSQL (dados da aplicação);
- PostgreSQL do SonarQube (`sonar-db`) e o próprio SonarQube (análise de código);
- API NestJS;
- aplicação das migrations e do seed do Prisma.

A aplicação aguarda o PostgreSQL estar saudável antes de iniciar. O código é montado como volume, permitindo **hot reload** durante o desenvolvimento.

### 3. Acessos

- **API:** `http://localhost:3000`
- **Swagger:** `http://localhost:3000/docs`
- **SonarQube:** `http://localhost:9000` (usuário/senha padrão `admin`/`admin` no primeiro acesso) - disponível apenas ao subir com `docker-compose.development.yaml`.

### Prisma Studio

Com o PostgreSQL em execução e estando em ambiente de DESENVOLVIMENTO, o Prisma Studio pode ser aberto localmente:

```bash
npx prisma studio
```

Acesse:

`http://localhost:5555`

O Prisma Studio é utilizado para visualizar e manipular os dados do banco durante o desenvolvimento.

## Como usar e testar a API

### 1. Login e usuários disponíveis

O seed já popula o banco com clientes, veículos, serviços, peças e ordens de serviço em todos os estágios do fluxo - não é necessário cadastrar nada manualmente para testar a API.

Para autenticar, use `POST /auth/login` com um dos usuários abaixo (senha padrão `Password123!` para todos):

| E-mail                 | Role            |
| ---------------------- | --------------- |
| `admin@example.com`    | ADMIN           |
| `advisor@example.com`  | SERVICE_ADVISOR |
| `mechanic@example.com` | MECHANIC        |
| `stock@example.com`    | STOCK_CLERK     |

Exemplo de login:

```bash
POST /auth/login
{ "email": "mechanic@example.com", "password": "Password123!" }
```

A resposta traz um `access_token` (JWT), que deve ser enviado no header `Authorization: Bearer <token>` nas chamadas seguintes (ou colado no botão **Authorize** do Swagger).

#### O que cada role pode fazer

| Role                | Pode fazer                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------------- |
| **ADMIN**           | Acesso completo: CRUD de clientes, veículos e peças; todas as ações sobre ordens de serviço             |
| **SERVICE_ADVISOR** | Cadastrar/editar clientes e veículos; abrir OS, gerar e aprovar orçamento, cancelar e confirmar entrega |
| **MECHANIC**        | Iniciar diagnóstico, adicionar serviços/peças à OS, iniciar e finalizar a execução do serviço           |
| **STOCK_CLERK**     | Cadastrar, reabastecer e dar baixa manual em peças; consultar peças com estoque abaixo do mínimo        |

> Consultas de leitura (`GET`) na maioria dos recursos estão disponíveis para qualquer usuário autenticado, independente da role. As exceções (ex.: `GET /inventory/low-stock`) exigem a role MECHANIC. `GET /service-orders/track/:token` e `POST /auth/login` são as únicas rotas públicas, sem necessidade de autenticação.

### 2. Clientes

- `POST /clients` (`ADMIN`, `SERVICE_ADVISOR`): cadastra um cliente com CPF/CNPJ, nome e dados de contato.
- `GET /clients` e `GET /clients/:id`: listam e consultam clientes.
- `PATCH /clients/:id` (`ADMIN`, `SERVICE_ADVISOR`): atualiza os dados de contato; o CPF/CNPJ não é alterado.
- `DELETE /clients/:id` (`ADMIN`): remove o cliente por soft delete.

### 3. Veículos

- `POST /vehicles` (`ADMIN`, `SERVICE_ADVISOR`): cadastra marca, modelo, placa, ano e associa o veículo a um cliente pelo `clientId`.
- `GET /vehicles` e `GET /vehicles/:id`: listam e consultam veículos.
- `PATCH /vehicles/:id` (`ADMIN`, `SERVICE_ADVISOR`): atualiza marca, modelo ou ano.
- `DELETE /vehicles/:id` (`ADMIN`): remove o veículo por soft delete.

### 4. Catálogo de serviços

- `POST /services` (`ADMIN`): cadastra um serviço e seu preço.
- `GET /services` e `GET /services/:id`: listam e consultam o catálogo usado no diagnóstico da OS.
- `PATCH /services/:id` e `DELETE /services/:id` (`ADMIN`): atualizam ou removem um serviço.

### 5. Estoque

- `POST /inventory` (`ADMIN`, `STOCK_CLERK`): cadastra uma peça com nome, unidade (`ML`, `G`, `KG` ou `UNIT`), preço, quantidade física e estoque mínimo.
- `GET /inventory`: lista as peças e suas quantidades físicas.
- `PATCH /inventory/:id` (`ADMIN`, `STOCK_CLERK`): atualiza nome, preço e estoque mínimo.
- `PATCH /inventory/:id/restock` (`ADMIN`, `STOCK_CLERK`): adiciona quantidade ao estoque físico.
- `PATCH /inventory/:id/consume` (`ADMIN`, `STOCK_CLERK`): realiza uma baixa manual. A baixa das peças usadas em uma OS ocorre automaticamente ao finalizar o serviço.
- `DELETE /inventory/:id` (`ADMIN`): remove a peça por soft delete.

`GET /inventory/low-stock` (`ADMIN`, `STOCK_CLERK`) lista as peças cujo estoque lógico está abaixo do mínimo configurado. O cálculo considera:

```text
estoque lógico = quantidade física - quantidade reservada em OS abertas
```

São consideradas abertas as OS entre `RECEIVED` e `IN_EXECUTION`. Ordens `FINISHED`, `DELIVERED` ou `CANCELED` não permanecem como reserva. A resposta informa `physicalQuantity`, `reservedQuantity`, `availableQuantity` e `minQuantity`. Por exemplo, uma peça com 10 unidades físicas, 7 reservadas e mínimo 5 aparece no resultado porque possui apenas 3 unidades disponíveis.

### 6. Ciclo de vida da OS

Esta seção descreve, passo a passo, como percorrer o ciclo de vida completo de uma Ordem de Serviço via API. Cada passo indica qual role pode executá-lo - autentique-se com o usuário correspondente antes de cada chamada.

#### 6.1 Abertura da OS (`SERVICE_ADVISOR` ou `ADMIN`)

```bash
POST /service-orders
{ "clientCpfCnpj": "529.982.247-25", "licensePlate": "ABC1D23", "description": "Ruído no motor" }
```

A OS nasce com status `RECEIVED`. A resposta inclui um `trackingLink` - um link público que o cliente pode usar para acompanhar o status sem autenticação (`GET /service-orders/track/:token`) e o `totalAmount` começa zerado.

#### 6.2 Diagnóstico (`MECHANIC`)

```bash
PATCH /service-orders/:id/start-diagnosis
```

Transiciona a OS para `IN_DIAGNOSIS`. Não é informado o mecânico no corpo da requisição, ele é identificado automaticamente pelo token de autenticação de quem faz a chamada.

#### 6.3 Adição de serviços e peças (`MECHANIC`)

```bash
PATCH /service-orders/:id/add-services-and-parts
{
  "services": [{ "serviceId": "<id-do-servico>" }],
  "parts": [{ "inventoryId": "<id-da-peca>", "quantity": 2 }]
}
```

Só é permitido enquanto a OS está em `IN_DIAGNOSIS`. Verifica a disponibilidade de estoque lógico antes de aceitar a peça. A resposta pode incluir `stockAlerts` quando a peça adicionada ficar com estoque lógico abaixo do mínimo configurado. Ao concluir, a OS avança para `FINISHED_DIAGNOSIS`.

#### 6.4 Geração do orçamento (`SERVICE_ADVISOR` ou `ADMIN`)

```bash
PATCH /service-orders/:id/budget
```

Gera o orçamento com base nos serviços e peças adicionados (cliente, veículo, itens e valor total). Só disponível quando a OS possui ao menos um serviço ou peça. Ao concluir, a OS avança para `AWAITING_APPROVAL`.

#### 6.5 Aprovação ou cancelamento (`SERVICE_ADVISOR` ou `ADMIN`)

```bash
PATCH /service-orders/:id/approve-budget
```

Registra a aprovação do cliente e transiciona a OS para `AWAITING_EXECUTION`.

> Alternativamente, `PATCH /service-orders/:id/cancel-service` cancela a OS neste ponto (ex.: cliente não aprova o orçamento), transicionando-a para `CANCELED`.

#### 6.6 Execução do serviço (`MECHANIC`)

```bash
PATCH /service-orders/:id/start-service
```

Transiciona a OS para `IN_EXECUTION`.
Marca no banco de dados o timestamp do início da execução do serviço.

#### 6.7 Finalização (`MECHANIC`)

```bash
PATCH /service-orders/:id/finish-service
```

Transiciona a OS para `FINISHED` e dispara a baixa definitiva das peças utilizadas no estoque.
Marca no banco de dados o timestampo do fim da execução do serviço.

#### 6.8 Entrega (`SERVICE_ADVISOR` ou `ADMIN`)

```bash
PATCH /service-orders/:id/deliver
```

Transiciona a OS para `DELIVERED`, encerrando o ciclo.

### 7. Consultas e métricas da OS

```bash
GET /service-orders                                 # lista todas as OS
GET /service-orders/:id                              # detalhes de uma OS
GET /service-orders/:id/tracking-link                # reobtém o link público de rastreamento
GET /service-orders/metrics/average-execution-time   # tempo médio de execução das OS finalizadas
DELETE /service-orders/:id                           # soft delete da OS
```



- **`GET /track/:token`**: consulta pública de status via o token do link de rastreamento, sem necessidade de autenticação.
- **`GET /metrics/average-execution-time`** (qualquer usuário autenticado): calcula o tempo médio de execução das ordens de serviço com status `FINISHED` ou `DELIVERED`. Aceita filtro opcional por período via query params `from` e `to` (formato `AAAA-MM-DD`); sem os filtros, considera todas as OS concluídas. Retorna:

  ```json
  {
    "averageExecutionTimeMinutes": 127.3,
    "averageExecutionTimeFormatted": "2h 7min",
    "completedServiceOrders": 35
  }
  ```

  Exemplo com filtro por período:

  ```bash
  GET /service-orders/metrics/average-execution-time?from=2026-08-01&to=2026-08-31
  ```

## Validações

A aplicação utiliza diferentes níveis de validação:

- **class-validator:** validação dos dados recebidos pelos DTOs;
- **regras de domínio:** validações específicas do negócio, lançadas como `DomainError` e convertidas para respostas HTTP padronizadas pelo filtro de exceção global;
- **Prisma/PostgreSQL:** integridade, relacionamentos, campos únicos e restrições do banco.

Antes de cada `git push`, o Husky executa automaticamente:

- Prettier;
- ESLint;
- testes Jest.

O push é interrompido caso alguma dessas verificações falhe.

## Testes

O projeto utiliza **Jest** para testes unitários e **Jest + Supertest** para testes de integração. Todos os testes ficam na pasta `test/`, separados por tipo e organizados de acordo com os contextos e fluxos da aplicação.

```text
test/
├── unit/
│   ├── health/
│   ├── auth/
│   ├── client/
│   ├── vehicle/
│   ├── service/
│   ├── inventory/
│   └── service-orders/
│
└── integration/
    ├── client/
    ├── vehicle/
    ├── service/
    ├── inventory/
    └── service-orders/
```

### Testes unitários

Validam componentes de forma isolada, sem depender de outros componentes externos.

### Testes de integração

Validam a interação entre diferentes componentes da aplicação, incluindo a integração com **Prisma e PostgreSQL**. Alguns testes podem abranger mais de um contexto quando o fluxo exigir a interação entre eles (por exemplo, `service-orders` consumindo `client`, `vehicle`, `service` e `inventory`).

Os testes de integração rodam de forma sequencial (`--runInBand`), já que compartilham o mesmo banco de dados - rodar em paralelo pode causar falhas intermitentes por concorrência entre suítes.

A organização por contexto facilita a localização e manutenção dos testes, sem limitar um teste de integração a apenas um contexto.

Para rodar todos os testes (é necessário o docker rodando para os testes de integração):

```bash
npm run test
```
