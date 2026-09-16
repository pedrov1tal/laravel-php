# Fluxo público de agendamento

## Objetivo

Criar uma experiência pública e responsiva de agendamento para clientes em uma plataforma capaz de atender múltiplas barbearias. A página deve preservar a identidade editorial da Home atual sem acoplar o produto à Norte Barbearia ou a qualquer estabelecimento específico.

Esta entrega cobre somente o frontend com dados simulados. A persistência será implementada em uma etapa futura por uma API em Node.js, Express e SQLite.

## Escopo

A entrega inclui:

- rota pública `/agendar`;
- resolução opcional do estabelecimento por `?estabelecimento=<slug>`;
- fluxo progressivo para serviço, profissional, data e horário, conta do cliente e revisão;
- confirmação simulada;
- retorno a etapas anteriores sem perda indevida de estado;
- estados de carregamento, erro e listas vazias;
- layout responsivo para desktop, tablet e celular;
- mocks e contratos TypeScript preparados para troca por uma API.

A entrega não inclui:

- endpoints ou mudanças no backend Laravel existente;
- implementação da futura API Node.js;
- mudanças em migrations ou banco de dados;
- autenticação real conectada à API;
- busca ou seleção de estabelecimentos;
- área de gestão;
- listagem de agendamentos existentes;
- notificações, pagamento ou integração com calendário externo.

## Decisões e conflitos documentais

### Rota

A Home já direciona seus CTAs para `/agendar`, enquanto `ROTAS.md` reserva `/agendamentos` para uma listagem. O fluxo público será criado em `/agendar`, e `ROTAS.md` será atualizado para registrar essa rota sem alterar a finalidade futura de `/agendamentos`.

### Backend futuro

`AGENTS.md` e `ESTRUTURA.md` descrevem Laravel como backend atual. A decisão de usar Node.js, Express e SQLite pertence à próxima etapa. Esta feature não modifica a documentação ou o código do backend; a migração de arquitetura deverá ser documentada quando a API futura começar.

### Estabelecimento selecionado

Ainda não existe uma tela de descoberta ou seleção de barbearia. A página aceitará um slug opcional na query string. A camada de mocks resolverá o slug informado e usará um estabelecimento demonstrativo quando ele não existir na URL. Um slug explicitamente informado, mas desconhecido, produzirá estado de erro.

### Regras não documentadas

A opção “Qualquer profissional” não será oferecida porque não há regra de atribuição automática documentada. Os mocks declararão explicitamente quais serviços cada profissional realiza.

## Navegação

Será instalada somente a dependência `react-router-dom`.

- `/`: Home existente.
- `/agendar`: fluxo público de agendamento.
- `/agendar?estabelecimento=<slug>`: o mesmo fluxo com estabelecimento resolvido pelo slug.
- `/login`: entrada do cliente, com retorno opcional ao agendamento.
- `/cadastro`: criação do perfil simulado do cliente.

Um novo `AppRouter.tsx` concentrará as rotas. `App.tsx` continuará sendo a Home para evitar uma refatoração ampla sem relação com a feature.

## Fluxo da experiência

O domínio possui sete momentos funcionais, organizados em cinco etapas visuais para reduzir esforço cognitivo:

1. Serviço.
2. Profissional.
3. Data e horário.
4. Sua conta.
5. Revisar.

Depois da revisão, a página entra no estado de confirmação.

### Serviço

Cada cartão apresenta nome, descrição breve, duração e preço. A seleção fica visualmente explícita e habilita a continuação. Uma lista vazia explica que o estabelecimento ainda não possui serviços disponíveis.

### Profissional

A lista inclui somente profissionais que atendem ao serviço selecionado. Cada opção mostra avatar ou foto, nome, especialidade e uma indicação curta de disponibilidade. Sem profissionais compatíveis, a página oferece retorno à etapa de serviço.

### Data e horário

A data será escolhida por navegação horizontal entre dias, evitando comprimir um calendário mensal no celular. Os estados são atual, disponível, selecionado e indisponível.

Após selecionar uma data, uma grade mostra os horários válidos para estabelecimento, serviço e profissional. Horários indisponíveis permanecem visíveis e desabilitados. Uma grade vazia informa que não há horários naquele dia e mantém a troca de data acessível.

### Conta do cliente

O agendamento não coleta dados pessoais em um segundo formulário. A etapa usa nome, telefone e e-mail do perfil autenticado e apresenta esses dados em modo leitura.

Sem sessão, o rascunho é preservado em `sessionStorage` e o cliente é encaminhado a `/login` com uma URL interna de retorno. Como a API de autenticação ainda não existe, login e cadastro usam uma sessão simulada no frontend; essa camada deverá ser substituída pelo contrato real da API sem alterar as etapas do agendamento.

### Revisão

O resumo mostra estabelecimento, serviço, profissional, data, horário, duração, valor e conta do cliente. Cada grupo oferece ação de edição que retorna à etapa apropriada sem apagar escolhas ainda válidas.

### Confirmação

A confirmação é simulada no frontend e mostra estabelecimento, serviço, profissional, data e horário. Não será exibido identificador de reserva falso nem serão adicionadas ações que dependam de backend.

## Estado e dependências entre escolhas

