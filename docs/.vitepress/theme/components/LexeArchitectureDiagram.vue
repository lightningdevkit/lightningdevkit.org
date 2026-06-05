<script setup lang="ts">
/*
 * Lexe architecture diagram — recreated from the Claude Design handoff
 * ("Lexe Architecture Diagram.html"). The whole diagram is a single inline
 * SVG so connector lines layer correctly over the nested container fills.
 *
 * Adapted for this VitePress site:
 *  - theming follows the site's global light/dark switch (`html.dark`)
 *    instead of the prototype's own data-theme toggle + localStorage;
 *  - typography inherits the site font (the prototype's proprietary
 *    Cash Sans is not shipped here).
 *
 * Protocol color-coding: amber = Lightning / Noise transport,
 * blue = TLS family, thick blue = TLS-in-TLS, dashed gray = datastore link.
 */
</script>

<template>
  <figure class="lexe-arch">
    <div class="figure">
      <svg
        class="diagram"
        viewBox="0 0 1280 812"
        role="img"
        aria-label="Lexe architecture diagram showing user Lightning nodes running inside an SGX enclave within the Lexe Cloud, connected to the Lightning Network, the app, and user cloud storage."
      >
        <defs>
          <symbol id="lexe-bolt" viewBox="0 0 24 24"><path d="M13 2 L4.5 13.5 H11 L9 22 L19.5 9.5 H13 Z" fill="currentColor"/></symbol>
          <symbol id="lexe-lock" viewBox="0 0 24 24"><path d="M15 10V7a3 3 0 1 0-6 0v3h6ZM5 20h14v-8H5v8Zm14-10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2V7a5 5 0 0 1 10 0v3h2Z" fill="currentColor"/></symbol>
          <filter id="lexe-soft" x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="var(--shadow)"/>
          </filter>
        </defs>

        <!-- ============ CONTAINERS (fills + borders, drawn first) ============ -->
        <g>
          <rect x="150" y="205" width="600" height="565" rx="18" fill="var(--lexe-fill)" stroke="var(--lexe-stroke)" stroke-width="2.4"/>
          <rect x="180" y="425" width="510" height="315" rx="14" fill="var(--vm-fill)" stroke="var(--vm-stroke)" stroke-width="1.6"/>
          <rect x="212" y="476" width="446" height="242" rx="12" fill="var(--sgx-fill)" stroke="var(--sgx-stroke)" stroke-width="1.6"/>
        </g>

        <!-- ============ CONNECTORS (over container fills, under leaf boxes) ============ -->
        <g fill="none" stroke-linecap="round" stroke-linejoin="round">
          <!-- Lightning Network -> LSP (amber) -->
          <path d="M445,170 V260" stroke="var(--amber)" stroke-width="2.6"/>
          <!-- LSP -> Node : Noise (amber) -->
          <path d="M445,380 V582" stroke="var(--amber)" stroke-width="2.6"/>
          <!-- Node -> Reverse Proxy : TLS (blue) -->
          <path d="M590,634 H626 V318 H666" stroke="var(--blue)" stroke-width="2.6"/>
          <!-- Reverse Proxy -> App : TLS-in-TLS (thick blue) -->
          <path d="M828,318 H884 V476 H940" stroke="var(--blue-deep)" stroke-width="5.4"/>
          <!-- Persistence rail : HTTPS/TLS (blue) -->
          <path d="M445,686 V786 M1004,578 V786 M1040,748 V786 M445,786 H1040" stroke="var(--blue)" stroke-width="2.6"/>
          <!-- Lexe DB reference (dashed gray) -->
          <path d="M224,370 V634 H300" stroke="var(--dash)" stroke-width="1.8" stroke-dasharray="2 7"/>
        </g>

        <!-- ============ LEAF NODES ============ -->
        <!-- Lexe DB cylinder -->
        <g>
          <ellipse cx="224" cy="358" rx="42" ry="12" fill="var(--db-fill)" stroke="var(--db-stroke)" stroke-width="1.6"/>
          <rect x="182" y="294" width="84" height="64" fill="var(--db-fill)"/>
          <line x1="182" y1="294" x2="182" y2="358" stroke="var(--db-stroke)" stroke-width="1.6"/>
          <line x1="266" y1="294" x2="266" y2="358" stroke="var(--db-stroke)" stroke-width="1.6"/>
          <ellipse cx="224" cy="294" rx="42" ry="12" fill="var(--db-fill)" stroke="var(--db-stroke)" stroke-width="1.6"/>
        </g>

        <!-- LSP -->
        <rect x="360" y="260" width="170" height="120" rx="16" fill="var(--lsp-fill)" stroke="var(--lsp-stroke)" stroke-width="1.4" filter="url(#lexe-soft)"/>
        <use href="#lexe-bolt" x="470" y="305" width="32" height="32" style="color:var(--amber)"/>

        <!-- Reverse Proxy -->
        <rect x="666" y="270" width="162" height="96" rx="12" fill="var(--rp-fill)" stroke="var(--rp-stroke)" stroke-width="2" filter="url(#lexe-soft)"/>

        <!-- App (phone) -->
        <rect x="940" y="372" width="128" height="206" rx="24" fill="var(--app-fill)" stroke="var(--app-stroke)" stroke-width="2" filter="url(#lexe-soft)"/>
        <rect x="986" y="389" width="36" height="5" rx="2.5" fill="var(--app-stroke)" opacity=".7"/>

        <!-- Node -->
        <rect x="300" y="582" width="290" height="104" rx="16" fill="var(--node-fill)" stroke="var(--node-stroke)" stroke-width="2" filter="url(#lexe-soft)"/>
        <!-- LDK badge -->
        <g>
          <rect x="316" y="606" width="96" height="56" rx="11" fill="var(--chip-fill)" stroke="var(--chip-stroke)" stroke-width="1.4"/>
          <use href="#lexe-bolt" x="328" y="621" width="26" height="26" style="color:var(--chip-stroke)"/>
          <text class="t-chip" x="385" y="634" text-anchor="middle" dominant-baseline="middle">LDK</text>
        </g>
        <use href="#lexe-bolt" x="540" y="618" width="32" height="32" style="color:var(--amber)"/>

        <!-- Lightning Network cloud -->
        <g>
          <g fill="var(--ln-stroke)">
            <circle cx="388" cy="120" r="42.5"/><circle cx="448" cy="86" r="56.5"/><circle cx="512" cy="112" r="46.5"/>
            <circle cx="356" cy="132" r="30.5"/><circle cx="548" cy="134" r="32.5"/><circle cx="470" cy="140" r="42.5"/>
          </g>
          <g fill="var(--ln-fill)">
            <circle cx="388" cy="120" r="40"/><circle cx="448" cy="86" r="54"/><circle cx="512" cy="112" r="44"/>
            <circle cx="356" cy="132" r="28"/><circle cx="548" cy="134" r="30"/><circle cx="470" cy="140" r="40"/>
          </g>
        </g>

        <!-- User cloud storage cloud -->
        <g>
          <g fill="var(--stor-stroke)">
            <circle cx="995" cy="700" r="40.5"/><circle cx="1045" cy="672" r="52.5"/><circle cx="1100" cy="696" r="42.5"/>
            <circle cx="965" cy="712" r="26.5"/><circle cx="1130" cy="714" r="28.5"/><circle cx="1062" cy="718" r="38.5"/>
          </g>
          <g fill="var(--stor-fill)">
            <circle cx="995" cy="700" r="38"/><circle cx="1045" cy="672" r="50"/><circle cx="1100" cy="696" r="40"/>
            <circle cx="965" cy="712" r="24"/><circle cx="1130" cy="714" r="26"/><circle cx="1062" cy="718" r="36"/>
          </g>
        </g>

        <!-- ============ LABELS (top layer) ============ -->
        <g>
          <!-- container titles -->
          <text class="t-ctitle" x="174" y="237" text-anchor="start">Lexe Cloud</text>
          <text class="t-ctitle" x="200" y="456" text-anchor="start">Lexe VM</text>
          <use href="#lexe-lock" x="230" y="489" width="17" height="17" style="color:var(--ink)"/>
          <text class="t-ctitle" x="254" y="503" text-anchor="start">SGX Enclave</text>

          <!-- leaf labels -->
          <text class="t-db" x="224" y="320" text-anchor="middle">Lexe</text>
          <text class="t-db" x="224" y="338" text-anchor="middle">DB</text>

          <text class="t-node" x="445" y="320" text-anchor="middle" dominant-baseline="middle" fill="var(--ink)">LSP</text>

          <text class="t-node" x="476" y="635" text-anchor="middle" dominant-baseline="middle" fill="var(--node-fg)">Node</text>

          <text class="t-ctitle" x="747" y="312" text-anchor="middle" font-size="18">Reverse</text>
          <text class="t-ctitle" x="747" y="335" text-anchor="middle" font-size="18">Proxy</text>

          <text class="t-node" x="1004" y="476" text-anchor="middle" dominant-baseline="middle" font-size="22" fill="var(--app-fg)">App</text>

          <text class="t-cloud" x="450" y="100" text-anchor="middle" fill="var(--ln-fg)">Lightning</text>
          <text class="t-cloud" x="450" y="128" text-anchor="middle" fill="var(--ln-fg)">Network</text>

          <text class="t-cloud" x="1048" y="690" text-anchor="middle" font-size="19" fill="var(--stor-fg)">User cloud</text>
          <text class="t-cloud" x="1048" y="715" text-anchor="middle" font-size="19" fill="var(--stor-fg)">storage</text>

          <!-- connector labels -->
          <text class="t-link" x="456" y="486" text-anchor="start" fill="var(--amber)">Noise</text>
          <text class="t-link" x="640" y="470" text-anchor="start" fill="var(--blue)">TLS</text>
          <text class="t-link" x="896" y="402" text-anchor="start" fill="var(--blue-deep)">TLS-in-TLS</text>
          <text class="t-link" x="700" y="764" text-anchor="middle" fill="var(--blue)">HTTPS/TLS</text>
        </g>
      </svg>

      <div class="legend">
        <span class="lg"><svg width="34" height="10" viewBox="0 0 34 10"><line x1="1" y1="5" x2="33" y2="5" stroke="var(--amber)" stroke-width="2.6" stroke-linecap="round"/></svg>Lightning channel &amp; Noise transport</span>
        <span class="lg"><svg width="34" height="10" viewBox="0 0 34 10"><line x1="1" y1="5" x2="33" y2="5" stroke="var(--blue)" stroke-width="2.6" stroke-linecap="round"/></svg>Encrypted transport (TLS / HTTPS)</span>
        <span class="lg"><svg width="34" height="10" viewBox="0 0 34 10"><line x1="1" y1="5" x2="33" y2="5" stroke="var(--blue-deep)" stroke-width="5.4" stroke-linecap="round"/></svg>TLS-in-TLS, end-to-end to the app</span>
        <span class="lg"><svg width="34" height="10" viewBox="0 0 34 10"><line x1="1" y1="5" x2="33" y2="5" stroke="var(--dash)" stroke-width="1.8" stroke-dasharray="2 6" stroke-linecap="round"/></svg>Datastore reference</span>
      </div>

      <p class="footnote">TLS terminates <em>inside</em> the enclave; persisted state is encrypted before it leaves over the network. The shared <code>NetworkGraph</code> and <code>ProbabilisticScorer</code> live once per enclave, while each user's keys and channel state stay isolated.</p>
    </div>
  </figure>
