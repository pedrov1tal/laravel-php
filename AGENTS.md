# AGENTS.md

## Visão geral

Este repositório contém um sistema de agendamentos para barbearia, dividido em duas aplicações independentes:

- `back-end/`: API em PHP 8.3+ com Laravel 13 e Eloquent.
- `front-end/`: interface em React 19, TypeScript e Vite 8.

Os domínios atuais são `Agendamento`, `Barbeiro`, `Cliente` e `Servico`. Preserve os nomes de domínio em português no código e os recursos da API no plural: `agendamentos`, `barbeiros`, `clientes` e `servicos`.

## Fontes de verdade

- Consulte `ESTRUTURA.md` antes de criar pastas ou mover responsabilidades.
- Consulte e atualize `ROTAS.md` ao alterar as rotas de navegação do frontend.
- O contrato HTTP implementado em `back-end/routes/api.php` e nos futuros Controllers, Requests e Resources prevalece sobre exemplos da documentação.
- Não descreva como implementada uma estrutura que existe apenas como proposta em `ESTRUTURA.md`.

## Backend

- Execute comandos PHP, Composer e Artisan dentro de `back-end/`.
- Mantenha as rotas públicas da API sob o prefixo `/api/v1`.
- Controllers devem cuidar apenas do fluxo HTTP; validações ficam em Form Requests e a saída JSON em API Resources.
- Use Services somente para regras que coordenem múltiplas operações ou entidades. Consultas simples e relações permanecem nos Models.
- Preserve as relações Eloquent e os campos `$fillable` e `$casts` ao alterar Models ou migrations.
- Use os códigos HTTP adequados: `201` para criação, `404` para recurso inexistente e `422` para falha de validação.
- O endpoint `GET /api/v1/health` é o teste básico de comunicação com o frontend.
- O banco local padrão é SQLite. Nunca altere ou recrie um banco com dados sem autorização explícita.

## Frontend

- Execute comandos npm dentro de `front-end/`.
- Escreva componentes e lógica em TypeScript (`.ts` e `.tsx`), com componentes em PascalCase.
- Leia a URL base da API em `VITE_API_URL`; não fixe URLs de backend em componentes.
- Em desenvolvimento, o proxy do Vite encaminha `/api` para `http://127.0.0.1:8000`.
- Organize funcionalidades novas em `src/features/<feature>/`. Mantenha componentes, tipos e chamadas de API junto da feature.
- Use `src/shared/` apenas quando o mesmo código tiver uso real em duas ou mais features. Use `src/app/` para rotas, layout e providers quando essas camadas forem criadas.
- Evite dependências diretas entre features. Extraia contratos compartilhados quando houver necessidade concreta.
- Não presuma que React Router, Axios ou outra biblioteca já está instalada. Confira `front-end/package.json` antes de usar ou documentar uma dependência.

## Contrato entre as aplicações

- O frontend acessa dados exclusivamente pela API; nunca conecta diretamente ao banco.
- Respostas e erros devem manter um formato JSON consistente.
- Ao mudar uma rota ou payload, ajuste no mesmo trabalho o backend, o consumidor no frontend e a documentação afetada.
- Datas recebidas da API devem ser tratadas explicitamente, evitando depender do fuso horário implícito do navegador ou do servidor.

## Comandos usuais

Backend, em `back-end/`:

```powershell
composer install
Copy-Item .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve --host=127.0.0.1 --port=8000
```

Frontend, em `front-end/`:

```powershell
npm install
npm run dev -- --host 127.0.0.1
```

Se a porta padrão do Vite estiver ocupada, use outra porta e informe a URL escolhida.

## Qualidade e segurança

- Faça mudanças pequenas e compatíveis com a estrutura existente.
- Não instale bibliotecas novas sem autorização do usuário.
- Não execute testes, lint ou build sem solicitação explícita do usuário.
- Quando a verificação for solicitada, use o comando mais específico para a mudança: `php artisan test` no backend, `npm run lint` ou `npm run build` no frontend.
- Nunca inclua segredos, credenciais ou arquivos `.env` no repositório. Novas variáveis devem ser documentadas no respectivo `.env.example` sem valores sensíveis.
- Não edite dependências geradas em `back-end/vendor/`, `front-end/node_modules/` ou artefatos de build.
- Preserve mudanças do usuário que não façam parte da tarefa atual.