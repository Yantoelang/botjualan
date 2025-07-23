#!/data/data/com.termux/files/usr/bin/bash

echo "[*] Cleaning zombie screen..."

SOCKET_PATH="/data/data/com.termux/files/usr/tmp/screens"

if [ -d "$SOCKET_PATH" ]; then
    rm -rf "$SOCKET_PATH"
    echo "[+] Socket folder removed."
else
    echo "[-] Socket folder not found."
fi

mkdir -p "$SOCKET_PATH/S-$(whoami)"
echo "[+] Socket folder recreated."

screen -wipe
echo "[✓] screen -wipe done."

echo "[✓] Check:"
screen -ls

