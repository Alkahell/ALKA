// ===== JSONBIN CONFIG =====
const BIN_ID = "https://api.jsonbin.io/v3/b/696eb1d443b1c97be93b9d5c";
const API_KEY = "$2a$10$w8iMSIDfId08bdkkpebRg.tgUFwKC0N5aDNz9K8fxURxxeMCaxOYO";

// On essaie plusieurs endpoints compatibles
const URLS = [
  `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`,     // format { record: ... }
  `https://api.jsonbin.io/v3/b/${BIN_ID}?meta=false`  // format direct { agents: ... }
];

// ===== DOM =====
const loginPanel = document.getElementById("login-panel");
const mainPanel  = document.getElementById("main-panel");

const agentIdInput   = document.getElementById("agentId");
const agentPassInput = document.getElementById("agentPass");
const loginBtn       = document.getElementById("loginBtn");
const loginError     = document.getElementById("loginError");

const welcomeEl   = document.getElementById("welcome");
const clearanceEl = document.getElementById("clearance");
const rawDbEl     = document.getElementById("rawDb");

// ===== HELPERS =====
function setError(msg) {
  if (loginError) loginError.textContent = msg;
}

async function fetchDb(url, headerName) {
  const res = await fetch(url, {
    headers: { [headerName]: API_KEY }
  });

  // Donne un message clair si la clé/URL est mauvaise
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} via ${headerName} @ ${url}\n${txt}`);
  }

  const data = await res.json();

  // jsonbin peut renvoyer {record:{...}} ou directement {...}
  return data?.record ?? data;
}

async function loadDb() {
  const headerNames = ["X-Master-Key", "X-Access-Key"];

  let lastErr = null;

  for (const url of URLS) {
    for (const h of headerNames) {
      try {
        return await fetchDb(url, h);
      } catch (e) {
        lastErr = e;
      }
    }
  }

  throw lastErr ?? new Error("Impossible de joindre jsonbin.");
}

function showMain(agent, db) {
  // si tu n'as pas de main panel, on ne casse pas
  if (loginPanel) loginPanel.style.display = "none";
  if (mainPanel) mainPanel.style.display = "block";

  if (welcomeEl) welcomeEl.textContent = `Bienvenue, ${agent.name}`;
  if (clearanceEl) clearanceEl.textContent = `Niveau d'accréditation : ${agent.level}`;
  if (rawDbEl) rawDbEl.textContent = JSON.stringify(db, null, 2);
}

// ===== LOGIN =====
async function handleLogin() {
  setError("");

  const id = (agentIdInput?.value || "").trim();
  const pass = (agentPassInput?.value || "").trim();

  if (!id || !pass) {
    setError("Remplis les deux champs.");
    return;
  }

  try {
    const db = await loadDb();

    const agents = db?.agents || {};
    const key = id.toUpperCase();
    const agent = agents[key];

    if (!agent) {
      setError("Agent inconnu (ID incorrect).");
      return;
    }

    if (agent.pass !== pass) {
      setError("Mot de passe incorrect.");
      return;
    }

    showMain(agent, db);

  } catch (e) {
    console.error(e);
    // On affiche le vrai problème (très utile)
    setError("Erreur base : " + (e?.message || "fetch impossible"));
  }
}

loginBtn?.addEventListener("click", handleLogin);
agentPassInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleLogin();
});
