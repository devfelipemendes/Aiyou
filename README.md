# 📋 Git + Versionamento - Cheat Sheet

## 🎯 **Comandos Essenciais do Dia a Dia**

### **🆕 Criar Nova Funcionalidade**

```bash
# 1. Criar feature branch
git feature analytics-dashboard
# ou manualmente: git checkout develop && git checkout -b feature/analytics-dashboard

# 2. Desenvolver com commits corretos
git add .
git commit -m "feat(analytics): add dashboard structure"
git commit -m "feat(analytics): implement chart components"
git commit -m "test(analytics): add unit tests"

# 3. Push e MR
git push -u origin feature/analytics-dashboard
# Criar MR no GitLab: feature → develop
```

### **🐛 Correção de Bug**

```bash
# 1. Branch de fix
git checkout develop
git checkout -b fix/drag-drop-positioning

# 2. Commit de correção
git commit -m "fix: resolve drag overlay positioning in Safari

The drag overlay was misaligned due to CSS transform conflicts.
Added browser-specific styles for better compatibility.

Fixes #123"

# 3. MR para develop
git push -u origin fix/drag-drop-positioning
```

### **🚀 Release para Produção**

```bash
# Método simples (com alias)
git release

# Ou método manual:
git checkout main
git pull origin main
git merge develop
git push origin main

# ✅ Resultado: versão incrementada automaticamente!
```

### **🔥 Hotfix Urgente**

```bash
# 1. Direto da main
git hotfix critical-security-patch
# ou: git checkout main && git checkout -b hotfix/critical-security-patch

# 2. Correção mínima
git commit -m "fix: patch critical auth vulnerability

- Validate JWT tokens properly
- Add input sanitization
- Fix session handling

CVE-2024-1234"

# 3. Merge direto para main
git checkout main
git merge hotfix/critical-security-patch
git push origin main

# 4. Sincronizar develop
git checkout develop && git merge main && git push origin develop
```



---

## 📝 **Tipos de Commit e Versionamento**

| Commit      | Versão         | Quando Usar            |
| ----------- | -------------- | ---------------------- |
| `feat:`     | **v1.1.0**     | Nova funcionalidade    |
| `fix:`      | **v1.0.1**     | Correção de bug        |
| `feat!:`    | **v2.0.0**     | Mudança que quebra API |
| `docs:`     | **sem versão** | Documentação           |
| `style:`    | **sem versão** | Formatação             |
| `refactor:` | **sem versão** | Refatoração            |
| `test:`     | **sem versão** | Testes                 |
| `chore:`    | **sem versão** | Configuração           |

---

## ✅ **Exemplos de Commits Corretos**

### **🎯 FEAT (Nova Funcionalidade)**

```bash
git commit -m "feat(monitoring): add real-time notifications

- WebSocket integration for live updates
- Toast notifications for new messages
- Sound alerts configuration
- Desktop notification support

Implements #456"
```

### **🐛 FIX (Correção)**

```bash
git commit -m "fix: resolve memory leak in chat monitoring

The WebSocket connections weren't being properly cleaned up
when components unmounted, causing memory accumulation.

- Add cleanup in useEffect return
- Implement connection pooling
- Add debugging logs

Fixes #789"
```

### **💥 BREAKING CHANGE (Major)**

```bash
git commit -m "feat!: redesign monitoring API structure

BREAKING CHANGE: All API endpoints changed from /api/v1/ to /api/v2/

Migration required:
- /api/chats → /api/v2/monitoring/chats
- /api/history → /api/v2/monitoring/history
- Response format changed to include metadata

See MIGRATION.md for detailed guide.

Closes #321"
```

---

## 🌿 **Fluxo de Branches**

```
main (v1.2.0)     ●─────●─────●  ← Produção + Versionamento
                   │     │     │
develop           ●─●─●─●─●─●─●  ← Staging (sem versionamento)
                   │ │ │   │ │
feature/analytics   ●─●─●     │  ← Desenvolvimento
feature/export           ●─●─●  ← Desenvolvimento
hotfix/security    ●───────────●  ← Correções urgentes
```

### **📋 Regras:**

