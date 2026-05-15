<div align="center">

<img src="https://github.com/AlouKadafi/dit-bibliotheque/blob/main/docs/Images/LogoDIT.png" width="120"/>

# Bibliothèque Numérique DIT

### Plateforme de gestion de bibliothèque intelligente — Master 2 IA · DIT Sénégal

[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python_3.11-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![DVC](https://img.shields.io/badge/DVC-Pipeline_ML-945DD6?style=flat-square&logo=dvc&logoColor=white)](https://dvc.org/)
[![Jenkins](https://img.shields.io/badge/Jenkins-CI%2FCD-D24939?style=flat-square&logo=jenkins&logoColor=white)](https://www.jenkins.io/)
[![License](https://img.shields.io/badge/Licence-MIT-green?style=flat-square)](LICENSE)

</div>

---

## Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Architecture microservices](#architecture-microservices)
- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Installation et lancement avec Docker Compose](#installation-et-lancement-avec-docker-compose)
- [Initialisation de la base de données](#initialisation-de-la-base-de-données)
- [Entraînement et reproduction du modèle avec DVC](#entraînement-et-reproduction-du-modèle-avec-dvc)
- [Tests des endpoints](#tests-des-endpoints)
- [Services et ports](#services-et-ports)
- [API Reference](#api-reference)
- [Comptes de démonstration](#comptes-de-démonstration)
- [Règles métier](#règles-métier)
- [CI/CD avec Jenkins](#cicd-avec-jenkins)
- [Structure du projet](#structure-du-projet)
- [Schéma de base de données](#schéma-de-base-de-données)
- [Équipe](#équipe)

---

## Vue d'ensemble

La **Bibliothèque Numérique DIT** est une plateforme complète de gestion de bibliothèque universitaire construite sur une architecture **microservices**. Elle offre :

- Catalogue de **150+ livres** techniques (IA, Data Science, DevOps, etc.)
- Gestion des **utilisateurs** avec authentification JWT
- Système d'**emprunts** avec calcul automatique des pénalités
- **Recommandations personnalisées** par algorithme SVD (Machine Learning)
- **Tableau de bord** gestionnaire avec KPIs en temps réel
- **Pipeline ML** versionné avec DVC
- **CI/CD** automatisé avec Jenkins

---

## Architecture microservices

```
┌────────────────────────────────────────────────────────────────────┐
│                        NAVIGATEUR CLIENT                           │
│         http://localhost:8080  (dashboard vanilla JS/HTML)         │
└──────────────────────────┬─────────────────────────────────────────┘
                           │ HTTP / REST
                           ▼
┌────────────────────────────────────────────────────────────────────┐
│                    API GATEWAY (port 3000)                         │
└──────┬─────────────┬──────────────┬──────────────┬────────────────┘
       │             │              │              │
       ▼             ▼              ▼              ▼
  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐
  │ service │  │ service  │  │ service  │  │   service    │
  │ livres  │  │utilisat. │  │emprunts  │  │recommandation│
  │  :3001  │  │  :3002   │  │  :3003   │  │    :3004     │
  │ Node.js │  │ Node.js  │  │ Node.js  │  │   FastAPI    │
  └────┬────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘
       │             │              │               │
       └─────────────┴──────────────┴───────────────┘
                              │
                              ▼
            ┌─────────────────────────────────┐
            │        PostgreSQL 17            │
            │   Container : dit_bibliotheque_db│
            │         Port 5432               │
            │  • utilisateurs  • livres       │
            │  • emprunts      • notes        │
            └─────────────────────────────────┘
```

---

## Fonctionnalités

### Gestion des utilisateurs
| Fonctionnalité | Description |
|---|---|
| Inscription / Connexion | Authentification JWT sécurisée (24h) |
| Rôles | `etudiant`, `professeur`, `personnel` (gestionnaire) |
| Identifiant court | `model_id` auto-généré (u001, u002…) |
| Recherche | Par initiaux (MD), identifiant (u012), nom ou email |

### Catalogue de livres
| Fonctionnalité | Description |
|---|---|
| Recherche | Par titre, auteur, ISBN ou catégorie/domaine |
| Catégories | IA, Data Science, DevOps, Robotique, NLP, etc. |
| Stock | Suivi en temps réel des exemplaires disponibles |
| Admin | Ajout, suppression de livres (gestionnaire) |

### Gestion des emprunts
| Fonctionnalité | Description |
|---|---|
| Durée | **30 jours** maximum par emprunt |
| Limite | **3 emprunts simultanés** maximum par utilisateur |
| Retard | Détection automatique au-delà de 30 jours |
| Pénalités | **500 FCFA / jour** de retard |
| Validation | Emprunt **et** retour exclusivement par le gestionnaire |

### Recommandations personnalisées
| Scénario | Comportement |
|---|---|
| Utilisateur dans le modèle SVD | Filtrage collaboratif (scikit-surprise) |
| ≥ 5 emprunts, hors modèle | Fallback : livres populaires dans vos catégories préférées |
| < 5 emprunts | Message de progression avec barre d'avancement |

### Tableau de bord gestionnaire
- KPIs temps réel : livres disponibles, emprunts en cours, retards, pénalités FCFA
- Liste des retards avec validation de retour en un clic
- Emprunts récents avec historique
- Panneau latéral : emprunts de chaque utilisateur sans quitter la page
- Barre de statistiques avec détection automatique des retards

---

## Stack technique

### Backend
| Service | Technologie | Rôle |
|---|---|---|
| `books-service` | Node.js 20 · Express · PostgreSQL | CRUD livres |
| `users-service` | Node.js 20 · Express · JWT · bcrypt | Auth & utilisateurs |
| `loans-service` | Node.js 20 · Express · PostgreSQL | Emprunts & pénalités |
| `recommendation-service` | Python 3.11 · FastAPI · scikit-surprise | SVD + fallback ML |
| `api-gateway` | Node.js 20 · Express | Routage inter-services |

### Frontend
| Élément | Technologie |
|---|---|
| Dashboard | HTML5 / CSS3 / JavaScript (vanilla) |
| Serveur | nginx:alpine |
| Design | DM Mono · Playfair Display · dark theme |

### Infrastructure
| Outil | Usage |
|---|---|
| Docker Compose | Orchestration des 7 conteneurs (profils `dev` / `prod`) |
| PostgreSQL 17 | Base de données relationnelle |
| DVC | Versionnage des données et modèles ML |
| Jenkins | Pipeline CI/CD automatisé |
| JWT | Authentification inter-services |

---

## Installation et lancement avec Docker Compose

### Prérequis

```bash
docker --version          # >= 20.x
docker compose version    # >= 2.x  (plugin intégré)
git --version
```

### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd dit-bibliotheque
```

### 2. Comprendre les profils Docker Compose

Le fichier `docker-compose.yml` utilise des **profils** pour séparer les environnements :

| Profil | Services inclus | Usage |
|--------|-----------------|-------|
| `dev`  | postgres, pgadmin, api-gateway, books-service, users-service, loans-service, recommendation-service | Développement local |
| `prod` | postgres, api-gateway, books-service, users-service, loans-service, recommendation-service, frontend | Production |

> pgAdmin (`:8081`) n'est disponible qu'en profil `dev`.  
> Le frontend nginx (`:8080`) n'est disponible qu'en profil `prod`.

### 3. Lancer en mode développement

```bash
# Premier lancement — construit et démarre tous les services dev
docker compose --profile dev up --build -d

# Vérifier l'état de tous les conteneurs
docker compose --profile dev ps

# Suivre les logs en temps réel
docker compose --profile dev logs -f

# Suivre les logs d'un seul service
docker compose --profile dev logs -f loans-service
```

### 4. Lancer en mode production (avec frontend nginx)

```bash
# Démarre tous les services + frontend
docker compose --profile prod up --build -d

# Vérifier l'état
docker compose --profile prod ps
```

### 5. Accéder à l'application

| Interface | URL | Disponible en |
|---|---|---|
| Dashboard Bibliothèque | http://localhost:8080 | `prod` |
| pgAdmin | http://localhost:8081 | `dev` |
| API Gateway | http://localhost:3000 | `dev` + `prod` |
| API Livres | http://localhost:3001 | `dev` + `prod` |
| API Utilisateurs | http://localhost:3002 | `dev` + `prod` |
| API Emprunts | http://localhost:3003 | `dev` + `prod` |
| API Recommandation | http://localhost:3004 | `dev` + `prod` |

### 6. Arrêter les services

```bash
# Arrêter sans supprimer les données
docker compose --profile dev down

# Arrêter ET supprimer tous les volumes (données perdues)
docker compose --profile dev down -v
```

---

## Initialisation de la base de données

### Initialisation automatique au premier démarrage

La base de données est **initialisée automatiquement** au premier démarrage via le fichier `database/init.sql`, monté dans PostgreSQL :

```yaml
volumes:
  - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
```

Ce script crée :
- Les tables (`utilisateurs`, `livres`, `emprunts`, `notes`)
- Les index et contraintes
- Les **150 livres** du catalogue
- Les **comptes de démonstration** (gestionnaire + étudiants + professeurs)

> **Important :** `init.sql` n'est exécuté **qu'une seule fois**, lors de la création initiale du volume. Si le volume existe déjà, le script est ignoré.

### Paramètres de connexion

```
Host     : localhost
Port     : 5432
Database : dit_bibliotheque
User     : dit_user
Password : dit_password
```

Connexion depuis la machine hôte :

```bash
psql -h localhost -p 5432 -U dit_user -d dit_bibliotheque
```

Via pgAdmin (profil `dev`) :
- URL : http://localhost:8081
- Email : `admin@gmail.com` / Mot de passe : `admin1234`
- Ajouter le serveur : host `postgres`, port `5432`, user `dit_user`

### Réinitialiser complètement la base de données

```bash
# 1. Arrêter et supprimer le volume PostgreSQL
docker compose --profile dev down -v

# 2. Redémarrer (init.sql sera rejoué)
docker compose --profile dev up --build -d

# 3. Vérifier que la DB est saine
docker exec dit_bibliotheque_db pg_isready -U dit_user -d dit_bibliotheque
```

### Injecter des données fraîches manuellement

```bash
# Exécuter un script SQL dans le conteneur
docker exec -i dit_bibliotheque_db \
  psql -U dit_user -d dit_bibliotheque < database/init.sql

# Inspecter les tables depuis le conteneur
docker exec -it dit_bibliotheque_db \
  psql -U dit_user -d dit_bibliotheque -c "\dt"

# Compter les lignes par table
docker exec dit_bibliotheque_db \
  psql -U dit_user -d dit_bibliotheque \
  -c "SELECT 'utilisateurs', COUNT(*) FROM utilisateurs
      UNION ALL SELECT 'livres', COUNT(*) FROM livres
      UNION ALL SELECT 'emprunts', COUNT(*) FROM emprunts;"
```

---

## Entraînement et reproduction du modèle avec DVC

### Prérequis Python

```bash
# Créer un environnement virtuel (ou utiliser conda)
python -m venv .venv
source .venv/bin/activate          # Linux / macOS
.venv\Scripts\activate             # Windows

# Installer les dépendances ML
pip install dvc scikit-surprise pandas joblib
```

### Pipeline DVC

Le pipeline est défini dans `dvc.yaml` et comprend 3 étapes séquentielles :

```
loans.csv (données brutes)
    │
    ▼  [preprocess]
loans_clean.csv (données nettoyées)
    │
    ▼  [train]   ← hyperparamètres depuis params.yaml
model.pkl (modèle SVD entraîné)
    │
    ▼  [evaluate]
metrics/metrics.json (RMSE, MAE)
```

| Étape | Commande | Entrée | Sortie |
|---|---|---|---|
| `preprocess` | `python dvc-pipeline/preprocess.py` | `dvc-pipeline/data/loans.csv` | `dvc-pipeline/data/loans_clean.csv` |
| `train` | `python dvc-pipeline/train.py` | `loans_clean.csv` + `params.yaml` | `dvc-pipeline/models/model.pkl` |
| `evaluate` | `python dvc-pipeline/evaluate.py` | `model.pkl` + `loans_clean.csv` | `metrics/metrics.json` |

### Étape 0 — Exporter les données depuis l'API

Avant de lancer `dvc repro`, récupérez les données d'emprunts actuelles :

```bash
# Exporter l'historique des emprunts au format CSV
curl http://localhost:3003/api/emprunts/export/csv \
  -o dvc-pipeline/data/loans.csv

# Vérifier le fichier exporté
head -5 dvc-pipeline/data/loans.csv
# → user_id,book_id,categorie,statut,date_emprunt,date_retour_effective,rating
```

### Étape 1 — Reproduire le pipeline complet

```bash
# Reproduire toutes les étapes (only reruns what changed)
dvc repro

# Forcer la réexécution complète même si rien n'a changé
dvc repro --force
```

### Étape 2 — Consulter les métriques

```bash
# Afficher les métriques du dernier entraînement
dvc metrics show

# Comparer avec une version précédente (tag ou commit)
dvc metrics diff HEAD~1

# Exemple de sortie :
# Path                   Metric    Old    New    Change
# metrics/metrics.json   rmse      1.42   1.38   -0.04
# metrics/metrics.json   mae       1.31   1.27   -0.04
```

### Étape 3 — Modifier les hyperparamètres

Éditez `dvc-pipeline/params.yaml` :

```yaml
train:
  n_factors: 50      # Dimensions latentes (défaut : 50)
  n_epochs:  20      # Itérations d'entraînement (défaut : 20)
  lr_all:    0.005   # Taux d'apprentissage (défaut : 0.005)
  reg_all:   0.02    # Régularisation L2 (défaut : 0.02)
```

Puis relancez :

```bash
dvc repro          # détecte le changement de params et ré-entraîne
dvc metrics show   # compare les nouvelles métriques
```

### Étape 4 — Charger le nouveau modèle dans le service

```bash
# Copier le modèle dans le volume du service de recommandation
docker cp dvc-pipeline/models/model.pkl recommendation_service:/app/models/model.pkl

# Recharger le modèle via l'API (sans redémarrer le conteneur)
curl -X POST http://localhost:3004/api/train \
  -H "Content-Type: application/json" \
  -d '{"n_factors": 50, "n_epochs": 20}'

# Vérifier que le modèle est chargé
curl http://localhost:3004/api/model/info
```

### Versionnage des artefacts

```bash
# Vérifier l'état du pipeline
dvc status

# Ajouter le modèle au cache DVC
dvc add dvc-pipeline/models/model.pkl

# Pousser les artefacts vers le remote DVC (si configuré)
dvc push

# Récupérer les artefacts depuis le remote
dvc pull
```

---

## Tests des endpoints

Les tests ci-dessous utilisent `curl`. Adaptez `TOKEN` à votre environnement.

### Health checks — tous les services

```bash
curl http://localhost:3001/health   # livres
curl http://localhost:3002/health   # utilisateurs
curl http://localhost:3003/health   # emprunts
curl http://localhost:3004/health   # recommandation
```

Réponse attendue pour chaque :
```json
{ "status": "ok", "service": "<nom>" }
```

### Authentification

```bash
# Connexion gestionnaire → récupérer le token
TOKEN=$(curl -s -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dit.sn","mot_de_passe":"admin2026"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

echo "Token OK : ${TOKEN:0:40}…"

# Connexion étudiant
TOKEN_ETU=$(curl -s -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"mamadou1@dit.sn","mot_de_passe":"dit2026"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
```

### Service Livres (port 3001)

```bash
# Lister les livres (paginé)
curl "http://localhost:3001/api/livres?page=1&limit=5"

# Rechercher par titre
curl "http://localhost:3001/api/livres?page=1&limit=10&search=python"

# Livres disponibles uniquement
curl "http://localhost:3001/api/livres/disponibles"

# Détail d'un livre (remplacer <id> par un UUID réel)
curl "http://localhost:3001/api/livres/<id>"

# Ajouter un livre (gestionnaire)
curl -X POST http://localhost:3001/api/livres \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "titre": "Docker en pratique",
    "auteur": "Ian Miell",
    "isbn": "978-1617294808",
    "categorie": "DevOps",
    "nombre_exemplaires": 3
  }'

# Supprimer un livre (gestionnaire)
curl -X DELETE http://localhost:3001/api/livres/<id> \
  -H "Authorization: Bearer $TOKEN"
```

### Service Utilisateurs (port 3002)

```bash
# Inscrire un nouvel utilisateur
curl -X POST http://localhost:3002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Diallo",
    "prenom": "Mamadou",
    "email": "nouveau@dit.sn",
    "mot_de_passe": "password123",
    "type_utilisateur": "etudiant"
  }'

# Profil de l'utilisateur connecté
curl http://localhost:3002/api/utilisateurs/me \
  -H "Authorization: Bearer $TOKEN_ETU"

# Liste de tous les utilisateurs (gestionnaire)
curl "http://localhost:3002/api/utilisateurs?page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"

# Rechercher par type
curl "http://localhost:3002/api/utilisateurs?type=etudiant" \
  -H "Authorization: Bearer $TOKEN"

# Statistiques par type (public)
curl http://localhost:3002/api/utilisateurs/stats
```

### Service Emprunts (port 3003)

```bash
# Statistiques globales (public)
curl http://localhost:3003/api/emprunts/stats

# Emprunts en cours
curl "http://localhost:3003/api/emprunts?statut=en_cours&limit=10"

# Emprunts en retard avec pénalités
curl http://localhost:3003/api/emprunts/penalites

# Historique d'un utilisateur
curl http://localhost:3003/api/emprunts/utilisateur/<user_id>

# Créer un emprunt (gestionnaire)
curl -X POST http://localhost:3003/api/emprunts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "utilisateur_id": "<uuid-utilisateur>",
    "livre_id": "<uuid-livre>"
  }'

# Valider un retour (gestionnaire)
curl -X PATCH http://localhost:3003/api/emprunts/<id>/retourner \
  -H "Authorization: Bearer $TOKEN"

# Détecter et mettre à jour les retards (gestionnaire)
curl -X POST http://localhost:3003/api/emprunts/detecter-retards \
  -H "Authorization: Bearer $TOKEN"

# Exporter les données pour DVC
curl http://localhost:3003/api/emprunts/export/csv \
  -o dvc-pipeline/data/loans.csv
```

### Service Recommandation (port 3004)

```bash
# Recommandations par UUID utilisateur
curl "http://localhost:3004/api/recommendations/<user_uuid>?top_k=10"

# Recommandations par model_id (u001, u002…)
curl "http://localhost:3004/api/recommendations/u001?top_k=5"

# Infos sur le modèle chargé
curl http://localhost:3004/api/model/info

# Ré-entraîner le modèle SVD (nécessite loans_clean.csv)
curl -X POST http://localhost:3004/api/train \
  -H "Content-Type: application/json" \
  -d '{
    "n_factors": 50,
    "n_epochs": 20,
    "lr_all": 0.005,
    "reg_all": 0.02
  }'
```

### Codes de retour attendus

| Code | Signification |
|------|---------------|
| 200 | Succès |
| 201 | Ressource créée |
| 204 | Supprimé (sans body) |
| 400 | Données invalides ou manquantes |
| 401 | Token manquant ou invalide |
| 403 | Droits insuffisants (non-gestionnaire) |
| 404 | Ressource introuvable |
| 409 | Conflit (doublon ISBN, limite emprunts…) |
| 503 | Modèle ML non chargé |

### Test de sécurité des routes protégées

```bash
# POST sans token → 401
curl -s -o /dev/null -w "%{http_code}" \
  -X POST http://localhost:3003/api/emprunts \
  -H "Content-Type: application/json" \
  -d '{"utilisateur_id":"x","livre_id":"y"}'
# → 401

# PATCH sans token → 401
curl -s -o /dev/null -w "%{http_code}" \
  -X PATCH http://localhost:3003/api/emprunts/fake-id/retourner
# → 401

# GET stats (public) → 200
curl -s -o /dev/null -w "%{http_code}" \
  http://localhost:3003/api/emprunts/stats
# → 200
```

---

## Services et ports

```
localhost:3000  →  API Gateway          (Node.js / Express)
localhost:3001  →  Service Livres       (Node.js / Express)
localhost:3002  →  Service Utilisateurs (Node.js / Express + JWT)
localhost:3003  →  Service Emprunts     (Node.js / Express)
localhost:3004  →  Service Recommandation (FastAPI / Python)
localhost:5432  →  PostgreSQL 17
localhost:8080  →  Frontend HTML/nginx  (profil prod)
localhost:8081  →  pgAdmin              (profil dev)
```

---

## API Reference

### Livres — `localhost:3001`

```
GET    /api/livres                    Liste paginée
GET    /api/livres/disponibles        Livres avec stock > 0
GET    /api/livres/:id                Détail d'un livre
POST   /api/livres                    Créer (Admin)
PUT    /api/livres/:id                Modifier (Admin)
DELETE /api/livres/:id                Supprimer (Admin)
GET    /api/admin/livres/stats        Statistiques catalogue (Admin)
POST   /api/admin/livres/bulk         Import en masse (Admin)
```

### Utilisateurs — `localhost:3002`

```
POST   /api/auth/register             Inscription (public)
POST   /api/auth/login                Connexion → token JWT (public)
GET    /api/utilisateurs/stats        Répartition par type (public)
GET    /api/utilisateurs/me           Profil connecté (JWT)
GET    /api/utilisateurs              Liste paginée (JWT)
GET    /api/utilisateurs/:id          Détail (JWT)
PUT    /api/utilisateurs/:id          Modifier (JWT)
PATCH  /api/utilisateurs/:id/toggle   Activer/désactiver (JWT)
DELETE /api/utilisateurs/:id          Supprimer (JWT)
PATCH  /api/admin/utilisateurs/:id/reset-password  (Admin)
```

### Emprunts — `localhost:3003`

```
GET    /api/emprunts                  Liste paginée (public)
GET    /api/emprunts/stats            Statistiques globales (public)
GET    /api/emprunts/penalites        Retards + pénalités (public)
GET    /api/emprunts/export/csv       Export CSV pour DVC (public)
GET    /api/emprunts/utilisateur/:id  Historique utilisateur (public)
GET    /api/emprunts/:id              Détail emprunt (public)
POST   /api/emprunts                  Créer emprunt (Admin)
PATCH  /api/emprunts/:id/retourner    Valider retour (Admin)
POST   /api/emprunts/detecter-retards Mise à jour statuts (Admin)
GET    /api/admin/dashboard           Tableau de bord complet (Admin)
PATCH  /api/admin/emprunts/:id/forcer-retour  (Admin)
PATCH  /api/admin/emprunts/:id/prolonger      (Admin)
```

### Recommandation — `localhost:3004`

```
GET    /api/recommendations/:user_id  Recommandations (public)
POST   /api/train                     Ré-entraîner SVD (public)
GET    /api/model/info                Infos modèle (public)
```

---

## Comptes de démonstration

| Rôle | Email | Mot de passe |
|---|---|---|
| Gestionnaire (Admin) | `admin@dit.sn` | `admin2026` |
| Étudiant | `mamadou1@dit.sn` | `dit2026` |
| Étudiant | `fatou2@dit.sn` | `dit2026` |
| Professeur | `ibrahima3@dit.sn` | `dit2026` |
| Personnel | `aminata4@dit.sn` | `dit2026` |

> Mot de passe par défaut de tous les comptes seed : `dit2026`

---

## Règles métier

```
DURÉE D'EMPRUNT
  └── 30 jours à partir de la date d'emprunt
      (configurable via DUREE_EMPRUNT_JOURS dans .env)

LIMITE D'EMPRUNTS SIMULTANÉS
  └── 3 emprunts actifs maximum par utilisateur
  └── Erreur 409 si dépassement

RETARD
  └── Statut passe de en_cours → en_retard automatiquement
  └── Déclenchement : POST /api/emprunts/detecter-retards
      (appelé automatiquement à chaque chargement du dashboard)

CALCUL DES PÉNALITÉS
  └── Pénalité = Jours de retard × 500 FCFA
      Exemple : 5 jours → 2 500 FCFA

VALIDATION DES EMPRUNTS ET RETOURS
  └── Créer un emprunt : gestionnaire uniquement (JWT type=personnel)
  └── Valider un retour : gestionnaire uniquement (JWT type=personnel)
  └── Les requêtes sans token sur ces routes → 401
  └── Les requêtes avec token non-gestionnaire → 403

RECOMMANDATIONS
  └── SVD (filtrage collaboratif) si utilisateur connu du modèle
  └── Fallback catégoriel si ≥ 5 emprunts et hors modèle
  └── Refus explicite si < 5 emprunts (barre de progression)
```

---

## CI/CD avec Jenkins

Le fichier `Jenkinsfile` à la racine définit le pipeline d'intégration continue :

```groovy
Pipeline Jenkins :
  1. Checkout       → Récupère le code depuis Git
  2. Build          → docker compose --profile prod build
  3. Test           → Health checks sur les 4 services
  4. DVC Pipeline   → dvc repro (prétraitement + entraînement + évaluation)
  5. Deploy         → docker compose --profile prod up -d
  6. Notify         → Notification de succès/échec
```

---

## Structure du projet

```
dit-bibliotheque/
│
├── database/
│   └── init.sql                         ← Schéma + données seed (150 livres)
│
├── backend/
│   ├── api-gateway/                     ← Routage inter-services (Node.js)
│   ├── books-service/                   ← Microservice Livres (Node.js)
│   │   ├── Dockerfile
│   │   └── src/
│   │       ├── controllers/book.controller.js
│   │       ├── models/book.model.js
│   │       └── routes/book.routes.js
│   ├── users-service/                   ← Microservice Auth/Utilisateurs
│   │   ├── Dockerfile
│   │   └── src/
│   │       ├── controllers/auth.controller.js
│   │       ├── models/user.model.js
│   │       └── routes/
│   ├── loans-service/                   ← Microservice Emprunts
│   │   ├── Dockerfile
│   │   └── src/
│   │       ├── controllers/loan.controller.js
│   │       ├── middleware/admin.middleware.js
│   │       ├── models/loan.model.js
│   │       └── routes/loan.routes.js
│   └── recommendation-service-python/   ← Microservice ML (FastAPI)
│       ├── Dockerfile
│       ├── main.py
│       ├── api/
│       │   ├── routes.py                ← Endpoints + logique fallback
│       │   ├── schemas.py               ← Modèles Pydantic
│       │   └── db.py                    ← DB + recommandations catégorielles
│       └── ml/
│           ├── recommender.py           ← Algorithme SVD
│           └── loader.py                ← Chargement du modèle
│
├── frontend/                            ← Dashboard HTML/JS (nginx)
│   ├── Dockerfile
│   └── index.html                       ← Application complète (SPA vanilla)
│
├── dvc-pipeline/                        ← Pipeline ML versionné
│   ├── preprocess.py                    ← Nettoyage et formatage
│   ├── train.py                         ← Entraînement SVD (scikit-surprise)
│   ├── evaluate.py                      ← Métriques RMSE / MAE
│   ├── params.yaml                      ← Hyperparamètres
│   ├── data/
│   │   ├── loans.csv                    ← Données brutes (export API)
│   │   └── loans_clean.csv             ← Données nettoyées
│   └── models/
│       └── model.pkl                    ← Modèle SVD entraîné
│
├── docs/                                ← Documentation
│   ├── api-endpoints.md
│   └── Images/
│
├── metrics/
│   └── metrics.json                     ← Métriques DVC exportées
│
├── docker-compose.yml                   ← Orchestration (profils dev / prod)
├── dvc.yaml                             ← Définition du pipeline DVC
├── dvc.lock                             ← Verrou des versions DVC
└── Jenkinsfile                          ← Pipeline CI/CD
```

---

## Schéma de base de données

```sql
utilisateurs                       livres
──────────────────────             ────────────────────────────
id            UUID PK              id            UUID PK
nom           VARCHAR(100)         titre         VARCHAR
prenom        VARCHAR(100)         auteur        VARCHAR
email         VARCHAR(150) UNIQUE  isbn          VARCHAR UNIQUE
mot_de_passe  VARCHAR(255)         categorie     VARCHAR
type_utilisateur VARCHAR(20)       editeur       VARCHAR
  CHECK IN ('etudiant',            annee_publication INT
    'professeur','personnel')      nombre_exemplaires INT
model_id      VARCHAR(10) UNIQUE   exemplaires_disponibles INT
actif         BOOLEAN DEFAULT TRUE model_id      VARCHAR UNIQUE
created_at    TIMESTAMP            created_at    TIMESTAMP

emprunts                           notes
────────────────────────           ────────────────────────────
id                  UUID PK        id            UUID PK
utilisateur_id      UUID FK        utilisateur_id UUID FK
livre_id            UUID FK        livre_id      UUID FK
date_emprunt        DATE           note          NUMERIC(2,1) [1–5]
date_retour_prevue  DATE           created_at    TIMESTAMP
date_retour_effective DATE
statut    VARCHAR CHECK IN         UNIQUE(utilisateur_id, livre_id)
  ('en_cours','en_retard','retourne')
[jours_retard  calculé à la volée]
[penalite_fcfa calculé: jours × 500 FCFA]
```

---

## Équipe

| Membre | Responsabilité |
|---|---|
| **Maurice AHOUANSOU** | Base de données · Service utilisateurs · Rapport |
| **Ibrahima DIALLO** | Service emprunts |
| **Fatoumata SIDIBE** | Service livres |
| **Abdin KOUSSUBE** | Service recommandation |
| **Abdoul G. DIALLO** | Frontend |
| **M. DIAKITE** | DVC pipeline |
| **Seydou KABORE** | README · Docker Compose |
| **M. KANE** | Backend / intégration |

---

<div align="center">

**Bibliothèque Numérique DIT** · Master 2 IA · Département Informatique & Télécommunications

*Construit avec ❤️ par l'équipe DIT Sénégal*

[![Made with Docker](https://img.shields.io/badge/Made%20with-Docker-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2023-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/fr/docs/Web/JavaScript)

</div>
