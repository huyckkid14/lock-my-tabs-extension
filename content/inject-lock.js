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

/* not used anywhere... keep file as backup 

-- unused 
if (document.getElementById("lockSetupModal")) {
  // already exists, don't run again
} else {
  const modal = document.createElement("div");
  modal.id = "lockSetupModal";
  modal.innerHTML = `
    <div style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:#000a;z-index:999999;display:flex;align-items:center;justify-content:center;">
      <div style="background:white;padding:20px;border-radius:8px;text-align:center;max-width:300px;width:90%;">
        <h3>Lock My Tab</h3>
        <input id="passInput" type="password" placeholder="Password" style="width:100%;padding:6px;margin:5px 0;" />
        <input id="minInput" type="number" placeholder="Minutes" style="width:48%;padding:6px;" />
        <input id="secInput" type="number" placeholder="Seconds" style="width:48%;padding:6px;float:right;" />
        <div style="margin-top:10px;">
          <button id="cancelBtn">Cancel</button>
          <button id="okBtn">Okay</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById("cancelBtn").onclick = () => modal.remove();
  document.getElementById("okBtn").onclick = async () => {
    const pass = document.getElementById("passInput").value;
    const min = parseInt(document.getElementById("minInput").value) || 0;
    const sec = parseInt(document.getElementById("secInput").value) || 0;
    if (!pass) return alert("Password required.");
    const timeout = min * 60 + sec;

    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(pass));
    const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    chrome.storage.local.set({
      locked: false,
      passwordHash: hashHex,
      timeout: timeout,
      lastActivity: Date.now(),
      url: window.location.href
    });

    modal.remove();
  };
}
unused --
*/