</template>

<style scoped>
.lexe-arch {
  margin: 28px 0;
}

.figure {
  border-radius: 22px;
  background: var(--panel);
  padding: 26px 26px 18px;
  transition: background 0.25s ease;
}

.diagram {
  width: 100%;
  height: auto;
  display: block;
}

.diagram text {
  font-family: inherit;
}

.t-ctitle { font-weight: 500; font-size: 20px; fill: var(--ink); }
.t-node { font-weight: 500; font-size: 25px; }
.t-db { font-weight: 500; font-size: 13.5px; fill: var(--ink-2); }
.t-cloud { font-weight: 500; font-size: 21px; }
.t-link {
  font-weight: 500; font-size: 16px;
  paint-order: stroke; stroke: var(--page); stroke-width: 6px; stroke-linejoin: round;
}
.t-chip { font-weight: 600; font-size: 18px; letter-spacing: 0.02em; fill: var(--chip-stroke); }

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 26px;
  margin-top: 22px;
  padding: 0 4px;
}
.lg {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13.5px;
  color: var(--ink-2);
  font-weight: 400;
}
.lg svg { flex: none; }

.footnote {
  margin-top: 16px;
  font-size: 12.5px;
  color: var(--ink-3);
  line-height: 1.5;
}
.footnote code {
  font-family: var(--vp-font-family-mono, monospace);
  font-size: 11.5px;
  color: var(--ink-2);
}
</style>

