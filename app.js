// CONFIG JSONBIN
const BIN_ID  = "https://api.jsonbin.io/v3/b/undefined";      // ← remplace par ton vrai ID
const API_KEY = "$2a$10$w8iMSIDfId08bdkkpebRg.tgUFwKC0N5aDNz9K8fxURxxeMCaxOYO";  // ← remplace par ta clé (X-Master-Key ou X-Access-Key)

const BIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`;

// Sélection des éléments HTML
const loginPanel = document.getElementById("login-panel");
const mainPanel  = document.getElementById("main-panel");

const agentIdInput   = document.getElementById("agentId");
const agentPassInput = document.getElementById("agentPass");
const loginBtn       = document.getElementById("loginBtn");
const loginError     = document.getElementById("loginError");

const welcomeEl   = document.getElementById("welcome");
const clearanceEl = document.getElementById("clearance");
const rawDbEl     = document.getElementById("rawDb");

// Fonction pour charger le JSON depuis jsonbin
async function loadDb() {
  const res = await fetch(BIN_URL, {
    headers: {
      "X-Master-Key": API_KEY, // ou "X-Access-Key": API_KEY selon ce que jsonbin t'a donné
    }
  });

  if (!res.ok) {
    throw new Error("Erreur jsonbin: " + res.status);
  }

  const data = await res.json();
  return data.record; // jsonbin renvoie { record: {...}, metadata: {...} }
}

// Gestion du bouton de connexion
async function handleLogin() {
  loginError.textContent = "";

  const id   = agentIdInput.value.trim();
  const pass = agentPassInput.value.trim();

  if (!id || !pass) {
    loginError.textContent = "Remplis les deux champs.";
    return;
  }

  try {
    const db = await loadDb();
    const agents = db.agents || {};
    const key = id.toUpperCase();
    const agent = agents[key];

    if (!agent) {
      loginError.textContent = "Agent inconnu.";
      return;
    }

    if (agent.pass !== pass) {
      loginError.textContent = "Mot de passe incorrect.";
      return;
    }

    // Connexion réussie
    loginPanel.style.display = "none";
    mainPanel.style.display  = "block";

    welcomeEl.textContent   = `Bienvenue, ${agent.name}`;
    clearanceEl.textContent = `Niveau d'accréditation : ${agent.level}`;
    rawDbEl.textContent     = JSON.stringify(db, null, 2);

  } catch (e) {
    console.error(e);
    loginError.textContent = "Erreur de connexion à la base.";
  }
}

loginBtn.addEventListener("click", handleLogin);
agentPassInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleLogin();
});
