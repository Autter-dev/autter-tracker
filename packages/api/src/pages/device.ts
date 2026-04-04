import type { Context } from "hono";
import type { Env } from "../types";

export async function devicePage(c: Context<{ Bindings: Env }>) {
  return c.html(PAGE_HTML);
}

const PAGE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Authorize Device &mdash; autter</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inconsolata:wght@400;700&family=Quattrocento:wght@400;700&family=Quattrocento+Sans:wght@400;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background: #111111;
      color: #e5e5e5;
      font-family: "Quattrocento Sans", sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }

    h1, h2, h3 {
      font-family: "Quattrocento", serif;
    }

    code, .mono {
      font-family: "Inconsolata", monospace;
    }

    .container {
      width: 100%;
      max-width: 440px;
    }

    .brand {
      text-align: center;
      margin-bottom: 2rem;
    }

    .brand .logo-placeholder {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      background: #1a1a1a;
      border: 1px dashed #333;
      margin: 0 auto 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .brand h1 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #22c55e;
      letter-spacing: 0.02em;
    }

    .brand .subtitle {
      color: #737373;
      font-size: 0.85rem;
      margin-top: 0.25rem;
      font-family: "Inconsolata", monospace;
    }

    .card {
      background: #1a1a1a;
      border: 1px solid #262626;
      border-radius: 12px;
      padding: 2rem;
      position: relative;
    }

    .state { display: none; }
    .state.active { display: block; }

    .state > p.heading {
      font-family: "Quattrocento", serif;
      font-size: 1.1rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: #e5e5e5;
    }

    .state > p.desc {
      color: #a3a3a3;
      font-size: 0.9rem;
      margin-bottom: 1.5rem;
      line-height: 1.5;
    }

    input[type="text"],
    input[type="email"],
    input[type="password"] {
      display: block;
      width: 100%;
      background: #111111;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 0.75rem 1rem;
      color: #e5e5e5;
      font-family: "Inconsolata", monospace;
      font-size: 1rem;
      outline: none;
      transition: border-color 0.15s;
      margin-bottom: 0.75rem;
    }

    input:focus {
      border-color: #22c55e;
    }

    input::placeholder {
      color: #525252;
    }

    .code-input {
      font-size: 1.75rem;
      text-align: center;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      padding: 1rem;
    }

    button {
      display: block;
      width: 100%;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-family: "Quattrocento Sans", sans-serif;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      transition: opacity 0.15s, background 0.15s;
      border: none;
    }

    button:hover { opacity: 0.9; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }

    .btn-primary {
      background: #22c55e;
      color: #111111;
    }

    .btn-secondary {
      background: transparent;
      border: 1px solid #333;
      color: #e5e5e5;
      margin-top: 0.5rem;
    }

    .btn-danger {
      background: transparent;
      border: 1px solid #dc2626;
      color: #dc2626;
      margin-top: 0.5rem;
    }

    .btn-row {
      display: flex;
      gap: 0.75rem;
    }

    .btn-row button {
      flex: 1;
    }

    .code-display {
      background: #111111;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 1.25rem;
      text-align: center;
      font-family: "Inconsolata", monospace;
      font-size: 2rem;
      font-weight: 700;
      letter-spacing: 0.25em;
      color: #22c55e;
      margin-bottom: 1.25rem;
    }

    .meta {
      color: #737373;
      font-size: 0.85rem;
      margin-bottom: 0.5rem;
    }

    .meta strong {
      color: #a3a3a3;
    }

    .toggle {
      text-align: center;
      color: #737373;
      font-size: 0.85rem;
      margin-top: 1rem;
    }

    .toggle a {
      color: #22c55e;
      text-decoration: none;
      font-weight: 700;
    }

    .toggle a:hover { text-decoration: underline; }

    .error-msg {
      background: rgba(220, 38, 38, 0.1);
      border: 1px solid rgba(220, 38, 38, 0.3);
      border-radius: 8px;
      padding: 0.75rem 1rem;
      color: #fca5a5;
      font-size: 0.85rem;
      margin-bottom: 1rem;
      display: none;
    }

    .error-msg.visible { display: block; }

    .done-icon {
      text-align: center;
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .done-msg {
      text-align: center;
      font-family: "Quattrocento", serif;
      font-size: 1.1rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .done-hint {
      text-align: center;
      color: #737373;
      font-size: 0.85rem;
      font-family: "Inconsolata", monospace;
    }

    .spinner {
      position: absolute;
      inset: 0;
      background: rgba(26, 26, 26, 0.85);
      border-radius: 12px;
      display: none;
      align-items: center;
      justify-content: center;
    }

    .spinner.visible {
      display: flex;
    }

    .spinner::after {
      content: "";
      width: 28px;
      height: 28px;
      border: 3px solid #333;
      border-top-color: #22c55e;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .divider {
      border: none;
      border-top: 1px solid #262626;
      margin: 1.25rem 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="brand">
      <div class="logo-placeholder">
        <!-- mascot placeholder -->
        <span style="opacity:0.4">&#x1f9a6;</span>
      </div>
      <h1>autter</h1>
      <div class="subtitle">device authorization</div>
    </div>

    <div class="card">
      <!-- State: enter code -->
      <div id="s-enter" class="state">
        <p class="heading">Enter your device code</p>
        <p class="desc">Paste the code shown in your terminal to authorize this device.</p>
        <div id="enter-error" class="error-msg"></div>
        <input id="code-input" class="code-input" type="text" maxlength="9" placeholder="XXXX-XXXX" autocomplete="off" spellcheck="false" autofocus>
        <button id="btn-verify" class="btn-primary" style="margin-top:0.5rem">Continue</button>
      </div>

      <!-- State: login / signup -->
      <div id="s-login" class="state">
        <p class="heading" id="auth-heading">Sign in to continue</p>
        <p class="desc">You need to be signed in to authorize this device.</p>
        <div id="auth-error" class="error-msg"></div>
        <form id="auth-form">
          <div id="name-field" style="display:none">
            <input name="name" type="text" placeholder="Name">
          </div>
          <input name="email" type="email" placeholder="Email" required>
          <input name="password" type="password" placeholder="Password" required>
          <button type="submit" id="btn-auth" class="btn-primary">Sign in</button>
        </form>
        <p class="toggle">
          <span id="toggle-text">Don't have an account?</span>
          <a href="#" id="toggle-auth">Sign up</a>
        </p>
      </div>

      <!-- State: approve -->
      <div id="s-approve" class="state">
        <p class="heading">Authorize this device?</p>
        <p class="desc">Confirm you want to grant access to the autter CLI.</p>
        <div class="code-display" id="display-code"></div>
        <div class="meta">Application: <strong>autter CLI</strong></div>
        <div class="meta" id="display-user"></div>
        <hr class="divider">
        <div class="btn-row">
          <button id="btn-approve" class="btn-primary">Approve</button>
          <button id="btn-deny" class="btn-danger">Deny</button>
        </div>
      </div>

      <!-- State: done -->
      <div id="s-done" class="state">
        <div class="done-icon" id="done-icon"></div>
        <p class="done-msg" id="done-msg"></p>
        <p class="done-hint" id="done-hint"></p>
      </div>

      <!-- State: error -->
      <div id="s-error" class="state">
        <p class="heading">Something went wrong</p>
        <div id="global-error" class="error-msg visible" style="margin-top:1rem"></div>
        <button id="btn-retry" class="btn-secondary" style="margin-top:1rem">Try again</button>
      </div>

      <!-- Loading overlay -->
      <div id="spinner" class="spinner"></div>
    </div>
  </div>

  <script>
    (function () {
      var API = "/api/auth";
      var userCode = "";
      var userEmail = "";
      var isSignUp = false;

      // DOM refs
      var states = {
        enter: document.getElementById("s-enter"),
        login: document.getElementById("s-login"),
        approve: document.getElementById("s-approve"),
        done: document.getElementById("s-done"),
        error: document.getElementById("s-error"),
      };
      var spinner = document.getElementById("spinner");
      var codeInput = document.getElementById("code-input");
      var btnVerify = document.getElementById("btn-verify");
      var authForm = document.getElementById("auth-form");
      var authHeading = document.getElementById("auth-heading");
      var authError = document.getElementById("auth-error");
      var enterError = document.getElementById("enter-error");
      var nameField = document.getElementById("name-field");
      var btnAuth = document.getElementById("btn-auth");
      var toggleAuth = document.getElementById("toggle-auth");
      var toggleText = document.getElementById("toggle-text");
      var displayCode = document.getElementById("display-code");
      var displayUser = document.getElementById("display-user");
      var btnApprove = document.getElementById("btn-approve");
      var btnDeny = document.getElementById("btn-deny");
      var doneIcon = document.getElementById("done-icon");
      var doneMsg = document.getElementById("done-msg");
      var doneHint = document.getElementById("done-hint");
      var globalError = document.getElementById("global-error");
      var btnRetry = document.getElementById("btn-retry");

      function show(name) {
        Object.keys(states).forEach(function (k) {
          states[k].classList.toggle("active", k === name);
        });
      }

      function loading(on) {
        spinner.classList.toggle("visible", on);
      }

      function formatCode(code) {
        var c = code.replace(/-/g, "").toUpperCase();
        if (c.length > 4) return c.slice(0, 4) + "-" + c.slice(4);
        return c;
      }

      async function api(path, opts) {
        opts = opts || {};
        var res = await fetch(API + path, Object.assign({
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }, opts));
        var data;
        try { data = await res.json(); } catch (e) { data = {}; }
        if (!res.ok) {
          var err = new Error(data.error_description || data.message || "Request failed");
          err.code = data.error || "unknown";
          err.status = res.status;
          throw err;
        }
        return data;
      }

      // -- Code input formatting --
      codeInput.addEventListener("input", function () {
        var raw = this.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 8);
        if (raw.length > 4) {
          this.value = raw.slice(0, 4) + "-" + raw.slice(4);
        } else {
          this.value = raw;
        }
      });

      codeInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          btnVerify.click();
        }
      });

      // -- Verify code --
      btnVerify.addEventListener("click", function () {
        var raw = codeInput.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
        if (raw.length < 8) {
          enterError.textContent = "Please enter the full 8-character code.";
          enterError.classList.add("visible");
          return;
        }
        enterError.classList.remove("visible");
        verifyCode(raw);
      });

      async function verifyCode(code) {
        userCode = code;
        loading(true);
        try {
          await api("/device?user_code=" + encodeURIComponent(code));
        } catch (err) {
          loading(false);
          if (err.code === "expired_token") {
            showError("This code has expired. Run autter-tracker login again in your terminal.");
          } else {
            showError("Invalid code. Check the code in your terminal and try again.");
          }
          return;
        }

        // Check existing session
        try {
          var session = await api("/get-session");
          if (session && session.user) {
            userEmail = session.user.email;
            showApprove();
            loading(false);
            return;
          }
        } catch (e) {
          // Not logged in
        }

        loading(false);
        show("login");
      }

      // -- Auth form --
      toggleAuth.addEventListener("click", function (e) {
        e.preventDefault();
        isSignUp = !isSignUp;
        nameField.style.display = isSignUp ? "block" : "none";
        btnAuth.textContent = isSignUp ? "Sign up" : "Sign in";
        authHeading.textContent = isSignUp ? "Create an account" : "Sign in to continue";
        toggleText.textContent = isSignUp ? "Already have an account?" : "Don't have an account?";
        toggleAuth.textContent = isSignUp ? "Sign in" : "Sign up";
        authError.classList.remove("visible");
      });

      authForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        authError.classList.remove("visible");
        var formData = new FormData(authForm);
        var endpoint = isSignUp ? "/sign-up/email" : "/sign-in/email";
        var body = {
          email: formData.get("email"),
          password: formData.get("password"),
        };
        if (isSignUp) body.name = formData.get("name") || formData.get("email").split("@")[0];

        loading(true);
        try {
          var result = await api(endpoint, {
            method: "POST",
            body: JSON.stringify(body),
          });
          userEmail = (result.user && result.user.email) || body.email;
          showApprove();
        } catch (err) {
          authError.textContent = err.message || "Authentication failed. Please try again.";
          authError.classList.add("visible");
        }
        loading(false);
      });

      // -- Approve / Deny --
      function showApprove() {
        displayCode.textContent = formatCode(userCode);
        displayUser.innerHTML = "Signed in as: <strong>" + escapeHtml(userEmail) + "</strong>";
        show("approve");
      }

      btnApprove.addEventListener("click", async function () {
        loading(true);
        try {
          await api("/device/approve", {
            method: "POST",
            body: JSON.stringify({ userCode: userCode }),
          });
          showDone(true);
        } catch (err) {
          showError(err.message || "Failed to approve. Please try again.");
        }
        loading(false);
      });

      btnDeny.addEventListener("click", async function () {
        loading(true);
        try {
          await api("/device/deny", {
            method: "POST",
            body: JSON.stringify({ userCode: userCode }),
          });
          showDone(false);
        } catch (err) {
          showError(err.message || "Failed to deny. Please try again.");
        }
        loading(false);
      });

      // -- Done --
      function showDone(approved) {
        doneIcon.textContent = approved ? "\\u2713" : "\\u2717";
        doneIcon.style.color = approved ? "#22c55e" : "#dc2626";
        doneMsg.textContent = approved ? "Device authorized" : "Authorization denied";
        doneHint.textContent = "You can close this tab and return to your terminal.";
        show("done");
      }

      // -- Error --
      function showError(msg) {
        globalError.textContent = msg;
        show("error");
      }

      btnRetry.addEventListener("click", function () {
        codeInput.value = "";
        enterError.classList.remove("visible");
        show("enter");
        codeInput.focus();
      });

      // -- Helpers --
      function escapeHtml(str) {
        var div = document.createElement("div");
        div.textContent = str;
        return div.innerHTML;
      }

      // -- Init --
      var params = new URLSearchParams(window.location.search);
      var prefilled = params.get("user_code");
      if (prefilled) {
        verifyCode(prefilled.replace(/[^a-zA-Z0-9]/g, "").toUpperCase());
      } else {
        show("enter");
      }
    })();
  </script>
</body>
</html>`;
