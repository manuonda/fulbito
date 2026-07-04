# ⚽ fulbito — Torneo Mundial 2026

App mobile-first para pronosticar los partidos del Mundial 2026 entre amigos. El organizador crea
torneos y partidos, habilita jugadores, y cada uno carga sus pronósticos antes del kickoff. Los
puntos ("porotos") se acumulan desde 16vos hasta la final.

**Stack**: Vite + React + TypeScript · Tailwind CSS · React Router · Zustand · Firebase (Auth + Firestore)

## Puntaje

| Acierto | Porotos |
| --- | --- |
| Marcador exacto | **6** |
| Mismo resultado (ganador o empate), otro marcador | **3** |
| Resultado distinto | **0** |

El ranking es denso: 1°, 2°, 2°, 3°…

## Setup

### 1. Instalar y correr

```bash
npm install
npm run dev
```

Sin credenciales de Firebase la app levanta igual y muestra un aviso en la pantalla de inicio.

### 2. Crear el proyecto de Firebase

1. Entrá a [console.firebase.google.com](https://console.firebase.google.com) y creá un proyecto.
2. **Authentication → Sign-in method**: habilitá **Google** y **Email/Password** (Correo electrónico/contraseña).
3. **Firestore Database**: creá la base en modo producción.
4. **Configuración del proyecto → Tus apps → Web (`</>`)**: registrá la app y copiá la config.
5. Copiá `.env.example` a `.env` y pegá los valores:

```bash
cp .env.example .env
```

6. Reiniciá `npm run dev`.

### 3. Desplegar las reglas de seguridad

Las reglas están en `firestore.rules`. Dos opciones:

- **Consola**: Firestore Database → Reglas → pegá el contenido del archivo → Publicar.
- **CLI**:

```bash
npm i -g firebase-tools
firebase login
firebase init firestore   # elegí el proyecto, apuntá a firestore.rules
firebase deploy --only firestore:rules
```

> El email del admin (`manuonda@gmail.com`) está fijado en dos lugares: `src/config/roles.ts` y
> `firestore.rules`. Si lo cambiás, cambialo en ambos.

### 4. Índice de collection group (requerido)

El ranking lee todas las predicciones de un torneo con una consulta *collection group* sobre
`predictions` filtrando por `tournamentId`. La primera vez, Firestore va a rechazar la consulta y
en la consola del navegador aparece un **link para crear el índice**: abrilo, confirmá y esperá un
minuto. Alternativamente: Firestore → Índices → Exenciones de campo único → agregar exención para
el campo `tournamentId` de la colección `predictions` con alcance *Grupo de colecciones*.

## Flujo de uso

1. **Admin** (`manuonda@gmail.com`) entra con Google.
2. En Home → **Habilitar jugadores**: agrega los emails de los amigos (allowlist).
3. En Home → **Crear nuevo torneo**: nombre, tipo (Amistoso / Por los porotos) y porotos por integrante.
4. En el torneo → **Gestionar partidos**: carga los cruces de 16vos (equipos, bandera de 2 letras
   tipo `ar`, `br`, fase y kickoff).
5. Los amigos entran (Google o registro con email/contraseña). Si su email no está habilitado ven
   "Esperando invitación"; cuando el admin los agrega, entran solos.
6. Cada uno abre el torneo → **Sumarme al torneo** → **Seguí completando resultados** y carga sus
   pronósticos (editables hasta el kickoff).
7. Terminado un partido, el admin carga el **resultado oficial** en Gestionar partidos → los
   porotos se suman al ranking automáticamente.

Los pronósticos ajenos se revelan recién cuando arranca cada partido, para que nadie espíe. 👀

## Datos de ejemplo (seed manual)

Con el torneo creado, cargá por ejemplo en Gestionar partidos:

| Fase | Equipo A | Bandera | Equipo B | Bandera |
| --- | --- | --- | --- | --- |
| 16vos | Canadá | `ca` | Marruecos | `ma` |
| 16vos | Paraguay | `py` | Francia | `fr` |
| 16vos | Brasil | `br` | Noruega | `no` |
| 16vos | México | `mx` | Inglaterra | `gb` |
| 16vos | Argentina | `ar` | Italia | `it` |

Las banderas se muestran desde [flagcdn.com](https://flagcdn.com) por código de país; si no hay
red se cae a emoji.

## Estructura

```
src/
  assets/trophy.svg      # copa dorada del hero y las pantallas
  components/            # guards de ruta + UI compartida (TopBar, Flag, botones)
  config/roles.ts        # email del admin
  hooks/                 # onSnapshot de torneos, partidos, predicciones y perfiles
  lib/
    firebase.ts          # init de Firebase desde .env
    auth.ts              # Google, registro (username único), login, reset
    db.ts                # escrituras: torneos, partidos, resultado oficial, allowlist
    scoring.ts           # 6/3/0 + ranking denso
  screens/               # una pantalla por ruta
  store/authStore.ts     # sesión + allowlist en Zustand
firestore.rules          # seguridad por rol/allowlist + lock por kickoff
```

## Deploy opcional (Firebase Hosting)

```bash
npm run build
firebase init hosting    # public: dist, single-page app: yes
firebase deploy --only hosting
```

Acordate de agregar el dominio de Hosting en Authentication → Settings → Dominios autorizados.
