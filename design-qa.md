# Design QA — depoimentos circulares

**Fonte visual e funcional**

- Seção anterior: `C:\Users\henri\AppData\Local\Temp\codex-clipboard-58a49373-c30d-4d13-8031-de8c1e5b4933.png` (1365 × 518 px).
- Componente solicitado: `C:\Users\henri\.codex\attachments\4da9213c-6e7f-4a1c-9bb2-c05e32d79c87\pasted-text.txt`.
- Implementação: `http://127.0.0.1:5173/#clientes`, capturada e inspecionada no navegador interno do Codex.
- Viewport observado: aproximadamente 727 × 600 CSS px, densidade padrão.
- Estado: tema claro, usuário deslogado, primeiro e segundo depoimentos.

**Evidência comparativa**

- A seção antiga foi substituída pelo carrossel definido no prompt: três imagens sobrepostas, citação animada, identificação do cliente e controles anterior/próximo.
- O componente preserva os tokens visuais existentes da Nexo: fundo claro, verde escuro, cobre, Playfair Display, Manrope e DM Mono.
- As imagens remotas fornecidas no prompt carregaram corretamente e mantiveram recorte, nitidez e proporção consistentes.
- A inspeção focada foi necessária para validar o espaçamento entre as palavras animadas e os controles circulares.

**Histórico da comparação**

- P2 inicial: as palavras animadas apareciam visualmente concatenadas porque cada palavra era um bloco separado sem espaçamento persistente.
- Correção: aplicado espaçamento lateral explícito aos spans animados, sem alterar o ritmo tipográfico.
- Evidência posterior: a citação voltou a apresentar separação normal entre todas as palavras no navegador.

**Findings**

- Nenhum P0, P1 ou P2 restante.
- P3: as fotos são as imagens demonstrativas fornecidas pelo componente original e podem ser trocadas futuramente por retratos aprovados dos clientes da Nexo.

**Interações verificadas**

- Carregamento das três imagens.
- Troca de Ana Martins para Rafael Costa pelo controle de próximo depoimento.
- Atualização animada da citação, nome e cargo.
- Layout responsivo em viewport estreito.
- Respeito à preferência de redução de movimento implementado no componente.

**Console**

- O navegador interno usado para a inspeção não expôs o console nesta sessão; o build de produção é a verificação técnica complementar.

**Implementation Checklist**

- [x] Substituir o seletor antigo.
- [x] Manter os depoimentos atuais em português.
- [x] Integrar imagens, animações e setas do prompt.
- [x] Preservar a identidade visual da Home.
- [x] Adaptar o componente para mobile e teclado.

final result: passed
