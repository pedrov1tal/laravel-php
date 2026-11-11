| rota | tela | acesso | status |
| --- | --- | --- | --- |
| `/` | Home | Público; administradores autenticados veem acesso ao dashboard | Feito |
| `/login` | Login | Público | Feito |
| `/cadastro` | Cadastro de cliente | Público | Feito |
| `/conta` | Conta do cliente | Cliente autenticado | Feito |
| `/agendar` | Novo agendamento | Público até confirmar; confirmação exige login | Feito |
| `/admin/:slug/dashboard` | Dashboard administrativo, cadastro de barbeiros e agenda do dia | Administrador da barbearia | Feito |

No dashboard, o administrador cadastra barbeiros e cancela agendamentos pendentes ou confirmados. O cancelamento registra o usuário responsável e o motivo, e libera o horário para nova reserva.
