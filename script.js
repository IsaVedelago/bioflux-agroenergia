const root = document.documentElement;
const menuToggle = document.querySelector(".menu-toggle");
const navPanel = document.getElementById("mobileMenu");
const primaryNav = document.querySelector(".primary-nav");
const progressBar = document.getElementById("readingProgress");
const themeToggle = document.getElementById("themeToggle");
const decreaseFont = document.getElementById("decreaseFont");
const increaseFont = document.getElementById("increaseFont");
const impactForm = document.getElementById("impactForm");
const productionTypeInput = document.getElementById("productionType");
const simulatorResult = document.getElementById("simulatorResult");
const quizForm = document.getElementById("quizForm");
const quizScore = document.getElementById("quizScore");
const calculationToggle = document.getElementById("calculationToggle");
const calculationGuideBody = document.getElementById("calculationGuideBody");
const activeFactorName = document.getElementById("activeFactorName");

const fontSteps = ["small", "normal", "large", "xlarge"];
let currentFontIndex = fontSteps.indexOf(root.dataset.font || "normal");

const SIMULATION_FACTORS = {
  suinos: {
    residue: 5.2,
    biogas: 0.19,
    fertilizer: 4.1,
    energy: 1.7,
    label: "suínos",
    displayName: "Suinocultura"
  },
  aves: {
    residue: 0.12,
    biogas: 0.035,
    fertilizer: 0.09,
    energy: 1.7,
    label: "aves",
    displayName: "Avicultura"
  }
};

function updateProgress() {
  const scrollTop = window.scrollY;
  const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = documentHeight > 0 ? (scrollTop / documentHeight) * 100 : 0;
  progressBar.style.width = `${Math.min(progress, 100)}%`;
}

function closeMenu() {
  navPanel.classList.remove("is-open");
  document.body.classList.remove("nav-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Abrir menu de navegação");
}

function openMenu() {
  navPanel.classList.add("is-open");
  document.body.classList.add("nav-open");
  menuToggle.setAttribute("aria-expanded", "true");
  menuToggle.setAttribute("aria-label", "Fechar menu de navegação");
}

function toggleMenu() {
  if (navPanel.classList.contains("is-open")) {
    closeMenu();
    return;
  }

  openMenu();
}

function setTheme(theme) {
  root.dataset.theme = theme;
  localStorage.setItem("agrinho-theme", theme);
  themeToggle.setAttribute("aria-label", theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro");
}

function setFontSize(index) {
  currentFontIndex = Math.max(0, Math.min(index, fontSteps.length - 1));
  root.dataset.font = fontSteps[currentFontIndex];
  localStorage.setItem("agrinho-font", root.dataset.font);
}

function formatNumber(value) {
  return new Intl.NumberFormat("pt-BR").format(Math.round(value));
}

function formatFactor(value) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3
  }).format(value);
}

function updateCalculationGuide() {
  const selectedType = productionTypeInput.value;
  const selectedFactors = SIMULATION_FACTORS[selectedType];

  if (!selectedFactors) {
    return;
  }

  document.querySelectorAll("[data-factor-value]").forEach((item) => {
    const [production, factorName] = item.dataset.factorValue.split(".");
    item.textContent = formatFactor(SIMULATION_FACTORS[production][factorName]);
  });

  document.querySelectorAll("[data-factor-card]").forEach((card) => {
    const isActive = card.dataset.factorCard === selectedType;
    card.classList.toggle("is-active", isActive);

    if (isActive) {
      card.setAttribute("aria-current", "true");
      return;
    }

    card.removeAttribute("aria-current");
  });

  activeFactorName.textContent = selectedFactors.displayName;
}

function setCalculationGuideExpanded(isExpanded) {
  calculationToggle.setAttribute("aria-expanded", String(isExpanded));
  calculationGuideBody.classList.toggle("is-collapsed", !isExpanded);
  calculationGuideBody.setAttribute("aria-hidden", String(!isExpanded));
}

function getScenarioMessage(type, animals, goal) {
  const scale = animals < 200 ? "pequena" : animals < 3000 ? "média" : "alta";
  const productionName = type === "suinos" ? "suinocultura" : "avicultura";
  const base = `Para uma operação de ${productionName} de escala ${scale}, o biodigestor organiza o tratamento dos dejetos e revela o potencial de energia circular da propriedade.`;

  const messages = {
    energia: "O foco em energia destaca o uso do biogás em geração elétrica, aquecimento e redução de custos operacionais.",
    fertilidade: "O foco em fertilidade evidencia o retorno do digestato tratado ao solo como biofertilizante, sempre com orientação técnica.",
    renda: "O foco em renda aponta possibilidades com excedentes energéticos, biometano e valorização ambiental da produção.",
    ambiente: "O foco ambiental reforça a redução de odores, emissões descontroladas, descarte inadequado e riscos de contaminação."
  };

  return `${base} ${messages[goal]}`;
}

