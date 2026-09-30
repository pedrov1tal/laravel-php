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