`AgendarPage` será responsável pela etapa atual e pelo estado agregado do fluxo. Os componentes de etapa receberão dados e callbacks por propriedades.

As invalidações obedecem às dependências:

- trocar serviço limpa profissional, data e horário;
- trocar profissional limpa data e horário;
- trocar data limpa horário;
- consultar a conta do cliente não altera escolhas anteriores;
- retornar sem alterar uma seleção preserva todo o estado.

A revisão só será acessível quando todas as seleções obrigatórias e os campos válidos estiverem preenchidos.

## Contratos de dados

Os tipos da feature representarão:

- `Estabelecimento`;
- `ServicoAgendamento`;
- `Profissional`;
- `DataDisponivel`;
- `HorarioDisponivel`;
- `DadosCliente`;
- `RascunhoAgendamento`;
- estados de carregamento e erro da fonte de dados.

Os componentes não importarão os mocks diretamente. `AgendarPage` consumirá uma função assíncrona da camada de dados com uma assinatura compatível com a futura API. A substituição por `fetch` deverá preservar os contratos consumidos pela interface.

## Organização de arquivos

```text
front-end/src/
├── app/
│   └── AppRouter.tsx
├── features/
│   └── agendamentos/
│       ├── components/
│       │   ├── AgendamentoHeader.tsx
│       │   ├── IndicadorProgresso.tsx
│       │   ├── SelecaoServico.tsx
│       │   ├── SelecaoProfissional.tsx
│       │   ├── SelecaoDataHorario.tsx
│       │   ├── DadosUsuarioAutenticado.tsx
│       │   ├── RevisaoAgendamento.tsx
│       │   ├── ConfirmacaoAgendamento.tsx
│       │   └── EstadoFeedback.tsx
│       ├── data/
│       │   └── agendamentosMock.ts
│       ├── pages/
│       │   └── AgendarPage.tsx
│       ├── types/
│       │   └── agendamento.ts
│       ├── agendamento.css
│       └── index.ts
├── App.tsx
└── main.tsx
```

### Responsabilidades

- `AppRouter.tsx`: mapeia URLs para Home e agendamento.
- `AgendarPage.tsx`: carrega o estabelecimento, mantém estado e coordena as etapas.
- componentes de seleção: apresentam opções e emitem escolhas sem conhecer a origem dos dados.
- `DadosUsuarioAutenticado.tsx`: apresenta os dados da sessão em modo leitura.
- `RevisaoAgendamento.tsx`: apresenta resumo e ações de edição.
- `ConfirmacaoAgendamento.tsx`: apresenta o estado final simulado.
- `EstadoFeedback.tsx`: padroniza carregamento, erro e vazio.
- `agendamentosMock.ts`: contém dados simulados e funções assíncronas substituíveis pela API.
- `agendamento.ts`: define contratos da feature.
- `agendamento.css`: contém somente estilos da feature e reutiliza os tokens visuais existentes.

## Direção visual

A página reutilizará:

- fundo off-white;
- verde escuro como cor principal;
- terracota para destaque e seleção;
- Playfair Display em títulos e destaques editoriais;
- Manrope na interface;
- DM Mono em numeração e pequenos rótulos;
- bordas finas, pouco ou nenhum relevo e bastante espaço em branco;
- botões e links coerentes com a Home.

O indicador de progresso será uma sequência numerada discreta no desktop e um resumo “Etapa X de 5” no celular. A página não usará aparência de dashboard, stepper genérico, emojis ou efeitos visuais alheios à Home.

## Responsividade e acessibilidade

- O layout não terá overflow horizontal em 320 px ou mais.
- Controles interativos terão áreas de toque adequadas.
- Datas usarão rolagem horizontal controlada sem comprimir seu conteúdo.
- Horários reorganizarão suas colunas conforme o espaço disponível.
- A ordem visual acompanhará a ordem de leitura.
- Seleções usarão controles semânticos e estados acessíveis.
- Dados da conta serão apresentados com estrutura semântica e rótulos persistentes.
- Mudanças relevantes de carregamento, erro e confirmação serão anunciadas.
- Foco visível e `prefers-reduced-motion` serão respeitados.

## Estados de interface

A experiência contemplará:

- carregamento inicial;
- falha ao resolver o estabelecimento;
- estabelecimento inexistente;
- lista de serviços vazia;
- nenhum profissional compatível;
- nenhuma data disponível;
- nenhum horário disponível para uma data;
- seleções atual e indisponível;
- ausência de sessão com encaminhamento ao login;
- revisão;
- confirmação simulada.

## Verificação planejada

O projeto ainda não possui framework de testes automatizados no frontend. Após autorização explícita, a verificação incluirá:

- `npm run lint`;
- `npm run build`;
- fluxo completo no navegador;
- retorno e edição de cada etapa com preservação de estado;
- estados vazios e de erro expostos pelos mocks;
- menu e navegação entre `/` e `/agendar`;
- desktop em 1280 px;
- tablet em 768 px;
- celular em 390 px e verificação de 320 px;
- inspeção do console do navegador.

## Critérios de conclusão

A feature estará pronta quando o cliente puder concluir o fluxo simulado, voltar e editar escolhas, receber feedback para estados vazios ou inválidos e visualizar a confirmação em todos os tamanhos definidos, sem acoplamento estrutural a uma barbearia específica e sem mudanças no backend.