function calculateImpact(event) {
  event.preventDefault();

  const formData = new FormData(impactForm);
  const type = formData.get("productionType");
  const animals = Number(formData.get("animalCount"));
  const goal = formData.get("mainGoal");

  if (!Number.isFinite(animals) || animals <= 0) {
    simulatorResult.innerHTML = `
      <p class="result-kicker">Resultado da simulação educativa</p>
      <h3>Informe uma quantidade válida</h3>
      <p>Use um número maior que zero para visualizar uma estimativa educativa de potencial circular.</p>
      <p class="result-note"><strong>Aviso:</strong> a leitura é educativa e não substitui avaliação técnica.</p>
    `;
    return;
  }

  const selected = SIMULATION_FACTORS[type];
  const dailyResidue = animals * selected.residue;
  const estimatedBiogas = animals * selected.biogas;
  const energyEquivalent = estimatedBiogas * selected.energy;
  const biofertilizer = animals * selected.fertilizer;
  const message = getScenarioMessage(type, animals, goal);

  simulatorResult.innerHTML = `
    <p class="result-kicker">Resultado da simulação educativa</p>
    <h3>${formatNumber(animals)} ${selected.label} no painel BioFlux</h3>
    <div class="result-metrics">
      <div class="metric">
        <strong>${formatNumber(dailyResidue)} kg/dia</strong>
        <span>resíduo manejado</span>
      </div>
      <div class="metric">
        <strong>${formatNumber(estimatedBiogas)} m³/dia</strong>
        <span>biogás potencial</span>
      </div>
      <div class="metric">
        <strong>${formatNumber(energyEquivalent)} kWh/dia</strong>
        <span>energia equivalente</span>
      </div>
      <div class="metric">
        <strong>${formatNumber(biofertilizer)} kg/dia</strong>
        <span>biofertilizante potencial</span>
      </div>
    </div>
    <p>${message}</p>
    <p class="result-note"><strong>Mensagem ambiental:</strong> tratar dejetos reduz riscos e transforma um passivo em energia, nutrientes e valor produtivo. Os fatores são simplificados e educativos, não oficiais.</p>
  `;
}

function updateQuizScore() {
  const cards = quizForm.querySelectorAll(".quiz-card");
  let answered = 0;
  let score = 0;

  cards.forEach((card) => {
    const checked = card.querySelector("input:checked");
    if (!checked) {
      return;
    }

    answered += 1;
    if (checked.value === card.dataset.answer) {
      score += 1;
    }
  });

  const isComplete = answered === cards.length;
  quizScore.classList.toggle("is-complete", isComplete);
  quizScore.textContent = isComplete
    ? `Pontuação final: ${score} de ${cards.length} | Quiz completo`
    : `Pontuação: ${score} de ${cards.length}`;
}

function handleQuizChange(event) {
  if (!event.target.matches("input[type='radio']")) {
    return;
  }

  const card = event.target.closest(".quiz-card");
  const feedback = card.querySelector(".feedback");
  const isCorrect = event.target.value === card.dataset.answer;

  card.classList.toggle("correct", isCorrect);
  card.classList.toggle("incorrect", !isCorrect);
  feedback.textContent = isCorrect
    ? "Resposta correta. Você conectou bem o processo de agroenergia circular."
    : "Ainda não. Releia a ideia técnica da pergunta e tente outra alternativa.";

  updateQuizScore();
}

menuToggle.addEventListener("click", toggleMenu);

primaryNav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    closeMenu();
  }
});

document.addEventListener("click", (event) => {
  const isOpen = navPanel.classList.contains("is-open");
  const clickedInsidePanel = navPanel.contains(event.target);
  const clickedToggle = menuToggle.contains(event.target);

  if (isOpen && !clickedInsidePanel && !clickedToggle) {
    closeMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navPanel.classList.contains("is-open")) {
    closeMenu();
    menuToggle.focus();
  }
});

themeToggle.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
  setTheme(nextTheme);
});

decreaseFont.addEventListener("click", () => {
  setFontSize(currentFontIndex - 1);
});

increaseFont.addEventListener("click", () => {
  setFontSize(currentFontIndex + 1);
});

impactForm.addEventListener("submit", calculateImpact);
productionTypeInput.addEventListener("change", updateCalculationGuide);
calculationToggle.addEventListener("click", () => {
  const isExpanded = calculationToggle.getAttribute("aria-expanded") === "true";
  setCalculationGuideExpanded(!isExpanded);
});
quizForm.addEventListener("change", handleQuizChange);
window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", () => {
  updateProgress();

  if (window.innerWidth > 900) {
    closeMenu();
  }
});

const savedTheme = localStorage.getItem("agrinho-theme");
const savedFont = localStorage.getItem("agrinho-font");

if (savedTheme === "dark" || savedTheme === "light") {
  setTheme(savedTheme);
}

if (fontSteps.includes(savedFont)) {
  setFontSize(fontSteps.indexOf(savedFont));
}

updateQuizScore();
updateCalculationGuide();
setCalculationGuideExpanded(true);
updateProgress();
