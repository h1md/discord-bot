# Discord Server Bot 🤖

Un **gros bot Discord de gestion de serveur** en Node.js (discord.js v14) avec **254 commandes slash** réparties en 10 catégories. Toutes les commandes sont fonctionnelles et la configuration est persistée par serveur dans un stockage JSON.

## 📊 Catégories & nombre de commandes

| Catégorie | Commandes | Exemples |
|-----------|-----------|----------|
| 🛡️ Anti-Raid | 61 | `/antispam-on`, `/antilink-on`, `/lockdown-on`, `/whitelist-add`, `/raidmode-on` |
| 👑 Owner Bot | 19 | `/owner-exec`, `/owner-shutdown`, `/owner-broadcast`, `/owner-setname` |
| 🏠 Gestion Serveur | 25 | `/salon-create`, `/role-create`, `/salon-nuke`, `/voice-move`, `/audit-log` |
| ⚙️ Configuration | 25 | `/langue-set`, `/xp-taux`, `/modrole-add`, `/ticket-categorie`, `/config-export` |
| 📋 Logs | 36 | `/log-mod-set`, `/log-message-set`, `/logs-recent`, `/logs-export`, `/log-test` |
| 🔧 Paramètres Mod | 30 | `/warn-limit-set`, `/filter-add`, `/auto-ban-warns-on`, `/caps-filter-on` |
| 🔨 Modération | 38 | `/tempban`, `/hackban`, `/quarantaine`, `/note-add`, `/case`, `/massban` |
| 📣 Admin | 8 | `/announce`, `/poll`, `/welcome`, `/autorole` |
| ℹ️ Info | 7 | `/ping`, `/serverinfo`, `/userinfo` |
| 🎮 Utilitaires | 5 | `/rank`, `/leaderboard`, `/help` |
| **Total** | **254** | |

## 🚀 Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer les variables d'environnement
cp .env.example .env
# puis remplis DISCORD_TOKEN, CLIENT_ID, GUILD_ID, OWNER_IDS

# 3. Déployer les commandes slash sur ton serveur de test (instantané)
npm run deploy

# 4. Lancer le bot
npm start
```

### Déploiement global (tous les serveurs, propagation jusqu'à 1h)

```bash
npm run deploy:global
```

### Supprimer toutes les commandes

```bash
npm run clear
```

## 🔑 Configuration du bot (Discord Developer Portal)

1. Va sur https://discord.com/developers/applications et crée une application.
2. Onglet **Bot** → *Reset Token* → copie-le dans `DISCORD_TOKEN`.
3. Active les **Privileged Gateway Intents** : `SERVER MEMBERS INTENT` et `MESSAGE CONTENT INTENT`.
4. Onglet **General Information** → copie l'*Application ID* dans `CLIENT_ID`.
5. Récupère l'ID de ton serveur de test (Mode développeur activé → clic droit sur le serveur → *Copier l'identifiant*) dans `GUILD_ID`.
6. Mets ton propre ID utilisateur dans `OWNER_IDS` (pour les commandes Owner Bot).
7. Invite le bot avec les permissions **Administrateur** (ou `applications.commands` + `bot`) :
   `https://discord.com/api/oauth2/authorize?client_id=CLIENT_ID&permissions=8&scope=bot%20applications.commands`

## 🧱 Architecture

```
src/
  index.js            # Client Discord + gestion des interactions
  deploy-commands.js  # Enregistrement des commandes slash (REST)
  config.js           # Chargement du .env
  lib/
    command.js        # Helper cmd() + handlers génériques réutilisables
    embeds.js         # Constructeurs d'embeds (succès, erreur, info...)
    store.js          # Stockage JSON persistant par serveur (data/guilds.json)
    loader.js         # Chargement/validation de toutes les commandes
  commands/
    01-antiraid.js    # Anti-Raid (61)
    02-owner.js       # Owner Bot (19)
    03-gestion.js     # Gestion Serveur (25)
    04-configuration.js
    05-logs.js
    06-params-mod.js
    07-moderation.js
    08-admin.js
    09-info.js
    10-utils.js
scripts/
  count-commands.js   # Vérifie le nombre de commandes par catégorie
data/                 # Config persistée par serveur (ignoré par git)
```

## 🧪 Vérifier le nombre de commandes

```bash
npm run count     # affiche le décompte par catégorie
npm test          # échoue si les compteurs ne correspondent pas
```

## 📝 Notes

- La configuration de chaque serveur est stockée dans `data/guilds.json` (créé automatiquement).
- Les permissions Discord sont appliquées par commande via `setDefaultMemberPermissions` (ex: `Ban Members` pour `/ban`).
- Les commandes **Owner Bot** ne sont utilisables que par les IDs listés dans `OWNER_IDS`.
- `/owner-exec` exécute du JavaScript arbitraire : réservé aux propriétaires, à utiliser avec prudence.

## ⚖️ Licence

MIT
