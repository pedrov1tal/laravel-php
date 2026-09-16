| rota               | tela        | parâmetro | protegida |
| /                  | Home        |     —     | não       |  FEITO
| /agendar           | Novo agendamento | estabelecimento (query, opcional) | não | FEITO
| /login             | Login       |     —     | não       |  FEITO
| /cadastro          | Cadastro    |     —     | não       |  FEITO
| /agendamentos      | Lista       |     —     | não       |
| /agendamentos/:id  | Detalhe     |     id    | não       |
| /meus-agendamentos | Agendamentos|     —     | sim       |

Em `/agendar`, serviço, profissional e horário podem ser escolhidos sem sessão. Para avançar à identificação e confirmação, o cliente precisa entrar ou criar uma conta; o rascunho é retomado após o retorno.
| /dashboard         | Dashboard   |     —     | sim       |
| /meus-agendamentos | Agendamentos|     —     | sim       |
