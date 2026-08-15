# AGENTS.md

Guia de trabalho para agentes neste repositório.

## Projeto

GameappRPG — RPG web de batalha por turnos em React 18 + Vite.

- Framework: React 18, `react-router-dom` v6, `lucide-react`
- Build: `npm run build` (Vite)
- Dev: `npm run dev`
- Sem framework de testes configurado; validação via `npm run build` + testes manuais.

## Git — antes de commitar (obrigatório)

- SEMPRE rodar `git status` e `git diff` ANTES de commitar.
- Objetivo: detectar mudanças de outros terminais/agentes rodando em paralelo
  (arquivos sobrescritos, commits misturados, trabalho de outra sessão).
- Se houver mudanças que não são da tarefa atual, avisar o usuário antes de
  incluí-las no commit.
- Nunca commitar segredos/chaves.

## Comandos de verificação

- `npm run build` para validar que o código compila.
- `git status --short` e `git diff --stat` antes de qualquer commit.

## Git — ao final de toda atualização (obrigatório)

- SEMPRE fazer commit E push ao terminar qualquer atualização/tarefa.
- Sequência: `npm run build` → `git status`/`git diff` → `git add` → `git commit` → `git push`.
- Se houver mudanças de outra sessão que não são da tarefa, avisar o usuário
  antes de incluí-las no commit.

## Estilo de comunicação (obrigatório)

- Explicar planos e alterações SEMPRE de forma didática, como um professor para
  alguém que está aprendendo agora.
- Usar pouquíssimas referências a código; priorizar analogias e linguagem simples.

## Estrutura

- `src/context/GameContext.jsx` — estado global (ouro, XP, nível, stats, dificuldade).
- `src/screens/` — telas (Start, Home, Inicio, Battle).
- `src/components/` — componentes reutilizáveis (HealthBar, ResourceBar, DiceRoll, BottomNav).

## Skills disponíveis (instaladas em `~/.agents/skills`)

- `webapp-testing` — testes E2E com Playwright.
- `code-review` — checklist de revisão de código.
- `git-workflow-and-versioning` — boas práticas de Git e versionamento.
- `vercel-composition-patterns` — padrões de composição em React.
- Diversas skills de game dev já presentes (game-designer, game-engine, etc.).

## Agentes (em `.opencode/agent/`)

- `code-reviewer` — revisa código (somente leitura).
- `tester` — escreve e roda testes.
- `game-designer` — design, balanceamento e UI/UX do jogo.

## Gerenciar skills

- Buscar: `npx skills find <termo>`
- Instalar: `npx skills add <owner/repo@skill> -g -y`
- Atualizar: `npx skills check` / `npx skills update`
