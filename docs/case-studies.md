---
cases: true
sidebar: false
heroText: "Case Studies"
tagline: "A list of bitcoin applications building with LDK. If you’re using LDK we’d love to hear about your experience."
actionText: "Let us know!"
actionLink: "https://github.com/orgs/lightningdevkit/discussions/1554"
features:
  - title: "The Eye of Satoshi"
    details: "A watchtower with a specific focus on Lightning"
    image: "/img/teos-main.png"
    imageAlt: ""
    caseStudyLink: "/blog/teos-uses-ldk-to-build-open-source-watchtower/"
  - title: "Cash App"
    details: "Send and spend, bank, and buy stocks or bitcoin "
    image: "/img/cash-app-logo.png"
    imageAlt: "cash app logo"
    caseStudyLink: "/blog/cashapp-enables-lightning-withdrawals-and-deposits-using-ldk/"
  - title: "Sensei"
    details: "A lightning node implementation for everyone"
    image: "/img/sensei-main.png"
    imageAlt: "sensei logo"
    caseStudyLink: "/blog/sensei-uses-ldk-to-build-a-multi-node-lightning-server-application/"
editLink: false
lastUpdated: false
---

<h1 class="more-cases-heading">
   Meet all the projects using LDK!
</h1>

<CodeSwitcher :languages="{all: 'All', mobile:'Mobile', web:'Web', desktop:'Desktop', custodial: 'Custodial', infra:'Infrastructure', library: 'Libraries', misc:'Misc',}">
  <template v-slot:mobile>
    <div class="case-studies">
    <div class="case-study-item">
    <a href="https://bluewallet.io/" target="_blank"><img src="./assets/blue-wallet.png" /></a>
    <h3><a href="https://bluewallet.io/" target="_blank">Blue Wallet</a></h3>
    <p>A radically simple and powerful bitcoin and Lightning wallet</p>
    </div>
   <div class="case-study-item">
    <a href="https://bitkit.to/" target="_blank"><img src="./assets/bitkit.png" /></a>
    <h3><a href="https://bitkit.to/" target="_blank">Bitkit</a></h3>
    <p>A mobile app that hands you the keys to your money, profile, contacts, and web accounts</p>
    </div>
    <div class="case-study-item">
    <a href="https://twitter.com/kumulydev" target="_blank"><img src="./assets/kumuly.png" /></a>
    <h3><a href="https://twitter.com/kumulydev" target="_blank">Kumuly</a></h3>
    <p>Colombian-based mobile bitcoin and Lightning wallet</p>
    </div>
    <div class="case-study-item">
    <a href="https://lipa.swiss/" target="_blank"><img src="./assets/lipa.png" /></a>
    <h3><a href="https://lipa.swiss/" target="_blank">Lipa</a></h3>
    <p>Swiss-based mobile app that offers a bitcoin wallet for individuals and businesses</p>
    </div>
     <div class="case-study-item">
      <a href="https://mercurywallet.com/" target="_blank"><img src="./assets/mercury.png" /></a>
      <h3><a href="https://mercurywallet.com/" target="_blank">Mercury</a></h3>
      <p>A Lighting wallet that enables BTC transfers without requiring an on-chain transaction</p>
    </div>
     <div class="case-study-item">
      <a href="https://porticoexchange.github.io/porticoexchangev2.github.io/" target="_blank"><img src="./assets/portico.png" /></a>
      <h3><a href="https://porticoexchange.github.io/porticoexchangev2.github.io/" target="_blank">Portico</a></h3>
      <p>A DEX that enables people to swap between bitcoin layers and sidechains</p>
    </div>
     <div class="case-study-item">
      <a href="https://www.velascommerce.com/" target="_blank"><img src="./assets/velas.png" /></a>
      <h3><a href="https://www.velascommerce.com/" target="_blank">Velas</a></h3>
      <p>Enables businesses to integrate Lightning payments into websites, mobile applications, and more</p>
    </div>
     <div class="case-study-item">
      <a href="https://10101.finance/" target="_blank"><img src="./assets/10101.png" /></a>
      <h3><a href="https://10101.finance/" target="_blank">10101</a></h3>
      <p>An on-chain and off-chain wallet that allows trading</p>
    </div>
    </div>
  </template>

  <template v-slot:web>

  <div class="case-studies">
     <div class="case-study-item">
      <a href="https://mercurywallet.com/" target="_blank"><img src="./assets/mercury.png" /></a>
      <h3><a href="https://mercurywallet.com/" target="_blank">Mercury</a></h3>
      <p>A Lighting wallet that enables BTC transfers without requiring an on-chain transaction</p>
    </div>
    <div class="case-study-item">
      <h3><a href="https://mutinywallet.com/" target="_blank"><img src="./assets/mutiny.png" /></a></h3>
      <h3><a href="https://mutinywallet.com/" target="_blank">Mutiny</a></h3>
      <p>Mutiny is a web-first lightning wallet</p>
    </div>
  </div>

  </template>

  <template v-slot:desktop>
      <div class="case-studies">
       <div class="case-study-item">
        <a href="https://mercurywallet.com/" target="_blank"><img src="./assets/mercury.png" /></a>
        <h3><a href="https://mercurywallet.com/" target="_blank">Mercury</a></h3>
        <p>A Lighting wallet that enables BTC transfers without requiring an on-chain transaction</p>
       </div>
      <div class="case-study-item">
        <a href="https://atomicdex.io/en/" target="_blank"><img src="./assets/atomic.png" /></a>
        <h3><a href="https://atomicdex.io/en/" target="_blank">AtomicDEX</a></h3>
        <p>A multi-coin wallet, bridge, and DEX that can run on mobile and desktop</p>
      </div>
      <div class="case-study-item">
        <a href="https://hydranet.ai/" target="_blank"><img src="./assets/hydranet.png" /></a>
        <h3><a href="https://hydranet.ai/" target="_blank">Hydranet</a></h3>
        <p>A DEX that offers trading between blockchains without the need for a layer 2 bridge</p>
      </div>
      </div>
  </template>


  <template v-slot:custodial>

  <div class="case-studies">
  <div class="case-study-item">
    <a href="https://cash.app/" target="_blank"> <img src="./assets/cash-app-logo.png" /></a>
    <h3><a href="https://cash.app/" target="_blank">Cash App</a></h3>
    <p>A mobile P2P payments app and bitcoin wallet</p>
  </div>
  </div>

  </template>

  <template v-slot:infra>

  <div class="case-studies">
  <div class="case-study-item">
    <a href="https://github.com/lexe-tech" target="_blank"><img src="./assets/lexe.png" /></a>
    <h3><a href="https://github.com/lexe-tech" target="_blank">Lexe</a></h3>
    <p>An LN-in-the-cloud soultion that uses LDK on Intel SGX</p>
  </div>
  <div class="case-study-item">
    <a href="https://voltage.cloud/" target="_blank"><img src="./assets/voltage.png" /></a>
    <h3><a href="https://voltage.cloud/" target="_blank">Voltage</a></h3>
    <p>Provides enterprise grade infrastructure for the Lightning Network</p>
  </div>
  <div class="case-study-item">
    <a href="https://valera.co/" target="_blank"><img src="./assets/valera.png" /></a>
    <h3><a href="https://valera.co/" target="_blank">Valera</a></h3>
    <p>Building a financial infrastructure suite for developers and users</p>
  </div>
  <div class="case-study-item">
    <a href="https://github.com/kuutamolabs/lightning-knd" target="_blank"><img src="./assets/kuutamo.png" /></a>
    <h3><a href="https://github.com/kuutamolabs/lightning-knd" target="_blank">Kuutamo</a></h3>
    <p>A turn-key, end-to-end solution for running self-hosted nodes, anywhere</p>
  </div>
  <div class="case-study-item">
    <a href="https://cequals.xyz/" target="_blank"><img src="./assets/c=.png" /></a>
    <h3><a href="https://cequals.xyz/" target="_blank">c=</a></h3>
    <p>Building tools and services to help connect people to the Lightning Network</p>
  </div>
  </div>

  </template>

  <template v-slot:library>

  <div class="case-studies">
  <div class="case-study-item">
    <a href="https://github.com/carlaKC/lndk" target="_blank"><img src="./assets/github.png" /></a>
    <h3><a href="https://github.com/carlaKC/lndk" target="_blank">LNDK</a></h3>
    <p>LNDK is an experimental attempt at using LDK to implement BOLT12 features for LND</p>
  </div>
  <div class="case-study-item">
    <a href="https://vls.tech/" target="_blank"><img src="./assets/vls.png" /></a>
    <h3><a href="https://vls.tech/" target="_blank">VLS</a></h3>
    <p>Separates lightning private keys and security rule validation from nodes, into a discrete signing device</p>
  </div>
  <div class="case-study-item">
    <a href="https://github.com/talaia-labs/rust-teos" target="_blank"><img src="./assets/teos.png" /></a>
    <h3><a href="https://github.com/talaia-labs/rust-teos" target="_blank">TEOS</a></h3>
    <p>A bitcoin watchtower with a specific focus on lightning</p>
  </div>
  </div>

  </template>

  <template v-slot:misc>
      <div class="case-studies">
        <div class="case-study-item">
          <a href="https://github.com/p2pderivatives/rust-dlc" target="_blank"><img src="./assets/github.png" /></a>
          <h3><a href="https://github.com/p2pderivatives/rust-dlc" target="_blank">rust-dlc</a></h3>
          <p>A Rust library for working with Discreet Log Contracts</p>
        </div>
         <div class="case-study-item">
          <a href="https://github.com/BitcoinDevShop/hidden-lightning-network" target="_blank"><img src="./assets/github.png" /></a>
          <h3><a href="https://github.com/BitcoinDevShop/hidden-lightning-network" target="_blank">The Hidden Lightning Network</a></h3>
          <p>Probes the Lightning Network for the detection of private channels</p>
        </div>
        <div class="case-study-item">
          <a href="https://github.com/TonyGiorgio/ldk-sample-tor" target="_blank"><img src="./assets/github.png" /></a>
          <h3><a href="https://github.com/TonyGiorgio/ldk-sample-tor" target="_blank">ldk-sample with Tor</a></h3>
          <p>An experimentation with tor by adapting the ldk-sample node</p>
        </div>
        <div class="case-study-item">
          <a href="https://github.com/ConorOkus/uMlando-wallet" target="_blank"><img src="./assets/github.png" /></a>
          <h3><a href="https://github.com/ConorOkus/uMlando-wallet" target="_blank">uMlando</a></h3>
          <p>An educational Android demo wallet</p>
        </div>
      </div>

  </template>

  <template v-slot:all>
  <div class="case-studies">
    <div class="case-study-item">
    <a href="https://bluewallet.io/" target="_blank"><img src="./assets/blue-wallet.png" /></a>
    <h3><a href="https://bluewallet.io/" target="_blank">Blue Wallet</a></h3>
    <p>A mobile bitcoin and lightning wallet.</p>
    </div>
  <div class="case-study-item">
    <a href="https://bitkit.to/" target="_blank"><img src="./assets/bitkit.png" /></a>
    <h3><a href="https://bitkit.to/" target="_blank">Bitkit</a></h3>
    <p>A mobile wallet that features portable web profiles and passwordless web accounts</p>
  </div>
   <div class="case-study-item">
    <a href="https://twitter.com/kumulydev" target="_blank"><img src="./assets/kumuly.png" /></a>
    <h3><a href="https://twitter.com/kumulydev" target="_blank">Kumuly</a></h3>
    <p>Colombian-based mobile bitcoin and Lightning wallet</p>
  </div>
  <div class="case-study-item">
    <a href="https://lipa.swiss/" target="_blank"><img src="./assets/lipa.png" /></a>
    <h3><a href="https://lipa.swiss/" target="_blank">Lipa</a></h3>
    <p>Swiss-based mobile app that offers a bitcoin wallet for individuals and businesses</p>
  </div>
  <div class="case-study-item">
    <a href="https://porticoexchange.github.io/porticoexchangev2.github.io/" target="_blank"><img src="./assets/portico.png" /></a>
    <h3><a href="https://porticoexchange.github.io/porticoexchangev2.github.io/" target="_blank">Portico</a></h3>
    <p>A DEX that enables people to swap between bitcoin layers and sidechains</p>
  </div>
  <div class="case-study-item">
    <a href="https://mercurywallet.com/" target="_blank"><img src="./assets/mercury.png" /></a>
    <h3><a href="https://mercurywallet.com/" target="_blank">Mercury</a></h3>
    <p>A Lighting wallet that enables BTC transfers without requiring an on-chain transaction</p>
  </div>
  <div class="case-study-item">
    <a href="https://10101.finance/" target="_blank"><img src="./assets/10101.png" /></a>
    <h3><a href="https://10101.finance/" target="_blank">10101</a></h3>
    <p>An on-chain and off-chain wallet that allows trading</p>
  </div>
  <div class="case-study-item">
    <h3><a href="https://mutinywallet.com/" target="_blank"><img src="./assets/mutiny.png" /></a></h3>
    <h3><a href="https://mutinywallet.com/" target="_blank">Mutiny</a></h3>
    <p>Mutiny is a web-first lightning wallet</p>
  </div>
  <div class="case-study-item">
    <a href="https://www.velascommerce.com/" target="_blank"><img src="./assets/velas.png" /></a>
    <h3><a href="https://www.velascommerce.com/" target="_blank">Velas</a></h3>
    <p>A way to integrate Lightning into websites, mobile applications, and more.</p>
  </div>
  <div class="case-study-item">
    <a href="https://atomicdex.io/en/" target="_blank"><img src="./assets/atomic.png" /></a>
    <h3><a href="https://atomicdex.io/en/" target="_blank">AtomicDEX</a></h3>
    <p>A multi-coin wallet, bridge, and DEX that can run on mobile and desktop</p>
  </div>
  <div class="case-study-item">
    <a href="https://hydranet.ai/" target="_blank"><img src="./assets/hydranet.png" /></a>
    <h3><a href="https://hydranet.ai/" target="_blank">Hydranet</a></h3>
    <p>A DEX that offers trading between blockchains without the need for a layer 2 bridge</p>
  </div>
  <div class="case-study-item">
    <a href="https://cash.app/" target="_blank"> <img src="./assets/cash-app-logo.png" /></a>
    <h3><a href="https://cash.app/" target="_blank">Cash App</a></h3>
    <p>A mobile P2P payments app and bitcoin wallet</p>
  </div>
  <div class="case-study-item">
    <a href="https://github.com/talaia-labs/rust-teos" target="_blank"><img src="./assets/teos.png" /></a>
    <h3><a href="https://github.com/talaia-labs/rust-teos" target="_blank">TEOS</a></h3>
    <p>A bitcoin watchtower with a specific focus on lightning</p>
  </div>
  <div class="case-study-item">
    <a href="https://vls.tech/" target="_blank"><img src="./assets/vls.png" /></a>
    <h3><a href="https://vls.tech/" target="_blank">VLS</a></h3>
    <p>Separates lightning private keys and security rule validation from nodes, into a discrete signing device</p>
  </div>
  <div class="case-study-item">
    <a href="https://github.com/lexe-tech" target="_blank"> <img src="./assets/lexe.png" /></a>
    <h3><a href="https://github.com/lexe-tech" target="_blank">Lexe</a></h3>
    <p>Managed non-custodial Lightning nodes based on Intel SGX, accessible via mobile app</p>
  </div>
  <div class="case-study-item">
    <a href="https://voltage.cloud/" target="_blank"><img src="./assets/voltage.png" /></a>
    <h3><a href="https://voltage.cloud/" target="_blank">Voltage</a></h3>
    <p>Provides enterprise grade infrastructure for the Lightning Network</p>
  </div>
  <div class="case-study-item">
    <a href="https://valera.co/" target="_blank"><img src="./assets/valera.png" /></a>
    <h3><a href="https://valera.co/" target="_blank">Valera</a></h3>
    <p>Building a financial infrastructure suite for developers and users</p>
  </div>
  <div class="case-study-item">
    <a href="https://github.com/kuutamolabs/lightning-knd" target="_blank"><img src="./assets/kuutamo.png" /></a>
    <h3><a href="https://github.com/kuutamolabs/lightning-knd" target="_blank">Kuutamo</a></h3>
    <p>A turn-key, end-to-end solution for running self-hosted nodes, anywhere</p>
  </div>
  <div class="case-study-item">
    <h3><a href="https://cequals.xyz/" target="_blank"><img src="./assets/c=.png" /></a></h3>
    <h3><a href="https://cequals.xyz/" target="_blank">c=</a></h3>
    <p>Building tools and services to help connect people to the Lightning Network</p>
  </div>
  <div class="case-study-item">
    <a href="https://github.com/p2pderivatives/rust-dlc" target="_blank"><img src="./assets/github.png" /></a>
    <h3><a href="https://github.com/p2pderivatives/rust-dlc" target="_blank">rust-dlc</a></h3>
    <p>A Rust library for working with Discreet Log Contracts</p>
  </div>
  <div class="case-study-item">
    <a href="https://github.com/BitcoinDevShop/hidden-lightning-network" target="_blank"><img src="./assets/github.png" /></a>
    <h3><a href="https://github.com/BitcoinDevShop/hidden-lightning-network" target="_blank">The Hidden Lightning Network</a></h3>
    <p>Probes the Lightning Network for the detection of private channels</p>
  </div>
  <div class="case-study-item">
    <a href="https://github.com/TonyGiorgio/ldk-sample-tor" target="_blank"><img src="./assets/github.png" /></a>
    <h3><a href="https://github.com/TonyGiorgio/ldk-sample-tor" target="_blank">ldk-sample with Tor</a></h3>
    <p>An experimentation with tor by adapting the ldk-sample node</p>
  </div>
  <div class="case-study-item">
    <a href="https://github.com/ConorOkus/uMlando-wallet" target="_blank"><img src="./assets/github.png" /></a>
    <h3><a href="https://github.com/ConorOkus/uMlando-wallet" target="_blank">uMlando</a></h3>
    <p>An educational Android demo wallet</p>
    </div>
  </div>

  </template>

</CodeSwitcher>
