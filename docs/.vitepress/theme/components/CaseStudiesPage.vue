<script setup lang="ts">
import { ref, computed } from 'vue'
import { withBase } from 'vitepress'

const addProjectUrl =
  'https://github.com/orgs/lightningdevkit/discussions/1554'

interface Project {
  name: string
  url: string
  img: string
  desc: string
  cats: string[]
  caseStudy?: string
}

/* Three highlighted projects shown above the full grid. */
const featured: Project[] = [
  {
    name: 'Alby Hub',
    url: 'https://albyhub.com/',
    img: '/img/alby-logo.webp',
    desc: 'Equipped with its own lightning node, ready to connect you to numerous applications',
    cats: ['web'],
    caseStudy:
      '/blog/alby-hub-uses-ldk-to-offer-a-self-custodial-lightning-wallet-for-everyone/',
  },
  {
    name: 'Cash App',
    url: 'https://cash.app/',
    img: '/img/cashapp-badge.svg',
    desc: 'Send and spend, bank, and buy stocks or bitcoin',
    cats: ['custodial'],
    caseStudy:
      '/blog/cashapp-enables-lightning-withdrawals-and-deposits-using-ldk/',
  },
  {
    name: 'Bitkit',
    url: 'https://bitkit.to/',
    img: '/img/bitkit.svg',
    desc: 'Hands you the keys to your money, profile, contacts, and web accounts',
    cats: ['mobile'],
    caseStudy:
      '/blog/bitkit-uses-ldk-to-build-the-ultimate-alternative-to-custodial-wallets/',
  },
]

const categories = [
  { key: 'all', label: 'All' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'web', label: 'Web' },
  { key: 'desktop', label: 'Desktop' },
  { key: 'custodial', label: 'Custodial' },
  { key: 'infra', label: 'Infrastructure' },
  { key: 'misc', label: 'Misc' },
]

/* Full, deduplicated project list (alphabetical). Categories mirror the
   original v1 CodeSwitcher tabs; a project may belong to several. */
