# Documentation de déploiement — Trader Tracker

> **Statut :** cette documentation décrit la procédure de déploiement prévue pour l'application. À ce jour, l'application n'a pas encore été mise en ligne ; elle est destinée à faciliter une future mise en production.

## 1. Architecture générale

L'application est composée de deux parties indépendantes :

- **Back-end** : serveur Node.js/Express exposé sous forme d'API REST.
- **Front-end** : application en JavaScript natif (HTML, CSS, JS), ne nécessitant aucune étape de build.
- **Base de données** : serveur MySQL.

## 2. Préparation de l'environnement de production

### 2.1 Base de données

Le schéma de la base de données doit être créé à partir des requêtes SQL documentées (voir `DATABASE.md`). Les données de référence (types d'actifs, comptes de test) peuvent ensuite être insérées via les scripts présents dans `back/src/scripts` (voir également `SEEDERS.md`).

### 2.2 Back-end

Les dépendances du back-end s'installent via :

```bash
npm install
```

Le serveur peut ensuite être lancé avec :

```bash
npm start
```

En développement, le serveur redémarre automatiquement grâce à `nodemon`.

### 2.3 Front-end

Le front-end étant en JavaScript natif, aucune étape de build n'est nécessaire. Il peut être servi directement par le serveur Express ou déployé indépendamment sur n'importe quelle plateforme d'hébergement web statique.

## 3. Configuration

La configuration du back-end repose sur un fichier `.env`, qui **ne doit jamais être versionné**. Un modèle est fourni dans `.env.example`, contenant les variables suivantes :

| Variable | Description |
|---|---|
| `DB_HOST` | Hôte du serveur de base de données |
| `DB_USER` | Utilisateur de connexion à la base |
| `DB_PASSWORD` | Mot de passe de connexion à la base |
| `DB_DATABASE` | Nom de la base de données |
| `APP_PORT` | Port d'écoute de l'application |
| `JWT_SECRET` | Clé secrète de signature des jetons JWT |
| `POLY_API_KEY` | Clé d'accès à l'API externe de données financières (ex-Polygon.io) |

Le middleware CORS doit être configuré pour n'autoriser en production que l'origine du front-end.

## 4. Mise en ligne et exploitation (procédure prévue)

- Le **front-end** pourra être déployé sur n'importe quelle plateforme d'hébergement web, ou être directement servi par le serveur Express.
- Le **back-end** sera déployé sur un serveur ou une plateforme d'hébergement compatible Node.js. Les variables d'environnement de production devront être renseignées directement côté serveur (jamais dans le code source).
- En production, l'ensemble du trafic devra transiter en **HTTPS** afin de chiffrer les échanges entre le client et l'API, notamment lors de la transmission des identifiants et des jetons JWT.

## 5. Licences et conformité

Les dépendances utilisées dans ce projet sont distribuées sous licences open source :

| Dépendance | Licence |
|---|---|
| Express.js | MIT |
| bcrypt | MIT |
| jsonwebtoken | MIT |
| multer | MIT |
| mysql2 | MIT |
| dotenv | BSD-2-Clause |
| cors | MIT |
| express-rate-limit | MIT |
| nodemon | MIT |
| ApexCharts | MIT |

La librairie **Massive API** est soumise à sa propre licence commerciale.

Aucun actif protégé par le droit d'auteur (images, polices, sons) n'a été intégré sans vérification préalable de sa licence d'utilisation.