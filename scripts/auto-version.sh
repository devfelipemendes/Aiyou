#!/bin/bash
# scripts/auto-version.sh

set -e

echo "️  Iniciando versionamento automático..."

# Verificar se estamos na main/master
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "main" ] && [ "$BRANCH" != "master" ]; then
    echo "⚠️ Versionamento só roda na branch main/master (atual: $BRANCH)"
    exit 0
fi

# Analisar commits para determinar tipo de bump
echo " Analisando commits..."

# Pegar commits desde última tag ou últimos 10 se não houver tag
if git describe --tags --abbrev=0 >/dev/null 2>&1; then
    LAST_TAG=$(git describe --tags --abbrev=0)
    COMMITS=$(git log $LAST_TAG..HEAD --oneline)
    echo " Commits desde $LAST_TAG:"
else
    COMMITS=$(git log --oneline -10)
    echo " Últimos commits (primeira versão):"
fi

echo "$COMMITS"

# Determinar tipo de bump
if echo "$COMMITS" | grep -q "BREAKING CHANGE\|feat!\|fix!\|refactor!"; then
    BUMP_TYPE="major"
    echo " BREAKING CHANGE detectado → MAJOR bump"
elif echo "$COMMITS" | grep -q "^feat\|^feat("; then
    BUMP_TYPE="minor"  
    echo "✨ Feature detectada → MINOR bump"
elif echo "$COMMITS" | grep -q "^fix\|^fix("; then
    BUMP_TYPE="patch"
    echo " Fix detectado → PATCH bump"
else
    echo "Nenhuma mudança que requeira versionamento"
    echo " Use commits: feat:, fix:, ou BREAKING CHANGE"
    exit 0
fi

# Fazer bump da versão
echo " Executando $BUMP_TYPE bump..."

# Verificar se npm version funciona
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado"
    exit 1
fi

# Fazer o bump sem git tag (vamos criar manual)
NEW_VERSION=$(npm version $BUMP_TYPE --no-git-tag-version)

echo " Nova versão: $NEW_VERSION"

# Criar version.json com informações completas
cat > version.json << EOF
{
  "version": "$NEW_VERSION",
  "buildDate": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "commit": "${CI_COMMIT_SHA:-$(git rev-parse HEAD)}",
  "releaseType": "auto",
  "pipeline": "${CI_PIPELINE_ID:-local}",
  "branch": "$BRANCH"
}
EOF

# Atualizar VERSION file também
echo "$NEW_VERSION" > VERSION

# Copiar para public (Next.js/React)
if [ -d "public" ]; then
    cp version.json public/
    echo "version.json copiado para public/"
fi

echo "✅ Arquivos de versão atualizados!"

# Verificar se deve fazer commit e tag
if [ "${CI:-false}" = "true" ]; then
    echo "Ambiente CI detectado - configurando git..."
    
    # Configurar git no CI
    git config --global user.name "GitLab CI"
    git config --global user.email "gitlab-ci@${CI_SERVER_HOST:-example.com}"
    
    # Configurar remote com token se disponível
    if [ -n "${CI_PUSH_TOKEN:-}" ]; then
        git remote set-url origin "https://gitlab-ci-token:${CI_PUSH_TOKEN}@${CI_SERVER_HOST}/${CI_PROJECT_PATH}.git"
    fi
    
    # Commit da versão
    git add package.json version.json VERSION public/version.json 2>/dev/null || git add package.json version.json VERSION
    git commit -m "chore: bump version to $NEW_VERSION [skip ci]"
    
    # Criar tag
    git tag -a "$NEW_VERSION" -m " Release $NEW_VERSION

Automated release from $BRANCH branch

 Build Info:
- Pipeline: ${CI_PIPELINE_ID:-N/A}  
- Commit: ${CI_COMMIT_SHA:-$(git rev-parse HEAD)}
- Date: $(date -u +%Y-%m-%dT%H:%M:%SZ)
- Type: $BUMP_TYPE
"
    
    # Push se token disponível
    if [ -n "${CI_PUSH_TOKEN:-}" ]; then
        echo " Fazendo push da nova versão..."
        git push origin HEAD:$BRANCH
        git push origin "$NEW_VERSION"
        echo "✅ Versão $NEW_VERSION criada no repositório!"
    else
        echo "⚠️ CI_PUSH_TOKEN não configurado - tag criada apenas localmente"
    fi
fi

echo " Versionamento concluído!"
echo " Nova versão: $NEW_VERSION"
echo " Arquivos atualizados: package.json, version.json, VERSION"