<!--
  Palette lives in a NON-scoped block on purpose: the dark override needs
  the real ancestor selector `html.dark .lexe-arch`. In a scoped block Vue
  rewrites `:global(html.dark) .lexe-arch` and drops the `.lexe-arch` part,
  so the dark vars would land on `<html>` and lose to the light vars set
  directly on the element. Both selectors target the unique `.lexe-arch`
  class, so nothing else on the page is affected.
-->
<style>
.lexe-arch {
  --page: #ffffff; --panel: #ffffff; --ink: #0c0c0c; --ink-2: #5b5b5b; --ink-3: #8a8a8a;
  --amber: #e08a0b; --blue: #2c6be0; --blue-deep: #1f56c7; --dash: #b7b7b7;
  --lexe-stroke: #2b2b2b; --lexe-fill: #ffffff;
  --vm-fill: #fafafa; --vm-stroke: #9a9a9a;
  --sgx-fill: #f0f0f0; --sgx-stroke: #9a9a9a;
  --lsp-fill: #eaeaea; --lsp-stroke: #cfcfcf;
  --node-fill: #dee9ff; --node-stroke: #2c6be0; --node-fg: #16306e;
  --rp-fill: #ffffff; --rp-stroke: #2b2b2b;
  --app-fill: #cfe0ff; --app-stroke: #2c6be0; --app-fg: #16306e;
  --db-fill: #f2f2f2; --db-stroke: #8c8c8c;
  --stor-fill: #dce7ff; --stor-stroke: #2c6be0; --stor-fg: #16306e;
  --ln-fill: #ffffff; --ln-stroke: #6b6b6b; --ln-fg: #1c1c1c;
  --chip-fill: #ffffff; --chip-stroke: #2c6be0;
  --hair: #e7e7e7; --shadow: rgba(0, 0, 0, 0.1);
}

