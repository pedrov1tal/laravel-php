# Configuração do pooler Neon no Laravel 13

## Intenção

Corrigir os erros PostgreSQL `25P02` apresentados durante transações de agendamento, mantendo o pooler do Neon para o tráfego da API e reservando a conexão direta para migrations e demais operações de schema.

## Abordagens consideradas

- Usar a conexão direta em toda a aplicação: é simples, mas elimina os benefícios do pooler e reduz a capacidade de lidar com conexões concorrentes.
- Usar a configuração nativa `pooled` + `direct` do Laravel 13: mantém o pooler na aplicação, habilita automaticamente a compatibilidade necessária do PDO e direciona migrations para o endpoint direto. Esta foi a abordagem aprovada.

## Alterações

- A conexão `pgsql` continuará sendo a conexão padrão da aplicação.
- `DB_POOLED` indicará explicitamente quando o endpoint principal usa um pooler transacional.
- O bloco `direct` receberá `DB_DIRECT_HOST`, `DB_DIRECT_PORT`, `DB_DIRECT_USERNAME`, `DB_DIRECT_PASSWORD` e `DB_DIRECT_SSLMODE`, herdando as demais opções da conexão principal.
- O bloco `direct` somente existirá quando `DB_POOLED=true` e `DB_DIRECT_HOST` estiver preenchido, impedindo fallback silencioso para o host pooled.
- A conexão paralela `pgsql_unpooled` será removida para evitar duas configurações concorrentes para a mesma finalidade.
- Os exemplos de ambiente e o runbook de produção documentarão as novas variáveis sem incluir credenciais.
- O `.env` local será ajustado com `DB_POOLED=true` e um host direto derivado do endpoint Neon atual, sem versionar ou expor segredos.

## Restrições e fora de escopo

- Não alterar o `AgendamentoService` nem o contrato HTTP.
- Não instalar dependências.
- Não executar testes, lint ou build.
- Não executar a migration pendente nem modificar dados do banco sem autorização explícita.
- Preservar todas as mudanças existentes do usuário.

## Verificação

Inspecionar dentro do container a configuração resolvida pelo Laravel, confirmando que `pgsql` está marcado como pooled, possui configuração direct e usa prepares emulados apenas na conexão pooled. A verificação não executará migrations nem gravará no banco.
