/**
 * Snippet para capturar leads desde cualquier landing HTML y mandarlos
 * al CRM central. Uso:
 *
 * <form data-crm-lead="nailatelier">
 *   <input name="name" required>
 *   <input name="email" type="email">
 *   <input name="phone">
 *   <textarea name="message"></textarea>
 *   <input type="text" name="company_website" style="display:none" tabindex="-1" autocomplete="off">
 *   <button type="submit">Enviar</button>
 * </form>
 * <script src="https://TU-DOMINIO-CRM/lead-form.js" data-crm-endpoint="https://TU-DOMINIO-CRM/api/leads"></script>
 *
 * El campo "company_website" es la trampa anti-bots: debe existir, pero
 * escondido, para que un humano nunca lo llene.
 */
(function () {
  var script = document.currentScript;
  var endpoint = (script && script.getAttribute("data-crm-endpoint")) || "/api/leads";
  var params = new URLSearchParams(window.location.search);

  function utm(field) {
    return params.get(field) || "";
  }

  document.querySelectorAll("form[data-crm-lead]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var data = new FormData(form);
      var body = {
        project: form.getAttribute("data-crm-lead"),
        name: data.get("name") || "",
        email: data.get("email") || "",
        phone: data.get("phone") || "",
        message: data.get("message") || "",
        company_website: data.get("company_website") || "",
        source: form.getAttribute("data-crm-source") || "website",
        utm_source: utm("utm_source"),
        utm_medium: utm("utm_medium"),
        utm_campaign: utm("utm_campaign"),
        fbclid: utm("fbclid"),
        landing_url: window.location.href,
      };

      var submitButton = form.querySelector("[type=submit]");
      if (submitButton) submitButton.disabled = true;

      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
        .then(function (res) {
          if (!res.ok) throw new Error("request failed");
          form.dispatchEvent(new CustomEvent("crm-lead-success"));
          form.reset();
        })
        .catch(function () {
          form.dispatchEvent(new CustomEvent("crm-lead-error"));
        })
        .finally(function () {
          if (submitButton) submitButton.disabled = false;
        });
    });
  });
})();
