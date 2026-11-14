| rota | tela | acesso | status |
| --- | --- | --- | --- |
| `/` | Home | Público; administradores autenticados veem acesso ao dashboard | Feito |
| `/login` | Login | Público | Feito |
| `/cadastro` | Cadastro de cliente | Público | Feito |
| `/conta` | Conta do cliente | Cliente autenticado | Feito |
| `/agendar` | Novo agendamento | Público até confirmar; confirmação exige login | Feito |
| `/admin/:slug/dashboard` | Indicadores, gráficos operacionais e receita estimada (7/30/90 dias e mês atual), agenda diária e agenda completa dos próximos sete dias | Administrador da barbearia | Feito |
| `/admin/:slug/agenda` | Agenda paginada, filtros, cadastro manual, cancelamento, conclusão e faltas | Administrador da barbearia | Feito |
| `/admin/:slug/barbeiros` | Equipe, serviços atendidos, jornada semanal, pausas e ausências | Administrador da barbearia | Feito |
| `/admin/:slug/servicos` | Cadastro e gerenciamento de serviços | Administrador da barbearia | Feito |
| `/admin/:slug/clientes` | Pesquisa, histórico e observações privadas de clientes da unidade | Administrador da barbearia | Feito |
| `/admin/:slug/configuracoes` | Perfil básico, regras de cancelamento e expediente semanal da unidade | Administrador da barbearia | Feito |

No dashboard, o administrador cadastra barbeiros, cancela agendamentos pendentes ou confirmados e marca o atendimento como concluído após o fim previsto. O cancelamento registra o usuário responsável e o motivo, e libera o horário para nova reserva.

A área `/conta` carrega o histórico real da API. O cliente pode cancelar somente os próprios agendamentos ainda ativos e antes do limite de antecedência configurado pela barbearia; agendamentos passados ou de outro cliente não podem ser cancelados.
