let currentPhaseIndex = 0;
let currentWorkIndex = 0;

const els = {
  phaseLabel: document.getElementById("phaseLabel"),
  phaseTitle: document.getElementById("phaseTitle"),
  phaseQuestion: document.getElementById("phaseQuestion"),
  phaseProgressLabel: document.getElementById("phaseProgressLabel"),
  phaseProgressTrack: document.getElementById("phaseProgressTrack"),
  workStudyDate: document.getElementById("workStudyDate"),
  workTitle: document.getElementById("workTitle"),
  workAuthor: document.getElementById("workAuthor"),
  workTags: document.getElementById("workTags"),
  workUtility: document.getElementById("workUtility"),
  heroPitch: document.getElementById("heroPitch"),
  questionList: document.getElementById("questionList"),
  whyList: document.getElementById("whyList"),
  watchList: document.getElementById("watchList"),
  questionsSection: document.getElementById("questionsSection"),
  whySection: document.getElementById("whySection"),
  watchSection: document.getElementById("watchSection"),
  accordionGroup: document.getElementById("accordionGroup"),
  workView: document.getElementById("workView"),
  prevBottomButton: document.getElementById("prevBottomButton"),
  nextBottomButton: document.getElementById("nextBottomButton"),
  prevWorkLabel: document.getElementById("prevWorkLabel"),
  nextWorkLabel: document.getElementById("nextWorkLabel"),
  roadmapButton: document.getElementById("roadmapButton"),
  closeDrawerButton: document.getElementById("closeDrawerButton"),
  drawerOverlay: document.getElementById("drawerOverlay"),
  drawer: document.getElementById("drawer"),
  roadmapList: document.getElementById("roadmapList")
};