const projects: Project[] = [
  {
    name: '10101',
    url: 'https://10101.finance/',
    img: '/img/10101.png',
    desc: 'An on and off-chain wallet infused with trading',
    cats: ['mobile'],
  },
  {
    name: 'Aciedo',
    url: 'https://github.com/aciedo',
    img: '/img/aciedo.svg',
    desc: 'A financial infrastructure suite for developers and users',
    cats: ['infra'],
  },
  {
    name: 'Alby Hub',
    url: 'https://albyhub.com/',
    img: '/img/alby-logo.webp',
    desc: 'With its own lightning node, connecting you to numerous apps',
    cats: ['web'],
    caseStudy:
      '/blog/alby-hub-uses-ldk-to-offer-a-self-custodial-lightning-wallet-for-everyone/',
  },
  {
    name: 'AtomicDEX',
    url: 'https://atomicdex.io/en/',
    img: '/img/atomic.png',
    desc: 'A multi-coin wallet, bridge, and DEX rolled into one app',
    cats: ['desktop'],
  },
  {
    name: 'AtomicLightningExchange',
    url: 'https://github.com/SurajNaidu0/AtomicLightningExchange',
    img: '/img/github.png',
    desc: 'AtomicLightningExchange enables trustless swaps between Lightning Bitcoin and on-chain Bitcoin using atomic swaps',
    cats: ['misc'],
  },
  {
    name: 'Bitkit',
    url: 'https://bitkit.to/',
    img: '/img/bitkit.png',
    desc: 'The ultimate bitcoin toolkit, take charge of your digital life',
    cats: ['mobile'],
    caseStudy:
      '/blog/bitkit-uses-ldk-to-build-the-ultimate-alternative-to-custodial-wallets/',
  },
  {
    name: 'c=',
    url: 'https://cequals.xyz/',
    img: '/img/c=.png',
    desc: 'Tools and services that connect people to the Lightning Network',
    cats: ['infra'],
  },
  {
    name: 'Cash App',
    url: 'https://cash.app/',
    img: '/img/cash-app-logo.png',
    desc: 'Send and spend, bank, and buy stocks or bitcoin',
    cats: ['custodial'],
    caseStudy:
      '/blog/cashapp-enables-lightning-withdrawals-and-deposits-using-ldk/',
  },
  {
    name: 'EttaWallet',
    url: 'https://github.com/EttaWallet/EttaWallet',
    img: '/img/etta.png',
    desc: 'A simple open-source wallet with a strong bias toward usability, accessibility, and UX',
    cats: ['mobile'],
  },
  {
    name: 'Fedimint',
    url: 'https://fedimint.org/',
    img: '/img/fedimint.png',
    desc: 'Server application for managing federated ecash and a self-custodial lightning node',
    cats: ['infra'],
    caseStudy:
      '/blog/fedimint-lightning-gateway-uses-ldk-node-to-simplify-deployment-and-liquidity-management/',
  },
  {
    name: 'Gossiper',
    url: 'https://github.com/fiksn/gossiper',
    img: '/img/github.png',
    desc: 'Lightning Gossip Ingestion',
    cats: ['misc'],
  },
  {
    name: 'Hydranet',
    url: 'https://hydranet.ai/',
    img: '/img/hydranet.png',
    desc: 'A layer 3 decentralized exchange, allowing trading with native tokens between blockchains',
    cats: ['desktop'],
  },
  {
    name: 'Kumuly',
    url: 'https://twitter.com/kumulydev',
    img: '/img/kumuly.png',
    desc: 'Colombian-based mobile bitcoin and Lightning wallet',
    cats: ['mobile'],
  },
  {
    name: 'kuutamo',
    url: 'https://github.com/kuutamolabs/lightning-knd',
    img: '/img/kuutamo.png',
    desc: 'A turn-key, end-to-end solution for running self-hosted nodes, anywhere',
    cats: ['infra'],
  },
  {
    name: 'ldk-sample with Tor',
    url: 'https://github.com/TonyGiorgio/ldk-sample-tor',
    img: '/img/github.png',
    desc: 'An experimentation with tor that adapts the ldk-sample node',
    cats: ['misc'],
  },
  {
    name: 'Lexe',
    url: 'https://github.com/lexe-app/lexe-public',
    img: '/img/lexe.png',
    desc: 'Managed non-custodial Lightning nodes inside secure hardware',
    cats: ['infra'],
  },
  {
    name: 'Lightspark',
    url: 'https://www.lightspark.com/',
    img: '/img/lightspark-logo.svg',
    desc: 'Enterprise-grade, fast, secure payments on Lightning',
    cats: ['infra'],
    caseStudy: '/blog/how-we-built-our-sparknodes-using-ldk/',
  },
  {
    name: 'LNDK',
    url: 'https://github.com/lndk-org/lndk',
    img: '/img/lndk.png',
    desc: 'A standalone daemon that aims to externally implement BOLT 12 functionality for LND',
    cats: ['infra'],
  },
  {
    name: 'LQWD',
    url: 'https://www.lqwdtech.com/',
    img: '/img/lqwd.png',
    desc: 'At the forefront of building transaction infrastructure on the Lightning Network',
    cats: ['infra'],
    caseStudy: '/blog/lqwd-liquidity-provider-get-liquidity-when-you-need-it/',
  },
  {
    name: 'Mercury',
    url: 'https://mercurywallet.com/',
    img: '/img/mercury.png',
    desc: 'A layer 2 bitcoin wallet that enables users to send and swap bitcoin privately',
    cats: ['mobile', 'desktop'],
  },
  {
    name: 'Mutiny',
    url: 'https://mutinywallet.com/',
    img: '/img/mutiny.png',
    desc: 'A web-first unstoppable bitcoin wallet for everyone',
    cats: ['web'],
    caseStudy: '/blog/mutiny-uses-ldk-the-first-lightning-wallet-for-the-web/',
  },
  {
    name: 'rgb-lightning-node',
    url: 'https://github.com/RGB-Tools/rgb-lightning-node',
    img: '/img/github.png',
    desc: 'LN node based on ldk-sample supporting RGB assets',
    cats: ['misc'],
  },
  {
    name: 'rust-dlc',
    url: 'https://github.com/p2pderivatives/rust-dlc',
    img: '/img/github.png',
    desc: 'A Rust library for working with Discreet Log Contracts',
    cats: ['misc'],
  },
  {
    name: 'Sensei',
    url: 'https://github.com/L2-Technology/sensei',
    img: '/img/sensei.png',
    desc: 'A Lightning node implementation for everyone',
    cats: ['infra'],
    caseStudy:
      '/blog/sensei-uses-ldk-to-build-a-multi-node-lightning-server-application/',
  },
  {
    name: 'TEOS',
    url: 'https://github.com/talaia-labs/rust-teos',
    img: '/img/teos.png',
    desc: 'A bitcoin watchtower with a specific focus on Lightning',
    cats: ['infra'],
    caseStudy: '/blog/teos-uses-ldk-to-build-open-source-watchtower/',
  },
  {
    name: 'The Hidden LN',
    url: 'https://github.com/BitcoinDevShop/hidden-lightning-network',
    img: '/img/github.png',
    desc: 'Probes the Lightning Network for the detection of private channels',
    cats: ['misc'],
  },
  {
    name: 'uMlando',
    url: 'https://github.com/ConorOkus/uMlando-wallet',
    img: '/img/github.png',
    desc: 'An educational Android demo wallet',
    cats: ['misc'],
  },
  {
    name: 'Velas',
    url: 'https://www.velascommerce.com/',
    img: '/img/velas.png',
    desc: 'A way to integrate Lightning into websites, mobile applications, and more',
    cats: ['mobile'],
  },
  {
    name: 'VLS',
    url: 'https://vls.tech/',
    img: '/img/vls.png',
    desc: 'Separates Lightning private keys and security rule validation from nodes, into a discrete signing device',
    cats: ['infra'],
  },
  {
    name: 'Voltage',
    url: 'https://voltage.cloud/',
    img: '/img/voltage.png',
    desc: 'Enterprise-grade infrastructure for the Lightning Network',
    cats: ['infra'],
  },
]