html.dark .lexe-arch {
  /* Base surfaces follow the site's dark theme background so the figure
     blends with the page instead of reading as a black box. Nested
     containers step lighter from there to preserve the depth hierarchy. */
  --page: var(--vp-c-bg); --panel: var(--vp-c-bg); --ink: #ffffff; --ink-2: #b6b6b6; --ink-3: #7a7a7a;
  --amber: #f6a623; --blue: #5e92f2; --blue-deep: #5e92f2; --dash: #5a5a5a;
  --lexe-stroke: #9a9a9a; --lexe-fill: #202027;
  --vm-fill: #272730; --vm-stroke: #565656;
  --sgx-fill: #2f2f39; --sgx-stroke: #565656;
  --lsp-fill: #34343d; --lsp-stroke: #3a3a3a;
  --node-fill: #15294e; --node-stroke: #5e92f2; --node-fg: #d6e4ff;
  --rp-fill: var(--vp-c-bg); --rp-stroke: #9a9a9a;
  --app-fill: #15294e; --app-stroke: #5e92f2; --app-fg: #d6e4ff;
  --db-fill: #2a2a31; --db-stroke: #6a6a6a;
  --stor-fill: #15294e; --stor-stroke: #5e92f2; --stor-fg: #d6e4ff;
  --ln-fill: var(--vp-c-bg); --ln-stroke: #8a8a8a; --ln-fg: #ededed;
  --chip-fill: var(--vp-c-bg); --chip-stroke: #5e92f2;
  --hair: var(--vp-c-divider); --shadow: rgba(0, 0, 0, 0);
}
</style>
