---
cases: true
sidebar: false
heroText: "Case Studies"
tagline: "A list of bitcoin applications building with LDK. If you’re using LDK we’d love to hear about your experience!"
actionText: "Let us know!"
actionLink: "https://github.com/orgs/lightningdevkit/discussions/1554"
features:
  - title: "The Eye of Satoshi"
    details: "A watchtower with a specific focus on lightning"
    image: "/"
    imageAlt: ""
    caseStudyLink: "/blog/teos-uses-ldk-to-build-open-source-watchtower/"
  - title: "Cash App"
    details: "The easy way to send, spend, bank, and invest"
    image: "/img/cash-app-logo.png"
    imageAlt: "cash app logo"
    caseStudyLink: "/blog/cashapp-enables-lightning-withdrawals-and-deposits-using-ldk/"
  - title: "Sensei"
    details: "A lightning node implementation for everyone"
    image: "/"
    imageAlt: ""
    caseStudyLink: "/blog/sensei-uses-ldk-to-build-a-multi-node-lightning-server-application/"
editLink: false
lastUpdated: false
---

<h1 class="more-cases-heading">
   Meet all the projects using LDK!
</h1>

<CodeSwitcher :languages="{noncustodial:'Non-Custodial Wallets', custodial:'Custodial Wallets', infra:'Non-Custodial Infrastructure', router:'LN Routers', lsp:'LSPs', experiments:'Experiments', education: 'Educational Apps'}">
  <template v-slot:noncustodial>
    <div class="case-studies">
   <div class="case-study-item">
    <img src="./assets/portico.png" />
    <h3><a href="https://porticoexchange.github.io/porticoexchangev2.github.io/" target="_blank">Portico</a></h3>
    <p>Portico is a DEX that enables people to swap between bitcoin layers and sidechains</p>
    </div>
    <div class="case-study-item">
    <img src="./assets/portico.png" />
    <h3><a href="https://porticoexchange.github.io/porticoexchangev2.github.io/" target="_blank">Portico</a></h3>
    <p>Portico is a DEX that enables people to swap between bitcoin layers and sidechains</p>
    </div>
    <div class="case-study-item">
    <img src="./assets/portico.png" />
    <h3><a href="https://porticoexchange.github.io/porticoexchangev2.github.io/" target="_blank">Portico</a></h3>
    <p>Portico is a DEX that enables people to swap between bitcoin layers and sidechains</p>
    </div>
    </div>
  </template>

  <template v-slot:custodial>

   <h1>
   Custodial
   </h1>

  </template>

  <template v-slot:infra>

   <h1>
   Infra
  </h1>

  </template>

  <template v-slot:router>

   <h1>
   Router
  </h1>

  </template>

  <template v-slot:lsp>

   <h1>
   LSP
  </h1>

  </template>

  <template v-slot:experiments>

   <h1>
   Experiments
  </h1>

  </template>

  <template v-slot:education>

  <h1>
  Education
  </h1>

  </template>

</CodeSwitcher>