const active = ref('all')

const filtered = computed(() =>
  active.value === 'all'
    ? projects
    : projects.filter((p) => p.cats.includes(active.value))
)
</script>

<template>
  <div class="cs-page">
    <header class="cs-hero">
      <p class="cs-tagline">Bitcoin applications building with LDK</p>
      <a
        :href="addProjectUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="cs-add-btn"
      >
        Add your project
      </a>
    </header>

    <div class="case-studies cs-featured">
      <div v-for="p in featured" :key="p.name" class="case-study-item">
        <a :href="p.url" target="_blank" rel="noopener noreferrer">
          <img :src="withBase(p.img)" :alt="p.name" />
        </a>
        <h3>
          <a :href="p.url" target="_blank" rel="noopener noreferrer">{{
            p.name
          }}</a>
        </h3>
        <p>{{ p.desc }}</p>
        <a v-if="p.caseStudy" :href="withBase(p.caseStudy)" class="nav-link">
          View case study
        </a>
      </div>
    </div>

    <h2 class="cs-meet-heading">Meet the projects building with LDK</h2>

    <div class="cs-tabs" role="tablist">
      <button
        v-for="c in categories"
        :key="c.key"
        class="cs-tab"
        :class="{ active: active === c.key }"
        role="tab"
        :aria-selected="active === c.key"
        @click="active = c.key"
      >
        {{ c.label }}
      </button>
    </div>

    <div class="case-studies">
      <div v-for="p in filtered" :key="p.name" class="case-study-item">
        <a :href="p.url" target="_blank" rel="noopener noreferrer">
          <img :src="withBase(p.img)" :alt="p.name" />
        </a>
        <h3>
          <a :href="p.url" target="_blank" rel="noopener noreferrer">{{
            p.name
          }}</a>
        </h3>
        <p>{{ p.desc }}</p>
        <a v-if="p.caseStudy" :href="withBase(p.caseStudy)" class="nav-link">
          View case study
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Scale the whole page up 25%. zoom (unlike transform: scale) reflows,
   so the layout stays within the content column — every element, image,
   gap and dashed divider grows proportionally. */
.cs-page {
  zoom: 1.25;
}

.cs-hero {
  text-align: center;
  padding: 16px 0 48px;
}

.cs-tagline {
  margin: 0 0 24px;
  font-size: 26px;
  color: var(--vp-c-text-2);
}

.cs-add-btn {
  display: inline-block;
  padding: 10px 22px;
  border-radius: 8px;
  background: var(--vp-c-brand-1);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.2s;
}

.cs-add-btn:hover {
  background: var(--vp-c-brand-2);
}

/* Featured row sits flush below the hero; the shared .case-studies rule
   adds its own top margin for the grid below. */
.cs-featured {
  margin-top: 0;
}

.cs-meet-heading {
  margin: 56px 0 0;
  padding: 0;
  border: 0;
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.cs-tabs {
  display: flex;
  flex-wrap: wrap;
  /* Tight row-gap so wrapped rows (on mobile) sit close together, while
     keeping a comfortable column-gap between tabs on the same row. */
  gap: 10px 24px;
  margin: 20px 0 4px;
}

.cs-tab {
  padding: 4px 0;
  border: 0;
  border-bottom: 2px solid transparent;
  background: none;
  font-family: inherit;
  font-size: 15px;
  color: var(--vp-c-brand-1);
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
}

.cs-tab:hover {
  color: var(--vp-c-brand-2);
}

.cs-tab.active {
  color: var(--vp-c-text-1);
  border-bottom-color: var(--vp-c-brand-1);
  font-weight: 600;
}
</style>
