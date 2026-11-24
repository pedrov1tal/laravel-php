# Logos por tema — Design

## Intenção

Substituir as marcas textuais e a imagem antiga do frontend pelas logos oficiais fornecidas. A logo escura deve aparecer no tema claro e a logo clara no tema escuro, preservando legibilidade, proporção e navegação para o início.

## Objetivos

- Adicionar `logo-escura.png` e `logo-clara.png` aos assets públicos do frontend com nomes estáveis.
- Centralizar a marca em um componente compartilhado reutilizável.
- Aplicar a marca na home, login, cadastro, conta, agendamento, rodapé e painel administrativo, incluindo o cabeçalho mobile do painel.
- Trocar a imagem a partir de `data-theme`, já mantido pelo `darkModeStore`, sem criar outro estado de tema, exceto no painel administrativo, cuja sidebar sempre usa a logo clara por ter fundo escuro.
- Preservar texto acessível e o destino atual de cada link.

## Não objetivos

- Não redesenhar as logos, alterar suas cores ou recortar seu conteúdo.
- Não modificar rotas, backend, banco de dados ou comportamento do seletor de tema.
- Não instalar bibliotecas.

## Abordagens consideradas

1. **Troca estrita por tema com base de contraste no painel.** Um componente compartilhado renderiza as duas imagens; CSS exibe a escura no tema claro e a clara no escuro. Como a sidebar continua verde-escura no tema claro, a marca recebe uma base clara discreta nesse contexto.
2. **Troca conforme a superfície — escolhida após revisão visual.** A sidebar usa sempre a logo clara, pois permanece escura nos dois temas; as demais áreas continuam seguindo o tema global.
3. **Troca somente nas marcas existentes da home.** Tem menor alcance, mas deixa o painel e outras áreas visualmente inconsistentes.

## Direção visual

- **Cores:** manter `--paper` (`#fbfaf7`), `--ink` (`#17231f`), verde da sidebar (`#17231f`), cobre (`#bd704c`) e os equivalentes já definidos no tema escuro.
- **Tipografia:** nenhuma mudança; a própria logo substitui os lockups textuais.
- **Layout:** preservar a proporção original 3:1 com `object-fit: contain`; alinhamento à esquerda nos cabeçalhos, sidebar e rodapé.
- **Painel:** mostrar sempre a logo clara diretamente sobre o verde da sidebar e do cabeçalho mobile, sem base adicional.
- **Responsividade:** limitar largura por contexto para não competir com a navegação e reduzir a marca no cabeçalho mobile administrativo.

## Implementação proposta

- Criar `src/shared/components/BrandLogo.tsx` e estilos próximos ao componente.
- Copiar as imagens para `public/images/corte-rapido-logo-escura.png` e `public/images/corte-rapido-logo-clara.png`.
- Substituir os conteúdos atuais de `.brand`, `.admin-brand` e `.admin-mobile-brand` pelo componente compartilhado.
- Manter os links e seus rótulos acessíveis nos componentes que os possuem.
- Remover o background da imagem antiga em `.brand::before` e adaptar apenas os seletores necessários.

## Validação prevista

Revisão estática dos usos, do CSS de tema e do diff. Conforme as regras do repositório, não serão executados testes, lint ou build sem uma solicitação explícita.
