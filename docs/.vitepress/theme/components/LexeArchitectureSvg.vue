<script setup lang="ts">
/*
 * The Lexe architecture diagram as a single inline SVG, factored out so the
 * inline figure and the click-to-zoom overlay in LexeArchitectureDiagram.vue
 * render from one source. The palette CSS variables are supplied by an
 * ancestor carrying `.lexe-palette`; they inherit into this SVG in either
 * context. See LexeArchitectureDiagram.vue for the topology notes.
 */
</script>

<template>
  <svg
    class="diagram"
    viewBox="0 0 1280 852"
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
      <!-- Persistence : Node encrypts state and writes it out to user cloud storage (blue) -->
      <path d="M445,686 V818 H1048 V752" stroke="var(--blue)" stroke-width="2.6"/>
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
      <text class="t-link" x="724" y="824" text-anchor="middle" fill="var(--blue)">HTTPS/TLS &middot; encrypted persistence</text>
    </g>
  </svg>
</template>

<style scoped>
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
</style>
