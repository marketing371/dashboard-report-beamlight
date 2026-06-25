# STATO-LAVORI - dashboard-report-beamlight
> Stato live del lavoro. Aggiornare PRIMA di chiudere ogni sessione. Diario datato: LOG-SESSIONI.md.
> Brain: Beamlight. Legge del gruppo: https://github.com/Holding-Brain/hub/blob/main/LEGGE.md
> ASCII puro. Ultimo aggiornamento: 2026-06-25

> NOTA: ricostruito da overview Brain + repo + git log, DA RIVEDERE.

## In una riga
Dashboard interna React/Vite per generare report marketing per clienti, aggregando dati GA4, Google Ads e Meta Ads e producendo PDF con insight AI.

## Stato attuale
- Stack: React 18 + Vite 5, Tailwind CSS, Chart.js (react-chartjs-2), TanStack React Table.
- Funzioni presenti nel codice:
  - Recupero dati per cliente da un Worker esterno (config.workerUrl) per GA4 (/ga4), Google Ads (/google-ads) e Meta Ads (/meta-ads), con auth Bearer (src/services/api.js).
  - Trasformazione dati per sorgente in src/lib/transformers.js (processGA4Data, processGAdsData, processMetaData).
  - UI a componenti: Header, Layout, MetricCard, ChartSection, DataTable, SettingsModal e set ui (Button, Card, Input, Modal, Select).
  - Generazione report: ReportGenerator.jsx con insight AI via endpoint Worker /gemini ed export PDF con html2canvas + jsPDF.
  - Autenticazione lato app via AuthContext (config + authToken).
- Stato progetto secondo overview Brain: dormant da febbraio 2026 (oltre 90 giorni di inattivita AI). Ultima attivita AI registrata 2026-02-03.
- Tool AI usato in passato: Antigravity native (sessione fba8c12f con implementation_plan, task, walkthrough).
- Presenti in repo: index_old.html (versione precedente), dist e .netlify (build/deploy), cartelle pgia/_pgbackup/_pginfo e pinegrow.json (artefatti Pinegrow).
- Nessun README.md, nessun CLAUDE.md, nessuna memoria .claude per questo progetto.

## Prossimi passi
- Verificare se la dashboard e ancora in uso o va archiviata (dormant da feb 2026).
- Chiarire la relazione con il progetto correlato beamlight-dashboard (possibile duplicato/variante).
- Documentare la configurazione del Worker esterno (workerUrl, endpoint ga4/google-ads/meta-ads/gemini) e le credenziali necessarie.
- Completare/verificare fetchDashboardData in src/services/api.js (attualmente ritorna null, da rivedere).
- Valutare pulizia repo: index_old.html, artefatti Pinegrow (pgia, _pgbackup, _pginfo, pinegrow.json), dist committata.

## Riferimenti  (Repo: D:\dashboard report beamlight)
- Overview Brain: D:\BeamlightBrain\projects\overview\dashboard-report-beamlight.md
- Progetto correlato: D:\BeamlightBrain\projects\overview\beamlight-dashboard.md
- Core report: src/components/ReportGenerator.jsx
- API/dati: src/services/api.js, src/lib/transformers.js
- Config: package.json, vite.config.js, tailwind.config.js, postcss.config.js
