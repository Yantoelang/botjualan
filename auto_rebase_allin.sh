#!/data/data/com.termux/files/usr/bin/bash

# Auto Rebase All-In-One Workflow Script
# by masYANTO Sat-Set Mode 💯

clear
echo "[*] Starting Auto Rebase All-In Workflow..."

# Step 1: Fetch latest changes
echo "[*] Fetching origin..."
git fetch origin

# Step 2: Rebase current branch onto origin/master
echo "[*] Rebasing onto origin/master..."
git rebase origin/master || {
    echo "[!] Rebase conflict detected. Running Auto Conflict Resolver..."
    bash auto_conflict_resolver.sh
}

# Step 3: After rebase success, push to remote
echo "[*] Pushing to remote..."
git push --force-with-lease

# Final Status
echo "\n✅ Workflow Done. Current Status:"
git status
