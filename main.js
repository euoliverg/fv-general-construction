(() => {
  const PHONE = "14133778841";
  const EMAIL = "sanaguaray37@icloud.com";

  const form = document.getElementById("ticket");
  const preview = document.getElementById("preview");
  const status = document.getElementById("status");
  const mailAlt = document.getElementById("mail-alt");
  const allTrades = document.querySelectorAll('input[name="trade"], input[name="trade-pick"]');

  // Ticket number from today's date: FV-YYMMDD
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const suffix = Math.random().toString(36).slice(2, 5).toUpperCase();
  const ticketNo = `FV-${String(d.getFullYear()).slice(2)}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${suffix}`;
  document.getElementById("ticket-no").textContent = ticketNo;
  document.getElementById("year").textContent = d.getFullYear();

  // Hero lines and estimate chips are the same ticket: keep them in sync
  allTrades.forEach((box) => {
    box.addEventListener("change", () => {
      allTrades.forEach((other) => {
        if (other !== box && other.value === box.value) other.checked = box.checked;
      });
      compose();
    });
  });

  const field = (name) => form.elements[name];
  const selectedTrades = () =>
    [...form.querySelectorAll('input[name="trade"]:checked')].map((b) => b.value);

  function message() {
    const v = (n) => field(n).value.trim();
    const lines = [`Hi FV General Construction, I'd like an estimate. (Ticket ${ticketNo})`];
    if (v("name")) lines.push(`Name: ${v("name")}`);
    if (v("phone")) lines.push(`Phone: ${v("phone")}`);
    if (v("town")) lines.push(`Town: ${v("town")}`);
    const t = selectedTrades();
    if (t.length) lines.push(`Trades: ${t.join(", ")}`);
    lines.push(`When: ${field("when").value}`);
    if (v("notes")) lines.push(`Details: ${v("notes")}`);
    return lines.join("\n");
  }

  function compose() {
    const text = message();
    preview.textContent = text;
    mailAlt.href = `mailto:${EMAIL}?subject=${encodeURIComponent("Estimate request")}&body=${encodeURIComponent(text)}`;
  }

  form.addEventListener("input", (e) => {
    compose();
    const wrap = e.target.closest(".tf");
    if (wrap && wrap.classList.contains("is-invalid")) validate(e.target);
  });
  form.addEventListener("change", compose);

  const rules = {
    name: (v) => v.trim().length > 1,
    phone: (v) => v.replace(/\D/g, "").length >= 10,
    town: (v) => v.trim().length > 1,
  };

  function validate(input) {
    const ok = rules[input.name] ? rules[input.name](input.value) : true;
    const wrap = input.closest(".tf");
    wrap.classList.toggle("is-invalid", !ok);
    if (ok) {
      input.removeAttribute("aria-invalid");
      input.removeAttribute("aria-describedby");
    } else {
      input.setAttribute("aria-invalid", "true");
      input.setAttribute("aria-describedby", `${input.id}-err`);
    }
    return ok;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const invalid = ["name", "phone", "town"].map((n) => field(n)).filter((el) => !validate(el));
    if (invalid.length) {
      invalid[0].focus();
      status.textContent = "A few fields need a fix before the ticket can go out.";
      form.classList.remove("is-sent");
      return;
    }
    const url = `https://wa.me/${PHONE}?text=${encodeURIComponent(message())}`;
    form.classList.add("is-sent");
    status.textContent = "Opening WhatsApp with your ticket. If it didn't open, call 413-377-8841.";
    const win = window.open(url, "_blank", "noopener");
    if (!win) window.location.href = url;
  });

  // "Start my estimate" lands the cursor in the first empty field
  document.querySelectorAll("[data-goto-estimate]").forEach((link) => {
    link.addEventListener("click", () => {
      setTimeout(() => field("name").focus({ preventScroll: true }), 600);
    });
  });

  compose();
})();
