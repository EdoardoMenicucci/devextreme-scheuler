# Documentazione Devextreme Scheduler
Questo documento descrive le principali aree del progetto, la struttura delle cartelle e i componenti chiave. Di seguito vengono illustrate le responsabilità di ciascuna parte dell'applicazione.

---

## Indice

1. [Overview](#overview)
2. [Struttura delle Cartelle](#struttura-delle-cartelle)
3. [Servizi](#servizi)
   - [AuthService](#authservice)
   - [ChatService](#chatservice)
   - [DashboardService](#dashboardservice)
4. [Guardie e Interceptor](#guardie-e-interceptor)
5. [Componenti Principali](#componenti-principali)
6. [Stili e Temi](#stili-e-temi)
7. [Future Migliorìe](#future-migliorìe)

---

## Overview

Devextreme Scheduler è un moderno sistema di gestione appuntamenti sviluppato con Angular 19, TypeScript, DevExtreme e Tailwind CSS. Presenta funzionalità di autenticazione, dashboard con statistiche e integrazione AI per suggerimenti intelligenti.

---

## Struttura delle Cartelle

Il progetto è organizzato come segue:

- **.angular/** – File di configurazione per Angular.
- **cache/** – Cache per le versioni e i moduli.
- **.vscode/** – Configurazioni specifiche dell'IDE (come launch.json, tasks.json, extensions.json).
- **documentation.md** – La documentazione del progetto.
- **package.json** – Script e dipendenze.
- **public/** – Risorse pubbliche come favicon.ico.
- **src/** – Codice sorgente dell'applicazione:
  - **app/** – Contiene componenti, servizi ed altre logiche di business.
    - **components/** – Componenti come chat e sidebar.
      - [chat.service.ts](../../../../d:/Edoardo/Scheduler/devextreme-scheuler/src/app/components/chat/chat.service.ts) – Gestisce la logica della chat, inclusi invio messaggi e aggiornamento UI.
      - [sidebar.component.ts](../../../../d:/Edoardo/Scheduler/devextreme-scheuler/src/app/components/sidebar/sidebar.component.ts) – Definisce il menu laterale e la navigazione.
    - **auth/** – Logica di autenticazione.
      - [auth.service.ts](../../../../d:/Edoardo/Scheduler/devextreme-scheuler/src/app/auth/auth.service.ts) – Gestisce login, registrazione, logout e token JWT.
      - [error-handler.service.ts](../../../../d:/Edoardo/Scheduler/devextreme-scheuler/src/app/auth/error-handler.service.ts) – Gestisce gli errori di autenticazione.
    - **pages/** – Pagine principali dell'applicazione:
      - [login.component.ts](../../../../d:/Edoardo/Scheduler/devextreme-scheuler/src/app/pages/login/login.component.ts) – Gestisce il flusso di login.
      - [dashboard.component.ts](../../../../d:/Edoardo/Scheduler/devextreme-scheuler/src/app/pages/dashboard/dashboard.component.ts) – Visualizza le statistiche e i grafici.
      - [register.component.ts](../../../../d:/Edoardo/Scheduler/devextreme-scheuler/src/app/pages/register/register.component.ts) – Gestisce la registrazione.
      - [scheduler.component.ts](../../../../d:/Edoardo/Scheduler/devextreme-scheuler/src/app/pages/scheduler/scheduler.component.ts) – Pannello per la gestione degli appuntamenti.
  - **assets/** – Risorse statiche (immagini, stili aggiuntivi).
  - **index.html, main.ts, styles.css** – Configurazioni base e file di stili globali.
- **tailwind.config.js, tsconfig*.json, angular.json** – Configurazioni di build e compilazione.

---

## Servizi

### AuthService

Responsabile della gestione dell'autenticazione:
- Gestione login e registrazione.
- Memorizzazione dei token e informazioni utente nel localStorage.
- Metodo di `isAuthenticated` per verificare lo stato di autenticazione.

Vedi [AuthService](../../../../d:/Edoardo/Scheduler/devextreme-scheuler/src/app/auth/auth.service.ts).

### ChatService

Si occupa della gestione della chat:
- Invio dei messaggi sia da utente che dall'assistente AI.
- Aggiornamento in tempo reale dei messaggi e gestione dello stato "in digitazione" dell'assistente.

Vedi [ChatService](../../../../d:/Edoardo/Scheduler/devextreme-scheuler/src/app/components/chat/chat.service.ts).

### DashboardService

Fornisce i dati statistici per il dashboard:
- Recupera statistiche dal backend filtrate per intervalli di date.
- Utilizza un `BehaviorSubject` per mantenere e aggiornare i dati visualizzati.

Vedi [DashboardService](../../../../d:/Edoardo/Scheduler/devextreme-scheuler/src/app/pages/dashboard/dashboard.service.ts).

---

## Guardie e Interceptor

Nel progetto sono presenti guardie e interceptor per proteggere le rotte e gestire gli errori di chiamate HTTP:
- **AuthGuard (se implementato)**: Protegge le rotte che richiedono autenticazione, reindirizzando l’utente alla pagina di login se non autenticato. (La logica può essere estesa in futuro.)
- **Interceptor HTTP**: Gestisce l’aggiunta del token JWT agli header delle richieste e il parsing degli errori, utilizzando il [ErrorHandlerService](../../../../d:/Edoardo/Scheduler/devextreme-scheuler/src/app/auth/error-handler.service.ts).

*(Nota: Se il progetto non include un AuthGuard esplicito, si consiglia di implementarlo per migliorare la sicurezza.)*

---

## Componenti Principali

- **LoginComponent** – Gestisce il processo di login dell’utente.  
  Vedi [LoginComponent](../../../../d:/Edoardo/Scheduler/devextreme-scheuler/src/app/pages/login/login.component.ts).
- **RegisterComponent** – Permette agli utenti di registrarsi.  
  Vedi [RegisterComponent](../../../../d:/Edoardo/Scheduler/devextreme-scheuler/src/app/pages/register/register.component.ts).
- **DashboardComponent** – Mostra statistiche e grafici tramite DevExtreme.  
  Vedi [DashboardComponent](../../../../d:/Edoardo/Scheduler/devextreme-scheuler/src/app/pages/dashboard/dashboard.component.ts).
- **SchedulerComponent** – Gestisce la visualizzazione e l’interazione con gli appuntamenti.  
  Vedi [SchedulerComponent](../../../../d:/Edoardo/Scheduler/devextreme-scheuler/src/app/pages/scheduler/scheduler.component.ts).

Altri componenti, come il [SidebarComponent](../../../../d:/Edoardo/Scheduler/devextreme-scheuler/src/app/components/sidebar/sidebar.component.ts) e quelli dedicati alle chat, completano l’esperienza utente.

---

## Stili e Temi

L’interfaccia utilizza Tailwind CSS ed è personalizzata con file di stile:
- **styles.css** – Stili globali ed override per componenti DevExtreme.  
  Vedi [styles.css](src/styles.css).
- **dx.fluent.\*.css** – File di stile per temi specifici integrati.

Gli stili per i componenti personalizzati (ad es. form di appuntamenti e sidebar) garantiscono un aspetto moderno e coerente.

---

## Future Migliorìe

- **Implementazione di AuthGuard** per proteggere ulteriormente le rotte.
- **Ottimizzazione degli Interceptor HTTP** per gestire automaticamente il rinnovo del token.
- Migliorare la gestione delle chat e la sincronizzazione in tempo reale.
- Refactoring e cleanup delle subscription nei servizi per evitare memory leak.

---

Questa documentazione rappresenta una panoramica delle principali aree del progetto e può essere aggiornata in base agli sviluppi futuri e alle nuove funzionalità.
