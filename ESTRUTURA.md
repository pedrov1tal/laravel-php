# Estrutura do projeto

O projeto será dividido em duas aplicações independentes:

- **Backend:** Laravel, responsável pela API, regras de negócio, autenticação e banco de dados.
- **Frontend:** React, responsável pelas telas, navegação e consumo da API.

O Laravel e o React já estão separados nas pastas `back-end/` e `front-end/`. Cada aplicação possui suas próprias dependências e deve ser executada a partir da respectiva pasta.

## Estrutura geral

```text
laravel-php/
├── back-end/                    # Aplicação Laravel completa
│   ├── app/                     # Código da aplicação
│   ├── Http/
│   │   ├── Controllers/         # Entrada HTTP da API
│   │   │   └── Api/
│   │   │       └── V1/
│   │   │           ├── AgendamentoController.php
│   │   │           ├── BarbeiroController.php
│   │   │           ├── ClienteController.php
│   │   │           └── ServicoController.php
│   │   ├── Requests/             # Validação das requisições
│   │   │   └── Api/V1/
│   │   └── Resources/            # Formato das respostas JSON
│   │       └── Api/V1/
│   ├── Models/                  # Persistência e relações Eloquent
│   ├── Services/                # Casos de uso que cruzam várias entidades
│   ├── database/
│   │   ├── factories/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   │   ├── api.php              # Rotas consumidas pelo React
│   │   └── console.php
│   ├── tests/
│   │   ├── Feature/             # Testes da API e fluxos completos
│   │   └── Unit/                # Testes de regras isoladas
│   ├── artisan
│   ├── composer.json
│   └── package.json
├── front-end/                   # Aplicação React
│   ├── public/
│   └── src/
│       ├── app/                 # Configuração, rotas e providers
│       ├── assets/              # Imagens, fontes e estilos globais
│       ├── components/          # Componentes realmente compartilhados
│       ├── features/            # Funcionalidades organizadas por domínio
│       │   ├── agendamentos/
│       │   │   ├── api/
│       │   │   ├── components/
│       │   │   ├── pages/
│       │   │   ├── types/
│       │   │   └── index.ts
│       │   ├── barbeiros/
│       │   ├── clientes/
│       │   └── servicos/
│       ├── hooks/               # Hooks compartilhados
│       ├── lib/                 # Axios, formatadores e utilitários
│       └── types/               # Tipos compartilhados
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## Organização por feature

Cada funcionalidade deve manter perto de si tudo que pertence ao seu domínio.

### Backend

```text
app/
├── Http/
│   ├── Controllers/Api/V1/AgendamentoController.php
│   ├── Requests/Api/V1/Agendamento/
│   │   ├── StoreAgendamentoRequest.php
│   │   └── UpdateAgendamentoRequest.php
│   └── Resources/Api/V1/AgendamentoResource.php
├── Models/Agendamento.php
└── Services/AgendamentoService.php
```

O controller deve ser fino: recebe a requisição, chama a regra necessária e devolve um `Resource`. Validações ficam em `Requests`; regras que envolvem várias operações ficam em `Services`; consultas simples e relações ficam no Model.

### Frontend

```text
front-end/src/features/agendamentos/
├── api/
│   └── agendamentosApi.ts
├── components/
│   ├── AgendamentoForm.tsx
│   └── AgendamentoList.tsx
├── pages/
│   ├── AgendamentosPage.tsx
│   └── EditarAgendamentoPage.tsx
├── types/
│   └── agendamento.ts
└── index.ts
```

Componentes usados por apenas uma feature ficam dentro dela. Só mova algo para `components/`, `hooks/` ou `lib/` quando houver uso real em duas ou mais features.

## Contrato entre frontend e backend

- Prefixo das rotas: `/api/v1`.
- Formato de resposta: JSON consistente, usando Resources no Laravel.
- Erros de validação: HTTP `422`.
- Recurso não encontrado: HTTP `404`.
- Operação criada: HTTP `201`.
- Variáveis do React ficam em `front-end/.env` e começam com `VITE_`.
- A URL da API deve ser configurada por `VITE_API_URL`; nenhum endereço deve ser fixado nos componentes.

Exemplo de rotas:

```text
GET    /api/v1/agendamentos
POST   /api/v1/agendamentos
GET    /api/v1/agendamentos/{agendamento}
PUT    /api/v1/agendamentos/{agendamento}
DELETE /api/v1/agendamentos/{agendamento}
```

## Instalação do React

Para criar outro frontend React do zero, execute na raiz:

```bash
npm create vite@latest front-end -- --template react-ts
cd front-end
npm install
npm install axios react-router-dom
```

Os comandos do backend devem ser executados dentro de `back-end/`; os comandos do frontend, dentro de `front-end/`. Não mantenha um terceiro `package.json` na raiz.

## Regras de organização

1. O frontend não acessa o banco de dados; sempre usa a API.
2. O backend não deve conter componentes React.
3. Não crie uma pasta genérica `utils` para regras de domínio; prefira o diretório da feature ou um nome específico.
4. Use nomes no plural para recursos (`agendamentos`, `clientes`, `barbeiros`, `servicos`).
5. Toda nova feature deve incluir sua rota, validação, resposta, teste e documentação do contrato quando necessário.
6. Segredos ficam em arquivos `.env`, nunca no código ou no repositório.
