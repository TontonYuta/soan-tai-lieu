#!/usr/bin/env bash
# Workspace Health Check for Smart Vibecoding
set -e

echo "=== [SMART VIBECODING HEALTH CHECK] ==="
echo "Date: $(date)"
echo "Current Directory: $(pwd)"

# 1. Check Git status
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "✓ Git repository detected."
    BRANCH=$(git rev-parse --abbrev-ref HEAD)
    echo "  Current branch: $BRANCH"
    MODIFIED=$(git status --porcelain | wc -l)
    echo "  Modified/Untracked files: $MODIFIED"
else
    echo "! Not inside a git repository."
fi

# 2. Check Node.js / Python / Go / Rust environments
echo "--- Runtime Environments ---"
command -v node >/dev/null 2>&1 && echo "✓ Node: $(node --version)" || echo "- Node: not installed"
command -v npm >/dev/null 2>&1 && echo "✓ npm: $(npm --version)" || echo "- npm: not installed"
command -v python3 >/dev/null 2>&1 && echo "✓ Python: $(python3 --version 2>&1)" || echo "- Python: not installed"
command -v go >/dev/null 2>&1 && echo "✓ Go: $(go version 2>&1)" || echo "- Go: not installed"
command -v cargo >/dev/null 2>&1 && echo "✓ Rust/Cargo: $(cargo --version 2>&1)" || echo "- Rust: not installed"
command -v pdflatex >/dev/null 2>&1 && echo "✓ LaTeX (pdflatex): $(pdflatex --version | head -n 1)" || echo "- LaTeX: not installed"

# 3. Check Package Managers & Test Scripts
echo "--- Project Configuration ---"
if [ -f "package.json" ]; then
    echo "✓ Detected Node.js project (package.json)"
    node -e '
        const p = require("./package.json");
        console.log("  Name:", p.name || "N/A");
        console.log("  Version:", p.version || "N/A");
        console.log("  Scripts:", Object.keys(p.scripts || {}).join(", "));
    ' 2>/dev/null || true
fi

if [ -f "pyproject.toml" ] || [ -f "requirements.txt" ]; then
    echo "✓ Detected Python project"
fi

if [ -f "Cargo.toml" ]; then
    echo "✓ Detected Rust project"
fi

if [ -f "go.mod" ]; then
    echo "✓ Detected Go project"
fi

echo "=== [HEALTH CHECK COMPLETED] ==="
