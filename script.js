/* =========================================================
   free.lancer page behaviour
   Reveals, the concept-study dialog, the brief builder and
   the newsletter fallback. Everything here is progressive:
   the page reads and the links work without it.
   ========================================================= */

(() => {
  "use strict";

  // Only hide/reveal content once this file has actually run.
  document.documentElement.classList.replace("no-js", "js");

  /* ---------- Reveals ---------- */
  const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          revealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
    );

    revealItems.forEach((item) => revealObserver.observe(item));

    // If the observer never fires for something already on screen,
    // make sure the first screen is never left blank.
    window.setTimeout(() => {
      revealItems.forEach((item) => {
        const rect = item.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          item.classList.add("is-in");
        }
      });
    }, 2500);
  } else {
    revealItems.forEach((item) => item.classList.add("is-in"));
  }

  /* ---------- Concept-study dialog ---------- */
  const dialog = document.getElementById("study-dialog");
  const dialogTitle = document.getElementById("study-title");
  const dialogDesc = document.getElementById("study-desc");
  const dialogFacts = document.getElementById("study-facts");
  const dialogImage = document.getElementById("study-image");
  const closeButton = dialog ? dialog.querySelector(".dialog-close") : null;
  const studyOpeners = Array.from(document.querySelectorAll("[data-study]"));
  let lastOpener = null;

  const supportsModal = dialog && typeof dialog.showModal === "function";

  function setFacts(raw) {
    dialogFacts.replaceChildren();

    (raw || "")
      .split("|")
      .reduce((pairs, value, index, all) => {
        if (index % 2 === 0) pairs.push([value, all[index + 1] || ""]);
        return pairs;
      }, [])
      .forEach(([label, value]) => {
        const group = document.createElement("div");
        const term = document.createElement("dt");
        const detail = document.createElement("dd");
        term.textContent = label;
        detail.textContent = value;
        group.append(term, detail);
        dialogFacts.append(group);
      });
  }

  function openStudy(opener) {
    if (!dialog) return;

    const data = opener.dataset;
    lastOpener = opener;

    dialogTitle.textContent = data.title || "Concept study";
    dialogDesc.textContent = data.desc || "";
    setFacts(data.facts);
    dialogImage.src = data.img || "";
    dialogImage.alt = data.alt || "";

    if (supportsModal) {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
  }

  function closeStudy() {
    if (!dialog) return;
    if (supportsModal && dialog.open) {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
      if (lastOpener) lastOpener.focus();
    }
  }

  if (dialog) {
    studyOpeners.forEach((opener) => {
      opener.addEventListener("click", () => openStudy(opener));
    });

    if (closeButton) {
      closeButton.addEventListener("click", closeStudy);
    }

    // Clicking the backdrop (not the dialog's own box) closes it.
    dialog.addEventListener("click", (event) => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      const outside =
        event.clientX < box.left ||
        event.clientX > box.right ||
        event.clientY < box.top ||
        event.clientY > box.bottom;
      if (outside) closeStudy();
    });

    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeStudy();
    });

    // Native dialogs restore focus themselves; this also covers the
    // open-attribute fallback and keeps focus on the trigger.
    dialog.addEventListener("close", () => {
      if (lastOpener) lastOpener.focus();
    });
  }

  /* ---------- Brief builder ---------- */
  const briefForm = document.getElementById("brief-form");
  const briefSummary = document.getElementById("brief-summary");
  const briefLink = document.getElementById("brief-link");
  const budgetSelect = document.getElementById("budget");
  const studioEmail = "hello@free.lancer";

  function updateBrief() {
    if (!briefForm || !briefSummary || !briefLink || !budgetSelect) return;

    const selected = briefForm.querySelector('input[name="service"]:checked');
    const service = selected ? selected.value : "Not sure yet";
    const budget = budgetSelect.value;

    briefSummary.textContent = service + " · " + budget;

    const subject = "Project brief: " + service;
    const body = [
      "Hi free.lancer,",
      "",
      "I would like to talk about a project.",
      "",
      "Service: " + service,
      "Budget: " + budget,
      "",
      "A little about the project:",
      "",
      "",
      "Thanks,",
    ].join("\n");

    briefLink.href =
      "mailto:" +
      studioEmail +
      "?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(body);
  }

  if (briefForm) {
    briefForm.addEventListener("change", updateBrief);
    updateBrief();
  }

  /* ---------- Newsletter ---------- */
  const newsletterForm = document.getElementById("newsletter-form");
  const newsletterEmail = document.getElementById("newsletter-email");
  const newsletterNote = document.getElementById("newsletter-note");

  if (newsletterForm && newsletterEmail) {
    newsletterForm.addEventListener("submit", (event) => {
      if (!newsletterEmail.checkValidity()) {
        event.preventDefault();
        newsletterEmail.reportValidity();
        return;
      }

      // The form's mailto action is the no-JS fallback. With script,
      // write a cleaner message and keep the visitor on the page.
      event.preventDefault();

      const address = newsletterEmail.value.trim();
      const subject = "Field notes subscription";
      const body =
        "Please add " +
        address +
        " to the free.lancer field notes list.\n\nSent from free.lancer.";

      window.location.href =
        "mailto:" +
        studioEmail +
        "?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(body);

      if (newsletterNote) {
        newsletterNote.textContent =
          "Opening your email app for " + address + ". No lists, no noise.";
      }
    });
  }
})();
