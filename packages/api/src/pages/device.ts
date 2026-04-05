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
      background: #0D1219;
      color: #e5e5e5;
      font-family: "Quattrocento Sans", sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      position: relative;
    }

    body::before {
      content: "";
      position: fixed;
      inset: 0;
      background: url("/auth-bg.webp") center center / cover no-repeat;
      opacity: 0.08;
      pointer-events: none;
      z-index: 0;
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
      position: relative;
      z-index: 1;
    }

    .brand {
      text-align: center;
      margin-bottom: 2rem;
    }

    .brand .wordmark {
      height: 40px;
      margin: 0 auto 0.75rem;
      display: block;
    }

    .brand .subtitle {
      color: #7a8a9e;
      font-size: 0.85rem;
      margin-top: 0.25rem;
      font-family: "Inconsolata", monospace;
    }

    .card {
      background: #1E2D4A;
      border: 1px solid #2a3d5a;
      border-radius: 12px;
      padding: 2rem;
      position: relative;
      overflow: hidden;
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
      color: #9aabbc;
      font-size: 0.9rem;
      margin-bottom: 1.5rem;
      line-height: 1.5;
    }

    input[type="text"],
    input[type="email"],
    input[type="password"] {
      display: block;
      width: 100%;
      background: #0D1219;
      border: 1px solid #2a3d5a;
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
      border-color: #2EFFD1;
    }

    input::placeholder {
      color: #4a5d73;
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
      background: #EF9F28;
      color: #0D1219;
    }

    .btn-secondary {
      background: transparent;
      border: 1px solid #2a3d5a;
      color: #e5e5e5;
      margin-top: 0.5rem;
    }

    .btn-danger {
      background: transparent;
      border: 1px solid #C47830;
      color: #C47830;
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
      background: #0D1219;
      border: 1px solid #2a3d5a;
      border-radius: 8px;
      padding: 1.25rem;
      text-align: center;
      font-family: "Inconsolata", monospace;
      font-size: 2rem;
      font-weight: 700;
      letter-spacing: 0.25em;
      color: #2EFFD1;
      margin-bottom: 1.25rem;
    }

    .meta {
      color: #7a8a9e;
      font-size: 0.85rem;
      margin-bottom: 0.5rem;
    }

    .meta strong {
      color: #b0c4de;
    }

    .toggle {
      text-align: center;
      color: #7a8a9e;
      font-size: 0.85rem;
      margin-top: 1rem;
    }

    .toggle a {
      color: #2EFFD1;
      text-decoration: none;
      font-weight: 700;
    }

    .toggle a:hover { text-decoration: underline; }

    .error-msg {
      background: rgba(196, 120, 48, 0.15);
      border: 1px solid rgba(196, 120, 48, 0.4);
      border-radius: 8px;
      padding: 0.75rem 1rem;
      color: #EF9F28;
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
      color: #7a8a9e;
      font-size: 0.85rem;
      font-family: "Inconsolata", monospace;
    }

    .spinner {
      position: absolute;
      inset: 0;
      background: rgba(30, 45, 74, 0.85);
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
      border: 3px solid #2a3d5a;
      border-top-color: #2EFFD1;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .divider {
      border: none;
      border-top: 1px solid #2a3d5a;
      margin: 1.25rem 0;
    }

    .btn-social {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      width: 100%;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-family: "Quattrocento Sans", sans-serif;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      transition: opacity 0.15s;
      border: none;
      margin-bottom: 0.5rem;
    }

    .btn-social:hover { opacity: 0.9; }
    .btn-social:disabled { opacity: 0.5; cursor: not-allowed; }

    .btn-social svg { width: 18px; height: 18px; flex-shrink: 0; }

    .btn-github {
      background: #24292e;
      color: #fff;
    }

    .btn-google {
      background: #fff;
      color: #333;
      border: 1px solid #2a3d5a;
    }

    .btn-passkey {
      background: transparent;
      border: 1px solid #2a3d5a;
      color: #e5e5e5;
      margin-top: 0.25rem;
    }

    .btn-passkey svg { width: 18px; height: 18px; }

    .divider-text {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin: 1rem 0;
    }

    .divider-text::before,
    .divider-text::after {
      content: "";
      flex: 1;
      height: 1px;
      background: #2a3d5a;
    }

    .divider-text span {
      color: #7a8a9e;
      font-size: 0.8rem;
      white-space: nowrap;
      font-family: "Inconsolata", monospace;
    }

    .otp-hint {
      color: #9aabbc;
      font-size: 0.85rem;
      margin-bottom: 1rem;
      line-height: 1.5;
    }

    .otp-hint strong {
      color: #e5e5e5;
    }

    .otp-code-input {
      font-size: 1.5rem;
      text-align: center;
      letter-spacing: 0.35em;
      padding: 0.85rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="brand">
      <img src="/wordmark-dark.png" alt="autter" class="wordmark">
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

      <!-- State: login -->
      <div id="s-login" class="state">
        <p class="heading">Sign in to continue</p>
        <p class="desc">Choose how you'd like to authenticate.</p>
        <div id="auth-error" class="error-msg"></div>

        <!-- Social auth -->
        <button id="btn-github" class="btn-social btn-github">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
          Continue with GitHub
        </button>
        <button id="btn-google" class="btn-social btn-google">
          <svg viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continue with Google
        </button>

        <div class="divider-text"><span>or use email</span></div>

        <!-- Email OTP: enter email -->
        <div id="otp-email-step">
          <input id="otp-email" type="email" placeholder="Email address" required>
          <button id="btn-send-otp" class="btn-primary">Send verification code</button>
        </div>

        <!-- Email OTP: enter code -->
        <div id="otp-verify-step" style="display:none">
          <p class="otp-hint">Enter the 6-digit code sent to <strong id="otp-sent-to"></strong></p>
          <input id="otp-code" type="text" maxlength="6" placeholder="000000" class="otp-code-input" autocomplete="one-time-code" inputmode="numeric">
          <button id="btn-verify-otp" class="btn-primary" style="margin-top:0.5rem">Verify code</button>
          <p class="toggle"><a href="#" id="btn-otp-back">Use a different email</a></p>
        </div>

        <!-- Passkey -->
        <div id="passkey-row" style="display:none">
          <div class="divider-text"><span>or</span></div>
          <button id="btn-passkey" class="btn-social btn-passkey">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M12 10v12"/><path d="m15 19 3 3"/><path d="m15 13-3 3-3-3"/></svg>
            Sign in with Passkey
          </button>
        </div>
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

  <script src="https://unpkg.com/@simplewebauthn/browser@13.2.2/dist/bundle/index.umd.min.js"></script>
  <script>
    (function () {
      var API = "/api/auth";
      var userCode = "";
      var userEmail = "";

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
      var authError = document.getElementById("auth-error");
      var enterError = document.getElementById("enter-error");
      var displayCode = document.getElementById("display-code");
      var displayUser = document.getElementById("display-user");
      var btnApprove = document.getElementById("btn-approve");
      var btnDeny = document.getElementById("btn-deny");
      var doneIcon = document.getElementById("done-icon");
      var doneMsg = document.getElementById("done-msg");
      var doneHint = document.getElementById("done-hint");
      var globalError = document.getElementById("global-error");
      var btnRetry = document.getElementById("btn-retry");

      // OTP refs
      var otpEmailStep = document.getElementById("otp-email-step");
      var otpVerifyStep = document.getElementById("otp-verify-step");
      var otpEmailInput = document.getElementById("otp-email");
      var otpCodeInput = document.getElementById("otp-code");
      var otpSentTo = document.getElementById("otp-sent-to");

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

      function showAuthError(msg) {
        authError.textContent = msg;
        authError.classList.add("visible");
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

      // -- Verify device code --
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

        // Show passkey button if browser supports WebAuthn
        if (typeof PublicKeyCredential !== "undefined") {
          document.getElementById("passkey-row").style.display = "block";
        }
      }

      // -- Social OAuth (GitHub / Google) --
      async function signInSocial(provider) {
        authError.classList.remove("visible");
        loading(true);
        try {
          var res = await api("/sign-in/social", {
            method: "POST",
            body: JSON.stringify({
              provider: provider,
              callbackURL: "/device?user_code=" + encodeURIComponent(userCode),
            }),
          });
          if (res.url) {
            window.location.href = res.url;
          } else {
            loading(false);
            showAuthError("Failed to start " + provider + " sign-in.");
          }
        } catch (err) {
          loading(false);
          showAuthError(err.message || "Failed to start " + provider + " sign-in.");
        }
      }

      document.getElementById("btn-github").addEventListener("click", function () {
        signInSocial("github");
      });

      document.getElementById("btn-google").addEventListener("click", function () {
        signInSocial("google");
      });

      // -- Email OTP --
      document.getElementById("btn-send-otp").addEventListener("click", async function () {
        var email = otpEmailInput.value.trim();
        if (!email) return;
        authError.classList.remove("visible");
        loading(true);
        try {
          await api("/email-otp/send-verification-otp", {
            method: "POST",
            body: JSON.stringify({ email: email, type: "sign-in" }),
          });
          userEmail = email;
          otpSentTo.textContent = email;
          otpEmailStep.style.display = "none";
          otpVerifyStep.style.display = "block";
          otpCodeInput.focus();
        } catch (err) {
          showAuthError(err.message || "Failed to send code.");
        }
        loading(false);
      });

      // Auto-submit OTP when 6 digits entered
      otpCodeInput.addEventListener("input", function () {
        this.value = this.value.replace(/[^0-9]/g, "").slice(0, 6);
        if (this.value.length === 6) {
          document.getElementById("btn-verify-otp").click();
        }
      });

      document.getElementById("btn-verify-otp").addEventListener("click", async function () {
        var code = otpCodeInput.value.trim();
        if (code.length < 6) return;
        authError.classList.remove("visible");
        loading(true);
        try {
          var result = await api("/sign-in/email-otp", {
            method: "POST",
            body: JSON.stringify({ email: userEmail, otp: code }),
          });
          userEmail = (result.user && result.user.email) || userEmail;
          showApprove();
        } catch (err) {
          showAuthError(err.message || "Invalid code. Please try again.");
          otpCodeInput.value = "";
          otpCodeInput.focus();
        }
        loading(false);
      });

      document.getElementById("btn-otp-back").addEventListener("click", function (e) {
        e.preventDefault();
        otpEmailStep.style.display = "block";
        otpVerifyStep.style.display = "none";
        otpCodeInput.value = "";
        authError.classList.remove("visible");
      });

      // -- Passkey --
      document.getElementById("btn-passkey").addEventListener("click", async function () {
        authError.classList.remove("visible");
        loading(true);
        try {
          var options = await api("/passkey/generate-authenticate-options", { method: "POST" });
          var credential = await SimpleWebAuthnBrowser.startAuthentication(options);
          var result = await api("/passkey/verify-authentication", {
            method: "POST",
            body: JSON.stringify({ credential: credential }),
          });
          if (result.user) {
            userEmail = result.user.email || "";
          }
          showApprove();
        } catch (err) {
          // User cancelling the browser prompt is not a real error
          if (err && err.message && err.message.toLowerCase().includes("cancel")) {
            loading(false);
            return;
          }
          showAuthError(err.message || "Passkey sign-in failed.");
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
        doneIcon.style.color = approved ? "#2EFFD1" : "#C47830";
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
