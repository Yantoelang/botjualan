#!/data/data/com.termux/files/usr/bin/bash

# Auto Deploy Bot Script (Git Pull + Auto Run Node in Screen)
# by masYANTO Sat-Set Mode 💯

BOT_DIR=~/botyanto
SESSION_NAME=botyanto

clear
echo "[*] Deploying Bot Workflow Started..."

# Step 1: Go to bot directory
cd $BOT_DIR || { echo "[!] Directory $BOT_DIR not found!"; exit 1; }

# Step 2: Pull latest changes
echo "[*] Pulling latest changes from remote..."
git pull --rebase || { echo "[!] Git pull failed. Resolve manually."; exit 1; }

# Step 3: Kill old screen session if exists
if screen -list | grep -q "$SESSION_NAME"; then
    echo "[*] Killing old screen session: $SESSION_NAME"
    screen -S $SESSION_NAME -X quit
fi

# Step 4: Start new screen session with bot running
echo "[*] Starting new screen session: $SESSION_NAME"
screen -dmS $SESSION_NAME node index.js

# Final Status
echo "\n✅ Bot Deployed & Running in screen session: $SESSION_NAME"
screen -ls
