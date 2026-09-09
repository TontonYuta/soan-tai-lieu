#!/usr/bin/env bash
# Smart Test & Lint Runner
set -e

echo "=== [RUNNING AUTOMATED TEST SUITE] ==="

# 1. Node.js project
if [ -f "package.json" ]; then
    echo "→ Detected Node.js project"
    if npm run | grep -q " lint$"; then
        echo "→ Running linter..."
        npm run lint
    fi
    if npm run | grep -q " test$"; then
        echo "→ Running tests..."
        npm test
    fi
    echo "✓ Node.js tests completed successfully."
    exit 0
fi

# 2. Python project
if [ -f "pyproject.toml" ] || [ -f "setup.py" ] || [ -f "pytest.ini" ]; then
    echo "→ Detected Python project"
    if command -v pytest >/dev/null 2>&1; then
        pytest
    else
        python3 -m unittest discover
    fi
    echo "✓ Python tests completed successfully."
    exit 0
fi

# 3. Go project
if [ -f "go.mod" ]; then
    echo "→ Detected Go project"
    go test ./...
    echo "✓ Go tests completed successfully."
    exit 0
fi

# 4. Rust project
if [ -f "Cargo.toml" ]; then
    echo "→ Detected Rust project"
    cargo test
    echo "✓ Rust tests completed successfully."
    exit 0
fi

echo "! No recognized test suite found in $(pwd)"