function safeArray(value) {
  if (Array.isArray(value)) return value.filter(item => typeof item === "string" && item.trim()).map(item => item.trim());
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
}
function slugify(value) {
  return (value || "oeuvre").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function getCurrentPhase() { return roadmapData[currentPhaseIndex]; }
function getCurrentWork() { return getCurrentPhase().works[currentWorkIndex]; }
function flattenWorks() {
  const flat = [];
  roadmapData.forEach((phase, phaseIndex) => phase.works.forEach((work, workIndex) => flat.push({ phase, work, phaseIndex, workIndex })));
  return flat;
}
function getFlatIndex() {
  return flattenWorks().findIndex(item => item.phaseIndex === currentPhaseIndex && item.workIndex === currentWorkIndex);
}
function savePosition() { localStorage.setItem("horrorRoadmapPosition", JSON.stringify({ currentPhaseIndex, currentWorkIndex })); }
function restorePosition() {
  try {
    const saved = JSON.parse(localStorage.getItem("horrorRoadmapPosition") || "null");
    if (roadmapData[saved?.currentPhaseIndex]?.works?.[saved?.currentWorkIndex]) {
      currentPhaseIndex = saved.currentPhaseIndex;
      currentWorkIndex = saved.currentWorkIndex;
    }
  } catch (_) {}
}
function createTag(label, typeClass = "") {
  const span = document.createElement("span");
  span.className = `tag ${typeClass}`.trim();
  span.textContent = label;
  return span;
}
function renderList(listEl, sectionEl, items) {
  const list = safeArray(items);
  sectionEl.hidden = list.length === 0;
  listEl.innerHTML = "";
  list.forEach(text => {
    const li = document.createElement("li");
    li.textContent = text;
    listEl.appendChild(li);
  });
}
function createAccordion(title, content, open = false) {
  const list = safeArray(content);
  if (!list.length) return null;
  const section = document.createElement("section");
  section.className = `accordion ${open ? "is-open" : ""}`;
  const button = document.createElement("button");
  button.className = "accordion__button";
  button.type = "button";
  button.innerHTML = `<span>${title}</span><span class="accordion__icon" aria-hidden="true">+</span>`;
  const div = document.createElement("div");
  div.className = "accordion__content";
  list.forEach(text => {
    const p = document.createElement("p");
    p.textContent = text;
    div.appendChild(p);
  });
  button.addEventListener("click", () => section.classList.toggle("is-open"));
  section.append(button, div);
  return section;
}
function renderParagraphs(container, content) {
  const list = safeArray(content);
  container.hidden = list.length === 0;
  container.innerHTML = "";
  list.forEach(text => {
    const p = document.createElement("p");
    p.textContent = text;
    container.appendChild(p);
  });
}
function renderPhaseProgress(phase) {
  const total = phase.works.length;
  const percent = total <= 1 ? 100 : (currentWorkIndex / (total - 1)) * 100;
  els.phaseProgressLabel.textContent = `${currentWorkIndex + 1} / ${total}`;
  els.phaseProgressTrack.innerHTML = "";
  els.phaseProgressTrack.style.setProperty("--progress", `${percent}%`);
  phase.works.forEach((work, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "phase-progress__dot";
    if (index < currentWorkIndex) btn.classList.add("is-done");
    if (index === currentWorkIndex) btn.classList.add("is-current");
    btn.title = work.title;
    btn.setAttribute("aria-label", `Aller à ${work.title}`);
    btn.addEventListener("click", () => {
      const direction = index > currentWorkIndex ? "next" : "previous";
      currentWorkIndex = index;
      savePosition();
      render(direction);
    });
    els.phaseProgressTrack.appendChild(btn);
  });
}
function render(direction = "next") {
  const phase = getCurrentPhase();
  const work = getCurrentWork();
  const flat = flattenWorks();
  const flatIndex = getFlatIndex();
  const previous = flat[flatIndex - 1];
  const next = flat[flatIndex + 1];

  els.phaseLabel.textContent = `Phase ${phase.number}`;
  els.phaseTitle.textContent = phase.title;
  els.phaseQuestion.textContent = phase.question || "";
  renderPhaseProgress(phase);

  els.workStudyDate.textContent = work.studyDuration || "Durée à définir";
  els.workTitle.textContent = work.title;
  els.workAuthor.textContent = [work.author, work.date].filter(Boolean).join(" · ");
  els.workTags.innerHTML = "";
  const type = work.type || work.nature || "Œuvre";
  els.workTags.appendChild(createTag(type, `tag--type tag--type-${slugify(type)}`));
  safeArray(work.tags).slice(0, 7).forEach(tag => els.workTags.appendChild(createTag(tag)));
  els.workUtility.textContent = work.utility || "";
  renderParagraphs(els.heroPitch, work.pitch);
  renderList(els.questionList, els.questionsSection, work.centralQuestions);
  renderList(els.whyList, els.whySection, work.why);
  renderList(els.watchList, els.watchSection, work.watch);

  els.accordionGroup.innerHTML = "";
  [
    createAccordion("Ce que cette œuvre peut t’apporter", work.contribution, true),
    createAccordion("Pourquoi maintenant ?", work.nextReason),
    createAccordion("Contrepoint / risque de rejet", work.counterpoint),
    createAccordion("Contexte historique", work.context),
    createAccordion("Informations pratiques", [work.nature, work.runtime ? `Durée / longueur : ${work.runtime}` : "", phase.period ? `Phase : ${phase.period}` : ""].filter(Boolean))
  ].filter(Boolean).forEach(node => els.accordionGroup.appendChild(node));

  els.prevWorkLabel.textContent = previous ? previous.work.title : "Début";
  els.nextWorkLabel.textContent = next ? next.work.title : "Fin du parcours";
  els.prevBottomButton.disabled = !previous;
  els.nextBottomButton.disabled = !next;
  renderRoadmap();

  window.scrollTo({ top: 0, behavior: "smooth" });
  els.workView.classList.remove("is-leaving-next", "is-leaving-previous", "is-entering-next", "is-entering-previous");
  requestAnimationFrame(() => els.workView.classList.add(direction === "next" ? "is-entering-next" : "is-entering-previous"));
}
function goToFlatIndex(index) {
  const flat = flattenWorks();
  if (index < 0 || index >= flat.length) return;
  const direction = index > getFlatIndex() ? "next" : "previous";
  els.workView.classList.remove("is-entering-next", "is-entering-previous");
  els.workView.classList.add(direction === "next" ? "is-leaving-next" : "is-leaving-previous");
  setTimeout(() => {
    currentPhaseIndex = flat[index].phaseIndex;
    currentWorkIndex = flat[index].workIndex;
    savePosition();
    render(direction);
  }, 120);
}
function renderRoadmap() {
  els.roadmapList.innerHTML = "";
  roadmapData.forEach((phase, phaseIndex) => {
    const section = document.createElement("section");
    section.className = "roadmap-phase";
    section.innerHTML = `<h3>Phase ${phase.number} — ${phase.title}</h3><p>${phase.question || ""}</p>`;
    phase.works.forEach((work, workIndex) => {
      const button = document.createElement("button");
      const isActive = phaseIndex === currentPhaseIndex && workIndex === currentWorkIndex;
      const isDone = phaseIndex < currentPhaseIndex || (phaseIndex === currentPhaseIndex && workIndex < currentWorkIndex);
      button.className = `roadmap-work ${isActive ? "is-active" : ""}`;
      button.type = "button";
      button.innerHTML = `<span class="roadmap-work__status">${isActive ? "●" : isDone ? "✓" : "○"}</span><span><strong>${work.title}</strong><span>${work.type || work.nature || "Œuvre"}</span></span>`;
      button.addEventListener("click", () => {
        currentPhaseIndex = phaseIndex;
        currentWorkIndex = workIndex;
        savePosition();
        closeDrawer();
        render();
      });
      section.appendChild(button);
    });
    els.roadmapList.appendChild(section);
  });
}
function openDrawer() {
  els.drawer.classList.add("is-open");
  els.drawer.setAttribute("aria-hidden", "false");
  els.roadmapButton.style.visibility = "hidden";
}
function closeDrawer() {
  els.drawer.classList.remove("is-open");
  els.drawer.setAttribute("aria-hidden", "true");
  els.roadmapButton.style.visibility = "visible";
}
function bindEvents() {
  els.roadmapButton.addEventListener("click", openDrawer);
  els.closeDrawerButton.addEventListener("click", closeDrawer);
  els.drawerOverlay.addEventListener("click", closeDrawer);
  els.prevBottomButton.addEventListener("click", () => goToFlatIndex(getFlatIndex() - 1));
  els.nextBottomButton.addEventListener("click", () => goToFlatIndex(getFlatIndex() + 1));
  window.addEventListener("keydown", event => {
    if (event.key === "Escape") closeDrawer();
    if (event.key === "ArrowRight") goToFlatIndex(getFlatIndex() + 1);
    if (event.key === "ArrowLeft") goToFlatIndex(getFlatIndex() - 1);
  });
  let startX = 0;
  els.workView.addEventListener("touchstart", event => { startX = event.touches[0].clientX; }, { passive: true });
  els.workView.addEventListener("touchend", event => {
    const diff = event.changedTouches[0].clientX - startX;
    if (Math.abs(diff) > 70) goToFlatIndex(getFlatIndex() + (diff < 0 ? 1 : -1));
  }, { passive: true });
}
restorePosition();
bindEvents();
render();
