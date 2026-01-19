// ===== CONFIG JSONBIN =====

// 1) VA SUR JSONBIN > onglet "API" > copie l'URL du GET AVEC ?meta=false à la fin
//    Par exemple ça ressemble à :
//    https://api.jsonbin.io/v3/b/66fabc1234567890abcd?meta=false
//    ET COLLE CETTE URL CI-DESSOUS ENTRE GUILLEMETS :
const BIN_URL = "https://api.jsonbin.io/v3/b/Thttps://api.jsonbin.io/v3/b/696eb1d443b1c97be93b9d5c?meta=false";

// 2) COPIE TA CLE (sans la montrer à personne) ET COLLE-LA ICI :
const API_KEY = "$2a$10$w8iMSIDfId08bdkkpebRg.tgUFwKC0N5aDNz9K8fxURxxeMCaxOYO";  // X-Master-Key ou X-Access-Key selon jsonbin


// ===== DOM =====
const agentIdInput   = document.getElementById("agentId");
const agentPassInput = document.getElementById("agentPass");
const loginBtn       = document.getElementById("loginBtn");
const loginError     = document.getElementById("loginError");


// ===== FONCTIONS =====
function setError(msg) {
  if (loginError) loginError.textContent = msg;
}

async function loadDb() {
  // Regarde sur jsonbin quel header ils indiquent dans l'exemple:
  // - si c'est "X-Master-Key", laisse cette ligne comme ça
  // - si c'est "X-Access-Key", remplace "X-Master-Key" par "X-Access-Key"
  const res = await fetch(BIN_URL, {
    headers: {
      "X-Master-Key": API_KEY
      // ou "X-Access-Key": API_KEY
    }
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${txt}`);
  }

  // avec ?meta=false, jsonbin renvoie directement ton objet :
  // { agents: {...}, reports: [], messages: [] }
  return await res.json();
}


async function handleLogin() {
  setError("");

  const id   = (agentIdInput?.value || "").trim();
  const pass = (agentPassInput?.value || "").trim();

  if (!id || !pass) {
    setError("Remplis les deux champs.");
    return;
  }

  try {
    const db = await loadDb();

    const agents = db.agents || {};
    const key    = id.toUpperCase();
    const agent  = agents[key];

    if (!agent) {
      setError("Agent inconnu (ID incorrect).");
      return;
    }

    if (agent.pass !== pass) {
      setError("Mot de passe incorrect.");
      return;
    }

    // Succès : pour l'instant on affiche juste un message
    alert(`Connecté : ${agent.name} (niveau ${agent.level})`);

  } catch (e) {
    console.error(e);
    setError("Erreur base : " + (e?.message || "fetch impossible"));
  }
}


// ===== EVENTS =====
loginBtn?.addEventListener("click", handleLogin);
agentPassInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleLogin();
});
