/*!
 * Lock My Tabs v1.5.1
 * Copyright (c) 2026 Jaewon Lee (huyckkid14)
 * Email: bestorangelover@gmail.com
 *
 * MIT License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

const ORIGIN = window.location.origin;

// ===============================
// Countdown Overlay (Singleton)
// ===============================
let lockTimeout = null;
let countdownInterval = null;
let lockDeadline = null;

function getOverlay() {
  let overlay = document.getElementById("lock-countdown-overlay");
  if (overlay) return overlay;

  overlay = document.createElement("div");
  overlay.id = "lock-countdown-overlay";
  Object.assign(overlay.style, {
    position: "fixed",
    bottom: "16px",
    right: "16px",
    padding: "10px 14px",
    background: "rgba(0,0,0,0.85)",
    color: "#fff",
    borderRadius: "10px",
    fontSize: "13px",
    fontFamily: "Arial, sans-serif",
    zIndex: 999998,
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    pointerEvents: "none",
    display: "none"
  });

  document.body.appendChild(overlay);
  return overlay;
}

function hideCountdown() {
  clearInterval(countdownInterval);
  countdownInterval = null;
  lockDeadline = null;

  const overlay = document.getElementById("lock-countdown-overlay");
  if (overlay) overlay.style.display = "none";
}

function startCountdown(durationMs) {
  const overlay = getOverlay();
  overlay.style.display = "block";

  lockDeadline = Date.now() + durationMs;

  clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    const remaining = lockDeadline - Date.now();

    if (remaining <= 0) {
      overlay.textContent = "🔒 Locking now…";
      clearInterval(countdownInterval);
      return;
    }

    const sec = Math.ceil(remaining / 1000);
    const min = Math.floor(sec / 60);
    const s = sec % 60;

    overlay.textContent =
      `🔒 Auto-lock in ${min}:${s.toString().padStart(2, "0")}`;
  }, 250);
}


// — State Helpers —
function getPassword() {
  return sessionStorage.getItem("password");
}
function getDuration() {
  return parseInt(sessionStorage.getItem("duration"), 10) || 0;
}
function isLocked() {
  return sessionStorage.getItem("locked") === "true";
}
function setLocked(val) {
  if (val) sessionStorage.setItem("locked", "true");
  else sessionStorage.removeItem("locked");
}

// — Clear Site Data & Reload —
function clearAndReload() {
  chrome.runtime.sendMessage(
    { action: "clearSiteData", origin: ORIGIN },
    () => {
      sessionStorage.clear();
      location.reload();
    }
  );
}

// — Modal Utility —
function showModal(render) {
  // ❌ kill any existing modal first
  document.getElementById("lock-my-tabs-modal")?.remove();

  hideCountdown(); // 🔒 modal takes priority

  const modal = document.createElement("div");
  modal.id = "lock-my-tabs-modal";
  Object.assign(modal.style, {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    zIndex: 999999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Arial, sans-serif"
  });

  const box = document.createElement("div");
  Object.assign(box.style, {
    background: "#fff",
    padding: "25px",
    borderRadius: "12px",
    maxWidth: "400px",
    width: "90%",
    textAlign: "center"
  });

  render(box);
  modal.appendChild(box);
  document.body.appendChild(modal);
}

// helper to detect if any modal is shown
function isModalOpen() {
  return document.getElementById("lock-my-tabs-modal") !== null;
}
// — Countdown Overlay —


function createCountdownOverlay() {
  if (document.getElementById("lock-countdown-overlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "lock-countdown-overlay";
  Object.assign(overlay.style, {
    position: "fixed",
    bottom: "16px",
    right: "16px",
    padding: "10px 14px",
    background: "rgba(0,0,0,0.8)",
    color: "#fff",
    borderRadius: "10px",
    fontSize: "13px",
    fontFamily: "Arial, sans-serif",
    zIndex: 999998,
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    pointerEvents: "none",
    display: "none"
  });

  overlay.textContent = "🔒 Locking in …";
  document.body.appendChild(overlay);
}

function startCountdown(durationMs) {
  createCountdownOverlay();

  const overlay = document.getElementById("lock-countdown-overlay");
  overlay.style.display = "block";

  lockDeadline = Date.now() + durationMs;

  clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    const remaining = lockDeadline - Date.now();

    if (remaining <= 0) {
      overlay.textContent = "🔒 Locking now…";
      clearInterval(countdownInterval);
      return;
    }

    const totalSec = Math.ceil(remaining / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;

    overlay.textContent =
      `🔒 Auto-lock in ${min}:${sec.toString().padStart(2, "0")}`;
  }, 250);
}

function hideCountdown() {
  clearInterval(countdownInterval);
  const overlay = document.getElementById("lock-countdown-overlay");
  if (overlay) overlay.style.display = "none";
}


// — Prompts —
// 1) Lock settings
function promptLock() {
  showModal(box => {
    box.innerHTML = `
      <h2 style="margin-bottom:15px; color:#4a90e2;">🔒 Lock My Tabs</h2>
      <div style="margin-bottom:12px; text-align:left;">
        <label style="font-size:14px; color:#555;">
          Password:<br>
          <input
            type="password"
            id="lock-password"
            style="
              width:100%;
              padding:8px;
              margin-top:4px;
              border:1px solid #ccc;
              border-radius:4px;
              box-sizing:border-box;
            "
          >
        </label>
      </div>
      <div style="margin-bottom:20px; text-align:left;">
        <label style="font-size:14px; color:#555;">
          Inactivity Duration:<br>
          <input
            id="min"
            type="number" min="0"
            value="0"
            style="width:60px; padding:6px; margin-right:6px; border:1px solid #ccc; border-radius:4px;"
          > min
          <input
            id="sec"
            type="number" min="0" max="59"
            value="30"
            style="width:60px; padding:6px; margin:0 0 0 6px; border:1px solid #ccc; border-radius:4px;"
          > sec
        </label>
      </div>
      <div>
        <button
          id="apply-lock"
          style="
            padding:10px 20px;
            border:none;
            border-radius:4px;
            background:#5cb85c;
            color:white;
            font-size:14px;
            cursor:pointer;
          "
        >Lock</button>
        <button
          id="cancel-lock"
          style="
            padding:10px 20px;
            margin-left:10px;
            border:none;
            border-radius:4px;
            background:#d9534f;
            color:white;
            font-size:14px;
            cursor:pointer;
          "
        >Cancel</button>
      </div>
    `;
    box.querySelector("#apply-lock").addEventListener("click", applyLock);
    box.querySelector("#cancel-lock").addEventListener("click", () => {
      document.getElementById("lock-my-tabs-modal")?.remove();
    });
  });
}

// 2) Locked-page
function showLockedPrompt() {
  hideCountdown();
  showModal(box => {
    box.innerHTML = `
      <h2 style="color:#e67e22;">🔐 Tab Locked</h2>
      <div style="margin:15px 0; text-align:left;">
        <label style="font-size:14px; color:#555;">
          Password:<br>
          <input
            type="password"
            id="unlock-password"
            style="
              width:100%;
              padding:8px;
              margin-top:4px;
              border:1px solid #ccc;
              border-radius:4px;
              box-sizing:border-box;
            "
          >
        </label>
      </div>
      <button
        id="unlock-btn"
        style="
          padding:10px 20px;
          border:none;
          border-radius:4px;
          background:#27ae60;
          color:white;
          font-size:14px;
          cursor:pointer;
        "
      >Unlock</button>
      <div style="margin-top:12px;">
        <a href="#" id="forgot-link" style="color:#2980b9; font-size:13px;">Forgot your password?</a>
      </div>
      <p style="margin-top:15px; color:#888; font-size:12px;">
        It will re-lock after inactivity. To remove settings, press Ctrl+Alt+U.
      </p>
    `;
    box.querySelector("#unlock-btn").addEventListener("click", unlockTab);
    box.querySelector("#forgot-link").addEventListener("click", e => {
      e.preventDefault();
      showForgotPassword();
    });
  });
}

// 3) Forgot password
function showForgotPassword() {
  showModal(box => {
    box.innerHTML = `
      <h2 style="color:#c0392b;">❓ Forgot Password</h2>
      <p style="color:#555;">Clear this site’s data and reload?</p>
      <button
        id="confirm-clear"
        style="
          padding:8px 16px;
          border:none;
          border-radius:4px;
          background:#d35400;
          color:white;
          font-size:14px;
          cursor:pointer;
          margin-right:8px;
        "
      >Yes, clear & reload</button>
      <button
        id="cancel-clear"
        style="
          padding:8px 16px;
          border:none;
          border-radius:4px;
          background:#7f8c8d;
          color:white;
          font-size:14px;
          cursor:pointer;
        "
      >Nevermind</button>
    `;
    box.querySelector("#confirm-clear").addEventListener("click", clearAndReload);
    box.querySelector("#cancel-clear").addEventListener("click", showLockedPrompt);
  });
}

// 4) Remove lock settings
function showRemoveLockSettings() {
  showModal(box => {
    box.innerHTML = `
      <h2 style="color:#c0392b;">⚙️ Remove Lock</h2>
      <div style="margin:10px 0; text-align:left;">
        <label style="font-size:14px; color:#555;">
          Confirm Password:<br>
          <input
            type="password"
            id="remove-password"
            style="
              width:100%;
              padding:8px;
              margin-top:4px;
              border:1px solid #ccc;
              border-radius:4px;
              box-sizing:border-box;
            "
          >
        </label>
      </div>
      <button
        id="remove-lock"
        style="
          padding:8px 16px;
          border:none;
          border-radius:4px;
          background:#e74c3c;
          color:white;
          font-size:14px;
          cursor:pointer;
          margin-right:8px;
        "
      >Remove</button>
      <button
        id="cancel-remove"
        style="
          padding:8px 16px;
          border:none;
          border-radius:4px;
          background:#7f8c8d;
          color:white;
          font-size:14px;
          cursor:pointer;
        "
      >Nevermind</button>
    `;
    box.querySelector("#remove-lock").addEventListener("click", removeLockSetting);
    box.querySelector("#cancel-remove").addEventListener("click", showLockedPrompt);
  });
}

let lastDebuggerDetection = 0;

setInterval(() => {
  // Only check when tab is locked AND a modal is open
  if (!(isLocked() && isModalOpen())) return;

  const start = performance.now();
  debugger;
  const duration = performance.now() - start;

  if (duration > 100) {
    const now = Date.now();
    if (now - lastDebuggerDetection > 3000) {
      lastDebuggerDetection = now;

      // 🧨 Clear session
      sessionStorage.clear();

      // 🛑 Replace entire page
      document.body.innerHTML = `
        <div style="height:100vh;display:flex;align-items:center;justify-content:center;
                    font-family:sans-serif;font-size:20px;color:red;background:white;">
          🚨 DevTools Detected! Tab security triggered.
        </div>`;

      // 🔄 Optional reload:
      // location.reload();
    }
  }
}, 1000);

// — Handlers —
// Apply lock
function applyLock() {
  const pass = document.getElementById("lock-password").value;
  const mins = parseInt(document.getElementById("min").value) || 0;
  const secs = parseInt(document.getElementById("sec").value) || 0;
  const duration = (mins * 60 + secs) * 1000;
  if (!pass || duration < 1000) {
    return alert("Enter a password and ≥1 second duration.");
  }
  sessionStorage.setItem("password", pass);
  sessionStorage.setItem("duration", duration.toString());
  setLocked(true);
  resetTimer(duration);
  document.getElementById("lock-my-tabs-modal")?.remove();
}

// Unlock
function unlockTab() {
  const attempt = document.getElementById("unlock-password").value;
  if (attempt === getPassword()) {
    setLocked(false);
    resetTimer(getDuration());
    document.getElementById("lock-my-tabs-modal")?.remove();
    hideCountdown();

  } else {
    alert("Wrong password!");
    showLockedPrompt();
  }
}

// Remove lock
function removeLockSetting() {
  const attempt = document.getElementById("remove-password").value;
  if (attempt === getPassword()) {
    sessionStorage.removeItem("password");
    sessionStorage.removeItem("duration");
    setLocked(false);
    clearTimeout(lockTimeout);
    document.getElementById("lock-my-tabs-modal")?.remove();
  } else {
    alert("Wrong password!");
    showRemoveLockSettings();
  }
}

// Reset inactivity timer
function resetTimer(delay) {
  clearTimeout(lockTimeout);

  if (!delay || delay <= 0) {
    hideCountdown();
    return;
  }

  setLocked(true);

  // 🔁 Reset BOTH timeout + overlay from same moment
  startCountdown(delay);

  lockTimeout = setTimeout(() => {
    hideCountdown();
    showLockedPrompt();
  }, delay);
}

// — Event Listeners —
// Keyboard
document.addEventListener("keydown", e => {
  const key = e.key.toUpperCase();

  if (getDuration()) { // If lock is armed (even if not locked yet)
    if (
      (e.ctrlKey && e.shiftKey && ["I", "J", "C", "U"].includes(key)) || // DevTools combos
      e.key === "F12"
    ) {
      e.preventDefault();
      console.warn("[LockTab] DevTools shortcuts are disabled while timer is active.");
    }
  }
});

document.addEventListener("contextmenu", e => {
  if (getDuration()) {
    e.preventDefault(); // Disable right-click
  }
});

// Mouse/keyboard resets timer when locked (even if modal closed)
// — Activity resets timer (SAFE, NON-STACKING) —
["mousemove", "mousedown", "keydown", "touchstart"].forEach(evt => {
  window.addEventListener(
    evt,
    () => {
      // Only reset when lock is armed AND no modal is open
      if (isLocked() && !isModalOpen()) {
        resetTimer(getDuration());
      }
    },
    { passive: true }
  );
});


// On load: if locked, start timer and show prompt
if (getPassword() && isLocked()) {
  resetTimer(getDuration());
  showLockedPrompt();
}

// Global hotkeys for opening modals
document.addEventListener("keydown", e => {
  const key = e.key.toUpperCase();

  // Ctrl+Alt+L → open lock settings
  if (!isModalOpen() && e.ctrlKey && e.altKey && key === "L") {
    e.preventDefault();
    promptLock();
  }

  // Ctrl+Alt+U → open remove-lock settings
  if (!isModalOpen() && e.ctrlKey && e.altKey && key === "U") {
    e.preventDefault();
    if (getPassword()) showRemoveLockSettings();
  }
});
