# Worker `vidiverify-com-en`

Reverse-Proxy: `vidiverify.com/*` holt die Seite von `vidiverify.de` und liefert
sie unter .com aus (Route `vidiverify.com/*` im Cloudflare-Dashboard). Die App
schaltet am Hostnamen auf Englisch.

| Stand | Änderung |
|---|---|
| 17.05.2026 | im Dashboard angelegt |
| 30.09.2026 | `Location` von vidiverify.de auf vidiverify.com umschreiben (`/agb` ohne Schrägstrich landete auf .de, also deutsch); Code ab hier in diesem Ordner |

## Ausrollen

Nur den Code hochladen, nicht `wrangler deploy`: Das setzt Routen,
`workers.dev` und Protokollierung nach einer `wrangler.toml`, die es hier
bewusst nicht gibt. Die API-Stelle `…/content` tauscht allein das Skript.

```bash
TOK=$(grep -m1 '^oauth_token' "$APPDATA/xdg.config/.wrangler/config/default.toml" | cut -d'"' -f2)
curl -s -X PUT -H "Authorization: Bearer $TOK" \
  "https://api.cloudflare.com/client/v4/accounts/84a9489af315b9f10f986f4578d4018f/workers/scripts/vidiverify-com-en/content" \
  -F 'metadata={"main_module":"worker.js"};type=application/json' \
  -F "worker.js=@worker.js;type=application/javascript+module"
```

Der Token stammt aus `npx wrangler login` (Rechte `workers_scripts (write)`).
Abgelaufen: `npx wrangler login` erneut. Neuer Stand erreicht nicht alle
Cloudflare-Knoten sofort; eine halbe Minute lang kann eine Anfrage noch den
alten Code treffen.

## Prüfen

```bash
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' --max-redirs 0 https://vidiverify.com/agb
# erwartet: 301 https://vidiverify.com/agb/
```
