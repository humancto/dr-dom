# 1) Write your ignore rules (edit .gitignore if you prefer)
cat > .gitignore <<'EOF'
# Ignore all Markdown files
*.md

# But keep README.md (or READMS.md if that’s the one you want)
!README.md
!READMS.md

# Ignore Claude folder
.claude/

# macOS junk
.DS_Store
EOF

# 2) Unstage .md files and the .claude folder
git restore --staged '*.md'
git rm -r --cached .claude 2>/dev/null || true

# 3) Make sure your README stays staged
git add README.md
