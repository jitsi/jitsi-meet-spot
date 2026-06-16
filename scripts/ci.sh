#!/bin/bash
set -e

# Full local CI sweep for the monorepo, mirroring the GitHub Actions `CI` workflow.
# Run from the repository root.

echo "Installing workspaces (root)"
npm ci

if [ -z "$SKIP_BASIC_TESTS" ]; then
    echo "Linting (all workspaces)"
    npm run lint

    echo "Typechecking (all workspaces)"
    npm run typecheck

    echo "Unit tests (all workspaces)"
    npm run test

    echo "Building (all workspaces)"
    npm run build
fi

if [ -z "$ENABLE_WEBDRIVER" ]; then
    echo "ENABLE_WEBDRIVER not set; skipping spot-webdriver E2E tests."
else
    # `npm run ci` in spot-webdriver boots the spot-client dev server, waits for
    # it to respond, runs the WebdriverIO suite, then tears the server down.
    echo "Running spot-webdriver E2E tests (open-source mode)"
    npm --prefix spot-webdriver run ci

    # `npm run ci:backend` additionally boots the spot-admin mock backend and
    # points spot-client at it, running the suite in backend mode so the
    # backend-only specs execute instead of pending.
    echo "Running spot-webdriver E2E tests (backend mode)"
    npm --prefix spot-webdriver run ci:backend
fi