- ✅ **develop**: Desenvolvimento contínuo, deploy para staging
- ✅ **main**: Apenas releases, versionamento automático
- ✅ **feature/**: Novas funcionalidades, MR para develop
- ✅ **hotfix/**: Correções urgentes, MR direto para main

---

## 🔧 **Comandos de Verificação**

### **📊 Status do Versionamento**

```bash
# Ver última versão
git describe --tags --abbrev=0

# Ver commits desde última versão
git log $(git describe --tags --abbrev=0)..HEAD --oneline

# Ver diferença entre branches
git log develop..main --oneline

# Verificar se commit vai gerar versão
git log --oneline -5 | grep -E "(feat:|fix:|feat!)"
```

### **🏷️ Gestão de Tags**

```bash
# Listar todas as versões
git tag -l

# Ver detalhes de uma versão
git show v1.2.0

# Comparar versões
git diff v1.1.0..v1.2.0

# Deletar tag (se necessário)
git tag -d v1.2.0
git push --delete origin v1.2.0
```

### **🧹 Limpeza**

```bash
# Limpar branches mergeadas
git branch --merged develop | grep -v develop | xargs git branch -d

# Atualizar referências remotas
git fetch --all --prune

# Ver branches órfãs
git branch -r --merged main
```

---

## 🚨 **Troubleshooting**

### **❌ Problema: Versão não foi criada**

```bash
# Verificar se commit tem feat: ou fix:
git log --oneline -1

# Verificar se pipeline rodou
# GitLab → CI/CD → Pipelines

# Verificar se CI_PUSH_TOKEN está configurado
# GitLab → Settings → CI/CD → Variables
```

### **❌ Problema: Pipeline falhou**

```bash
# Ver logs do pipeline
# GitLab → CI/CD → Pipelines → [pipeline] → auto-version

# Problemas comuns:
# 1. CI_PUSH_TOKEN não configurado
# 2. scripts/version.sh não executável
# 3. Commit não tem feat: ou fix:
```

### **❌ Problema: Versão incorreta**

```bash
# Deletar tag e refazer
git tag -d v1.2.0
git push --delete origin v1.2.0

# Corrigir package.json manualmente
npm version 1.1.0 --no-git-tag-version

# Commit correção
git add package.json
git commit -m "fix: correct version number [skip ci]"
```

---

## 📱 **Interface Visual Esperada**

### **Na Aplicação:**

```
┌─────────────────────────────────────────┐
│ 📊 Monitoramento de Chats    [v1.2.0]  │ ← Versão atual
│                              ─────────  │
│ 🟢 Sistema Online  📈 94% Uptime       │
└─────────────────────────────────────────┘
```

### **No GitLab:**

```
📦 Repository → Tags
v1.2.0  ✨ Feature Release (2h ago)
v1.1.5  🐛 Bug Fixes (1 day ago)
v1.1.4  🔧 Performance (3 days ago)

🚀 CI/CD → Pipelines
✅ #1234 - v1.2.0 (main) - 3m 15s
✅ #1233 - develop - 2m 45s
✅ #1232 - feature/analytics - 1m 30s
```

---

## 💡 **Dicas de Produtividade**

### **🎯 Templates Úteis**

```bash
# Salvar templates comuns
git config alias.feat '!f() { git commit -m "feat($1): $2"; }; f'
git config alias.fix '!f() { git commit -m "fix($1): $2"; }; f'

# Uso:
# git feat monitoring "add real-time alerts"
# git fix auth "resolve login timeout"
```

### **📋 Scripts Customizados**

```bash
# Ver pipeline status
alias pipeline='echo "🚀 Pipeline: $(git branch --show-current)" && git log --oneline -1'

# Release rápido
alias quick-release='git checkout main && git merge develop && git push origin main'

# Status completo
alias fullstatus='git status && echo "" && git log --oneline -3'
```

---

## 🎯 **Resumo dos Aliases Configurados**

```bash
git feature nome       # Criar feature branch
git hotfix nome        # Criar hotfix branch
git release           # Merge develop → main
git co                # checkout
git br                # branch
git ci                # commit
git st                # status
```

**Este é seu workflow diário! Qualquer dúvida, me pergunte! 🚀**













# 🌿 Git Flow + Versionamento - Organização Completa

## 🎯 Estrutura de Branches Recomendada

### **📋 Branches Principais**
```
main (produção)
├── develop (desenvolvimento)
│   ├── feature/drag-drop-monitoring
│   ├── feature/websocket-optimization  
│   ├── feature/chat-analytics
│   └── hotfix/critical-bug-fix
```

### **🔧 Configuração de Versionamento por Branch**

#### **main/master**: Versionamento automático ✅
- ✅ **Incrementa versão** automaticamente
- ✅ **Cria tags** (v1.0.0, v1.1.0, etc)
- ✅ **Deploy para produção**

#### **develop**: Sem versionamento ⏸️
- ⏸️ **Não incrementa versão**
- ✅ **Roda testes e build**
- ✅ **Deploy para staging**

#### **feature/**: Sem versionamento ⏸️
- ⏸️ **Não incrementa versão**
- ✅ **Roda testes básicos**

---

## 📝 Convenção de Commits (Conventional Commits)

### **🎯 Formato Obrigatório:**
```
<tipo>[escopo opcional]: <descrição>

[corpo opcional]

[rodapé opcional]
```

### **📊 Tipos e Impacto na Versão:**

| Tipo | Versão | Exemplo | v1.0.0 → |
|------|--------|---------|----------|
| `fix:` | **PATCH** | `fix: resolve drag drop issue` | v1.0.**1** |
| `feat:` | **MINOR** | `feat: add real-time notifications` | v1.**1**.0 |
| `feat!:` | **MAJOR** | `feat!: redesign API endpoints` | **v2**.0.0 |
| `BREAKING CHANGE` | **MAJOR** | (no corpo do commit) | **v2**.0.0 |
| `docs:` | **Nenhum** | `docs: update README` | v1.0.0 |
| `style:` | **Nenhum** | `style: fix indentation` | v1.0.0 |
| `refactor:` | **Nenhum** | `refactor: optimize API calls` | v1.0.0 |
| `test:` | **Nenhum** | `test: add unit tests` | v1.0.0 |
| `chore:` | **Nenhum** | `chore: update dependencies` | v1.0.0 |

---

## 🚀 Fluxo de Trabalho Prático

### **🔄 Desenvolvimento de Feature**

#### **1. Criar branch de feature**
```bash
# Partir do develop
git checkout develop
git pull origin develop

# Criar nova feature
git checkout -b feature/monitoring-analytics
```

#### **2. Desenvolver com commits organizados**
```bash
# Commits pequenos e focados
git add .
git commit -m "feat(monitoring): add analytics dashboard structure

- Create analytics components
- Setup chart.js integration
- Add responsive layout grid
"

git commit -m "feat(monitoring): implement real-time metrics

- Add WebSocket metrics collection
- Create metric visualization components  
- Integrate with existing chat monitoring
"

git commit -m "test(monitoring): add analytics unit tests

- Test metric calculations
- Test chart rendering
- Add snapshot tests for components
"

git commit -m "docs(monitoring): update analytics documentation

- Add usage examples
- Document new analytics APIs
- Update README with new features
"
```

#### **3. Push e criar MR/PR**
```bash
git push -u origin feature/monitoring-analytics

# No GitLab: criar Merge Request para develop
```

#### **4. Merge para develop (SEM versionamento)**
```bash
git checkout develop
git merge feature/monitoring-analytics
git push origin develop

# ✅ Resultado: develop atualizado, SEM nova versão
```

### **🚀 Release para Produção**

#### **5. Merge develop → main (COM versionamento)**
```bash
git checkout main
git pull origin main
git merge develop
git push origin main

# ✅ Resultado: GitLab CI detecta feat: → cria v1.1.0 automaticamente!
```

---

## 📋 Configuração GitLab CI por Branch

### **Arquivo .gitlab-ci.yml:**
```yaml
stages:
  - build
  - test
  - version
  - deploy

variables:
  NODE_VERSION: "18"
  GIT_DEPTH: 0

# ========================================================================================
# BUILD & TEST (todas as branches)
# ========================================================================================

build:
  stage: build
  image: node:${NODE_VERSION}
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/
      - .next/
    expire_in: 1 hour
  only:
    - main
    - develop
    - merge_requests

test:
  stage: test
  image: node:${NODE_VERSION}
  script:
    - npm ci
    - npm run test
    - npm run lint
  only:
    - main
    - develop
    - merge_requests

# ========================================================================================
# VERSIONAMENTO (APENAS MAIN)
# ========================================================================================

auto-version:
  stage: version
  image: node:${NODE_VERSION}
  before_script:
    - chmod +x scripts/version.sh
    - apt-get update -qq && apt-get install -y git
  script:
    - ./scripts/version.sh
  artifacts:
    paths:
      - version.json
      - public/version.json
    expire_in: 1 day
  only:
    - main  # ← APENAS na branch main
  except:
    variables:
      - $CI_COMMIT_MESSAGE =~ /\[skip ci\]/

# ========================================================================================
# DEPLOY
# ========================================================================================

deploy-staging:
  stage: deploy
  script:
    - echo "🚀 Deploy para staging..."
    # Seus comandos de deploy para staging
  environment:
    name: staging
    url: https://staging.seu-app.com
  only:
    - develop  # ← Deploy develop para staging

deploy-production:
  stage: deploy
  script:
    - echo "🚀 Deploy para produção..."
    # Seus comandos de deploy para produção
  environment:
    name: production
    url: https://seu-app.com
  only:
    - main     # ← Deploy main para produção
  when: manual # ← Deploy manual para produção
```

---

## 🎯 Exemplos Práticos de Commits

### **✅ Commits que GERAM versões:**

#### **PATCH (v1.0.0 → v1.0.1):**
```bash
git commit -m "fix(monitoring): resolve WebSocket connection timeout

- Increase connection retry attempts
- Add exponential backoff strategy
- Improve error handling for network issues

Fixes #123
"

git commit -m "fix: correct drag drop positioning in Safari

The drag overlay was misaligned in Safari due to CSS transform issues.
Added browser-specific handling for better compatibility.
"
```

#### **MINOR (v1.0.0 → v1.1.0):**
```bash
git commit -m "feat(monitoring): add chat analytics dashboard

- Real-time metrics visualization
- Historical data charts  
- Performance indicators
- Export functionality

Implements #456
"

git commit -m "feat: implement dark mode theme

Add comprehensive dark mode support across all components.
Includes automatic detection based on system preferences.
"
```

#### **MAJOR (v1.0.0 → v2.0.0):**
```bash
git commit -m "feat!: redesign monitoring API endpoints

BREAKING CHANGE: All monitoring endpoints now use /api/v2/ prefix.
Old /api/v1/ endpoints are removed.

Migration guide:
- /api/chats → /api/v2/monitoring/chats
- /api/history → /api/v2/monitoring/history

Closes #789
"
```

### **❌ Commits que NÃO geram versões:**
```bash
git commit -m "docs: update installation guide

Add Docker setup instructions and troubleshooting section.
"

git commit -m "style(monitoring): fix ESLint warnings

- Remove unused imports
- Fix indentation consistency
- Update TypeScript types
"

git commit -m "refactor: optimize chat rendering performance

Extract memo components and reduce unnecessary re-renders.
No functional changes.
"

git commit -m "test: add integration tests for WebSocket

Improve test coverage for real-time features.
"

git commit -m "chore: update dependencies to latest versions

- Update React to 18.3.0
- Update Material-UI to 5.15.0  
- Update TypeScript to 5.3.0
"
```

---

## 🔧 Comandos Úteis para Organização

### **📊 Verificar histórico de commits:**
```bash
# Ver commits que vão gerar versionamento
git log --oneline -10 | grep -E "(feat:|fix:|feat!|BREAKING)"

# Ver todos os commits desde última tag
git log $(git describe --tags --abbrev=0)..HEAD --oneline

# Ver diff entre branches
git log develop..main --oneline
```

### **🏷️ Gerenciar tags e versões:**
```bash
# Ver todas as tags
git tag -l

# Ver última versão
git describe --tags --abbrev=0

# Ver diferenças entre versões  
git diff v1.0.0..v1.1.0

# Deletar tag (se necessário)
git tag -d v1.0.1
git push --delete origin v1.0.1
```

### **🌿 Gerenciar branches:**
```bash
# Limpar branches mergeadas
git branch --merged develop | grep -v develop | xargs -n 1 git branch -d

# Ver branches remotas
git branch -r

# Sincronizar com remoto
git fetch --all --prune
```

---

## 📋 Workflow Completo - Passo a Passo

### **🎯 Cenário: Implementar nova funcionalidade**

#### **Dia 1-3: Desenvolvimento**
```bash
# 1. Criar feature branch
git checkout develop
git pull origin develop
git checkout -b feature/chat-export-functionality

# 2. Desenvolver em commits organizados
git commit -m "feat(export): add export button to chat interface"
git commit -m "feat(export): implement CSV export functionality" 
git commit -m "feat(export): add PDF export with formatting"
git commit -m "test(export): add unit tests for export functions"
git commit -m "docs(export): add export feature documentation"

# 3. Push e MR para develop
git push -u origin feature/chat-export-functionality
# Criar MR no GitLab: feature/chat-export-functionality → develop
```

#### **Dia 4: Code Review e Merge para Develop**
```bash
# 4. Após aprovação, merge para develop
git checkout develop
git merge feature/chat-export-functionality
git push origin develop

# ✅ Resultado: Deploy automático para staging, SEM versionamento
```

#### **Dia 5: Release para Produção**
```bash
# 5. Merge develop → main para release
git checkout main
git pull origin main
git merge develop  
git push origin main

# ✅ Resultado: GitLab CI detecta feat: → cria v1.2.0 automaticamente!
# ✅ Versão v1.2.0 aparece na UI da aplicação
# ✅ Tag v1.2.0 criada no repositório
# ✅ Deploy para produção (manual)
```

---

## 🚨 Correções Urgentes (Hotfix)

### **🔥 Fluxo para bugs críticos:**
```bash
# 1. Branch direto da main para hotfix
git checkout main
git pull origin main
git checkout -b hotfix/critical-security-fix

# 2. Fazer correção mínima
git commit -m "fix: patch critical security vulnerability in auth

- Validate JWT tokens properly
- Add rate limiting to login endpoint
- Sanitize user input

CVE-2024-1234"

# 3. Merge direto para main (bypass develop)
git checkout main
git merge hotfix/critical-security-fix
git push origin main

# ✅ Resultado: v1.2.1 criado automaticamente, deploy imediato

# 4. Sync de volta para develop
git checkout develop
git merge main
git push origin develop
```

---

## 📊 Monitoramento e Analytics

### **🔍 Como acompanhar releases:**

#### **No GitLab:**
```
📦 Repository → Tags
v1.2.1  🔥 Hotfix (2h ago)    
v1.2.0  ✨ Feature Release (1 day ago)
v1.1.5  🐛 Bug Fixes (1 week ago)

📊 Analytics → Repository  
- Frequency: 1 release per week
- Average time: develop → main = 3 days
- Success rate: 98%
```

#### **Na Aplicação:**
```tsx
// VersionDisplay mostra automaticamente
<Chip label="v1.2.1" /> // ← Atualiza automaticamente
```

#### **Logs do Pipeline:**
```
🚀 Pipeline #1234 - v1.2.0
├─ ✅ build (45s)
├─ ✅ test (1m 20s)  
├─ ✅ version (30s) → v1.1.5 → v1.2.0
└─ ✅ deploy (2m 15s)
```

---

## 💡 Dicas de Boas Práticas

### **✅ DO (Faça):**
- ✅ Use feat: para novas funcionalidades
- ✅ Use fix: para correções
- ✅ Seja específico na descrição do commit
- ✅ Teste antes de fazer merge para main
- ✅ Use develop para desenvolvimento contínuo
- ✅ Faça code review antes de merge

### **❌ DON'T (Não faça):**
- ❌ Commit direto na main (exceto hotfix)
- ❌ Commits vagos: "updates", "changes", "fixes"
- ❌ Merge sem testar
- ❌ Pular versionamento com [skip ci] sem motivo
- ❌ Misturar tipos de mudança em um commit

---

## 🎯 **Próximos Passos para Implementar:**

1. **🔧 Configure branches:** main, develop
2. **📝 Padronize commits:** use conventional commits
3. **⚙️ Configure CI:** pipeline diferente por branch
4. **🧪 Teste o fluxo:** feature → develop → main
5. **📊 Monitore:** versões e releases

**Quer que eu ajude a configurar alguma parte específica?** 🚀
