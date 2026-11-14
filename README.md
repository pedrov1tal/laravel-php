Funcionalidades Principais
• Agendamentos 
• Cadastrar barbearia
• Cadastro de serviço
• Cadastro de usuário
• Cadastro barbeiro

* Acesso de teste

- Login: `ana@exemplo.com`
- Senha: `senha123`

Substantivo de dominio 

Barbearia -> nome, endereço, telefone
Usuário -> nome, CPF, email, telefone, senha
Barbeiro -> nome,telefone
Serviço -> nome, preço, duração
Agendamento -> data, horário, serviço, usuário, barbeiro

## Autenticação da API

A API usa tokens JWT com validade de uma hora. Configure um segredo local no
arquivo `back-end/.env`:

```env
JWT_SECRET=troque-por-um-segredo-longo-e-aleatorio
```

Endpoints disponíveis sob o prefixo `/api/v1`:

- `POST /api/v1/auth/registro` com `{ "nome", "email", "senha" }`;
- `POST /api/v1/auth/login` com `{ "email", "senha" }`;
- `GET /api/v1/auth/me` com `Authorization: Bearer <token>`.
- `POST /api/v1/admin/barbearias/{barbearia}/barbeiros` com `{ "nome", "telefone", "email" }` para administradores da barbearia;
- `PATCH /api/v1/admin/barbearias/{barbearia}/agendamentos/{agendamento}/cancelamento` com `{ "motivo" }` para cancelar agendamentos pendentes ou confirmados.
- `PATCH /api/v1/admin/barbearias/{barbearia}/agendamentos/{agendamento}/conclusao` para registrar a conclusão após o término previsto do atendimento.
- `PATCH /api/v1/admin/barbearias/{barbearia}/agendamentos/{agendamento}/nao-comparecimento` registra uma falta após o término previsto, separada de cancelamento voluntário.
- `GET /api/v1/cliente/agendamentos` lista apenas os agendamentos do cliente autenticado; `PATCH /api/v1/cliente/agendamentos/{agendamento}/cancelamento` cancela somente reservas próprias dentro do prazo definido pela barbearia.
- `GET`, `POST`, `PUT` e `DELETE /api/v1/admin/barbearias/{barbearia}/servicos` para consultar e gerenciar o catálogo da unidade; serviços com histórico não podem ser excluídos, mas podem ser desativados.
- `POST /api/v1/admin/barbearias/{barbearia}/barbeiros` recebe também `servico_ids` e só aceita serviços cadastrados na própria unidade.
- `GET`, `PUT /api/v1/admin/barbearias/{barbearia}/barbeiros/{barbeiro}`, `PUT .../jornada` e endpoints aninhados em `/ausencias` gerenciam perfil, escala semanal, pausas e ausências sem afetar outra barbearia.
- `GET /api/v1/admin/barbearias/{barbearia}/clientes?busca=...`, `GET .../clientes/{cliente}` e `PATCH .../clientes/{cliente}` para pesquisar, consultar histórico, salvar observações internas e bloquear reservas por unidade.
- `GET` e `PATCH /api/v1/admin/barbearias/{barbearia}/configuracoes` para dados gerais, identidade de cores, fuso horário e antecedência de cancelamento; `PUT .../horarios-funcionamento` salva os sete dias da semana.
- `GET /api/v1/admin/barbearias/{barbearia}/agendamentos` lista a agenda paginada com filtros de período, profissional, status e cliente.
- `GET /api/v1/admin/barbearias/{barbearia}/dashboard?periodo=7|30` retorna métricas e análises limitadas aos dados da unidade; `PATCH .../agendamentos/{agendamento}/confirmacao` revalida a disponibilidade antes de confirmar.
- `POST /api/v1/admin/barbearias/{barbearia}/agendamentos` permite cadastro manual usando cliente vinculado, serviço e profissional da unidade; a disponibilidade é revalidada pelo mesmo serviço de domínio do agendamento público.

As rotas de administração da barbearia exigem token e associação do usuário
àquela unidade. O contexto público de agendamento e o health check não exigem
login. Registro e login também são públicos; as operações de cliente e todas
as demais rotas devem seguir o middleware e as permissões definidos em
`back-end/routes/api.php`.

O seed cria o seguinte usuário de teste:

- E-mail: `ana@exemplo.com`
- Senha: `senha123`

Para testar o painel administrativo, o seed também cria:

- E-mail: `admin@exemplo.com`
- Senha: `senha123`
- Painel: `/admin/barbearia-teste/dashboard`

Execute `php artisan db:seed` (ou `docker compose exec api php artisan db:seed`)
para criar essas contas, a barbearia de demonstração, três serviços, um barbeiro
com jornada semanal, horários de funcionamento, a cliente vinculada e dois
agendamentos de demonstração (um concluído e um confirmado). O seed pode ser
executado novamente sem duplicar esses registros.





