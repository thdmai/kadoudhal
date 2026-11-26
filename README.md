# Kadoudhal

Front **Next.js** + API **Spring Boot** + Postgres **Supabase** (migration progressive).

## Structure

```
kadoudhal/
  web/                 # Next.js (UI + auth Supabase)
  api/                 # Spring Boot (REST → Postgres Supabase)
  supabase/            # SQL / RLS
  docker-compose.yml
  scripts/security-scan.sh
```

Principe : peu de couches. Pas de Cache Components / Instant Navigations.
Auth reste sur Supabase tant que Spring Security n’est pas là.

## Dev local (sans Docker)

### 1. Front

```bash
cd web
cp env.example .env.local   # + clés Supabase
npm install
npm run dev
```

Optionnel — brancher l’API Spring pour l’accueil :

```env
API_URL=http://localhost:8080
```

### 2. API Spring Boot

JDK **21+** requis (`javac -version`). Si tu n’as que le JRE :

```bash
# exemple Temurin 21 dans ~/.local/jdk
export JAVA_HOME="$HOME/.local/jdk/jdk-21.0.9+10"
export PATH="$JAVA_HOME/bin:$PATH"
```

```bash
cd api
cp .env.example .env
# DATABASE_URL = jdbc:postgresql://db.<ref>.supabase.co:5432/postgres?sslmode=require
./mvnw spring-boot:run
```

Health : [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)  
Home blocks : [http://localhost:8080/api/home-blocks](http://localhost:8080/api/home-blocks)

## Docker / DevSecOps

```bash
# .env à la racine (ou exporter) : NEXT_PUBLIC_SUPABASE_*, et api/.env pour la DB
docker compose up --build
```

- Web : http://localhost:3000  
- API : http://localhost:8080  

Scan vulnérabilités (Trivy) :

```bash
chmod +x scripts/security-scan.sh
./scripts/security-scan.sh
```

CI GitHub Actions : build api + web + scan fs Trivy (`.github/workflows/ci.yml`).

## Migration progressive

| Étape | État |
|---|---|
| Accueil `GET /api/home-blocks` | ✅ |
| Auth / profil | encore Server Actions + Supabase |
| Admin / contenu | encore Next → à migrer vers l’API |
| JWT Spring Security | à venir |

Le front garde Supabase Auth tant que Spring Security n’est pas en place.
