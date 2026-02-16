

# BBRC Digital — Bateria Breve de Rastreio Cognitivo

Aplicação web completa para aplicação digital da BBRC, com voz natural (ElevenLabs), reconhecimento de fala de alta precisão e armazenamento de resultados.

---

## 1. Configuração do Backend (Lovable Cloud + Supabase)

- Ativar Lovable Cloud para edge functions
- Conectar ElevenLabs (TTS para instruções de voz natural em português + STT para transcrição das respostas)
- Criar banco de dados com tabelas: `patients` (nome, idade, escolaridade), `test_sessions` (data, paciente, scores de cada fase, transcript bruto)

## 2. Tela Inicial e Cadastro

- Tela de boas-vindas com breve explicação do teste
- Formulário para dados do paciente (nome, idade, escolaridade) antes de iniciar — necessário para os pontos de corte ABN
- Botão "Iniciar Teste" que solicita permissão de microfone

## 3. Fase 1 — Nomeação (0-10 pontos)

- Exibir a prancha de estímulos (10 figuras) usando a imagem `bbrc_estimulos.jpg`
- Instrução por voz via ElevenLabs TTS: pedir ao paciente para nomear cada figura
- Capturar resposta via ElevenLabs STT (batch transcription)
- **Correção do bug de contagem**: normalizar texto (remover acentos), usar matching com sinônimos aceitos (ex: jabuti=tartaruga, ferro=ferro de passar), contar apenas matches **únicos** (Set) para evitar duplicatas
- Exibir pontuação em tempo real

## 4. Fase 2 — Memória Incidental (0-10 pontos)

- Esconder as figuras
- Instrução por voz: pedir ao paciente para evocar as figuras de memória
- Capturar e pontuar com a mesma lógica de matching único
- Avançar automaticamente

## 5. Fases 3 e 4 — Memória Imediata e Aprendizado (0-10 cada)

- Exposição da prancha por 30 segundos com timer visual
- Após 30s, esconder e pedir evocação
- Mesma lógica de captura e pontuação com deduplicação
- Repetir para a fase de Aprendizado

## 6. Fase 5 — Fluência Verbal (contagem de animais)

- Timer de 1 minuto visível na tela
- Instrução: dizer nomes de animais
- Transcrição contínua via ElevenLabs STT realtime
- **Correção de contagem**: normalizar nomes, comparar contra lista de ~200 animais válidos, contar apenas animais **únicos** (sem repetições), ignorar palavras que não são animais
- Contador em tempo real na tela

## 7. Fase 6 — Teste do Relógio (0-5 Shulman)

- Canvas de desenho com ferramentas básicas (caneta, borracha, desfazer)
- Instrução por voz: desenhar relógio marcando 11h10
- Análise heurística do desenho (circularidade, quadrantes, ponteiros)
- Seleção manual da pontuação Shulman (1-5) pelo aplicador como validação

## 8. Fase 7 — Memória Tardia (0-10 pontos)

- Após ~5 minutos de interferência (relógio + fluência servem como distratores)
- Pedir evocação das 10 figuras novamente
- Mesma lógica de pontuação com deduplicação

## 9. Fase 8 — Reconhecimento (0-10 pontos)

- Exibir prancha de reconhecimento (20 figuras: 10 originais + 10 distratoras) usando `bbrc_reconhecimento.jpg`
- Paciente identifica quais são as originais via voz
- Pontuação: contar acertos (figuras originais identificadas corretamente)

## 10. Fase 9 — Relatório Final

- Exibir todos os scores em tabela clara
- Pontos de corte ABN 2022 por escolaridade (analfabetos, 1-3 anos, 4-7 anos, ≥8 anos)
- Indicação visual (verde/vermelho) se score está abaixo do corte
- Botão para imprimir/salvar PDF
- Salvar resultados automaticamente no banco de dados

## 11. Lógica de Matching (correção central dos bugs)

- Função `normalize()`: remove acentos, converte para minúsculas, remove pontuação
- Função `matchTargetFigures()`: compara transcrição contra as 10 figuras com tabela de sinônimos, retorna Set de matches únicos
- Função `matchAnimals()`: compara contra lista de animais, retorna Set de animais únicos
- Todas as contagens usam Sets para garantir que cada item seja contado **apenas uma vez**

## 12. Design e UX

- Interface limpa e profissional, adequada para ambiente clínico
- Tipografia grande e legível
- Indicadores claros de fase atual e progresso
- Feedback visual durante gravação de voz (indicador de microfone ativo)
- Responsivo para uso em tablet

