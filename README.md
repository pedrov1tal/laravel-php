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

As requisições `POST`, `PUT`, `PATCH` e `DELETE` da API exigem token, com
exceção das rotas de registro e login. Os endpoints `GET` continuam públicos,
exceto `/api/v1/auth/me`.

O seed cria o seguinte usuário de teste:

- E-mail: `ana@exemplo.com`
- Senha: `senha123`





ALTERAÇÕES FUTURAS: 

Tirar o agendar da home, pois é uma funcionalidade do sistema e não deve estar no site, e sim na pagina do usuario

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

- Frontend: http://localhost:5173
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
- `VITE_API_URL` é passada como argumento de build público para o serviço `web`; o frontend atual ainda não consome essa variável no código.