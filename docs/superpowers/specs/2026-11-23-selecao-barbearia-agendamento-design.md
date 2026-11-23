# Seleção de barbearia no agendamento

## Intenção

Ao clicar em **Agendar**, o cliente deve encontrar as barbearias disponíveis antes de iniciar a escolha de serviço, profissional, data e horário. O fluxo deixa de depender de um `estabelecimento` previamente informado, sem quebrar links diretos para uma barbearia específica.

## Comportamento aprovado

- `/agendar`, sem query string, lista publicamente todas as barbearias ativas.
- Cada opção exibe os dados básicos úteis para identificação e leva a `/agendar?estabelecimento=<slug>`.
- `/agendar?estabelecimento=<slug>` preserva o fluxo de agendamento existente.
- O usuário continua podendo explorar horários sem autenticação; o login permanece obrigatório somente antes da confirmação.
- Links de “Agendar novamente” continuam abrindo diretamente a barbearia do agendamento anterior.
- Estados de carregamento, lista vazia e falha da API devem ter mensagens claras.

## Contrato HTTP

Adicionar `GET /api/v1/barbearias`, público, retornando somente barbearias com `ativa = true`, ordenadas por nome. A resposta usa API Resource e contém `id`, `slug`, `nome`, `descricao`, `endereco` e `telefone`.

## Restrições

- Não instalar dependências.
- Preservar nomes de domínio em português e recursos da API no plural.
- O frontend consome somente a API configurada por `VITE_API_URL`.
- Controllers cuidam apenas do fluxo HTTP; a serialização fica em API Resource.
- Atualizar `ROTAS.md` para registrar que `/agendar` começa pela seleção da barbearia.

## Abordagens consideradas

1. **Listagem em `/agendar` e continuidade por query string — escolhida.** Reutiliza o fluxo existente e mantém links diretos compatíveis.
2. Criar uma rota separada, como `/barbearias`. Aumentaria a navegação e duplicaria a responsabilidade do ponto de entrada sem benefício atual.
3. Inserir uma barbearia padrão. Seria mais simples, mas impediria a escolha solicitada e não funcionaria bem com múltiplas unidades.