ALTERAÇÕES FUTURAS: 

Tirar o agendar da home, pois é uma funcionalidade do sistema e não deve estar no site, e sim na pagina do usuario

## Estado atual e próximos módulos

Implementado no código atual:

- Autenticação JWT e separação administrativa por barbearia.
- Fluxo público de agendamento com validação de duração, conflitos, expediente,
  escala, pausas, ausências e bloqueio de cliente na unidade.
- Gestão administrativa de serviços, profissionais, jornadas/ausências e
  clientes, com consultas limitadas à barbearia da rota.
- Agenda administrativa paginada com filtros, cancelamento e conclusão de
  atendimentos, cadastro manual validado no backend, além do expediente e perfil
  básico configuráveis.
- Dashboard operacional diário com agenda, equipe, alertas e indicadores de
  clientes, confirmações, cancelamentos e faltas calculados no banco.

Ainda não implementado ou não comprovado como funcional:

- Faturamento e avaliações por período ainda não podem ser analisados porque o
  banco não registra pagamentos nem avaliações. O dashboard já mostra gráficos
  CSS de volume diário (7/30 dias), serviços concluídos, desempenho da equipe e
  distribuição de estados, sem adicionar dependência de gráficos.
- Registro de pagamentos, métodos de pagamento, comissões e faturamento real;
  o preço de um serviço concluído ainda não é evidência de pagamento recebido.
- Avaliações e notificações. Faltas são registradas e aparecem nos indicadores
  básicos do dashboard e do perfil do cliente.
- Configurações avançadas da barbearia (logo/capa, WhatsApp/redes sociais,
  intervalos, feriados, horários especiais e fechamento temporário) e descoberta
  pública de estabelecimentos. O perfil básico e o expediente semanal já podem
  ser editados pelo admin.
- Área do cliente ainda sem edição de perfil, favoritos, reagendamento da mesma
  reserva e notificações.
- Super Admin, planos, assinaturas e integração com gateway de pagamento.
- Perfis e permissões individuais para barbeiros.
- Verificação ponta a ponta de responsividade e isolamento multi-tenant após as
  alterações mais recentes.

Próximos passos recomendados: restabelecer o ambiente Docker e confirmar os
dados persistidos; executar migrations incrementais e testes isolados em SQLite
em memória; completar ações da agenda e configuração da unidade; implementar
pagamentos/comissões antes de exibir faturamento; depois desenvolver área do
cliente, avaliações/notificações e Super Admin. O banco de desenvolvimento usa
SQLite em volume persistente; o PostgreSQL citado na proposta ainda não está
configurado neste repositório.

## Rodando com Docker

O Compose da raiz sobe o Laravel e o Vite em modo de desenvolvimento. Na primeira execução, crie o arquivo local de ambiente e gere a chave da aplicação:

```powershell
Copy-Item back-end/.env.example back-end/.env
docker compose run --build --rm api php artisan key:generate
```

Depois, suba os serviços:

```powershell
docker compose up --build
```

- Frontend: http://localhost:3001
- API: http://localhost:8000 (health check: `/api/v1/health`)
- As chamadas `/api` do Vite são encaminhadas ao serviço `api` dentro da rede Docker.
- A primeira vez, crie as tabelas como o usuário Apache para manter a permissão de escrita do SQLite: `docker compose exec -u www-data api php artisan migrate --force`.
- O banco persiste no volume nomeado `laravel_data`, mesmo após `docker compose down`. Não use `docker compose down -v` se quiser preservar os dados.
- O código é montado para refletir alterações; o Vite usa polling para detectar mudanças em Windows e macOS. `node_modules` e `vendor` permanecem em volumes separados.

O arquivo `back-end/.env` é local e não deve ser versionado nem copiado para imagens.

### Simulação de produção local

Reutilize o `back-end/.env` criado acima e configure nele um `JWT_SECRET` próprio. Gere uma chave com o comando abaixo, copie o valor exibido para `APP_KEY` no arquivo `.env` local e então suba os targets de produção. A imagem não contém `.env`, portanto `key:generate` não deve tentar gravar esse arquivo dentro do container:

```powershell
docker compose -f compose.prod.yaml run --build --rm api php artisan key:generate --show
docker compose -f compose.prod.yaml up --build
```

- Frontend estático servido por Nginx: http://localhost:8080
- API Laravel: http://localhost:3001 (health check: `/health`)
- O SQLite fica no volume nomeado `api_data`; `docker compose -f compose.prod.yaml down` o preserva. `down -v` remove o banco.
- Execute a migração inicial como `www-data`: `docker compose -f compose.prod.yaml exec -u www-data api php artisan migrate --force`.
- `VITE_API_URL` configura a base usada pelo frontend; no Compose de produção ela aponta para a API em `http://localhost:3001/api/v1`.
