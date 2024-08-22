---
cases: true
sidebar: false
tagline: "Bitcoin applications building with LDK"
description: "A list of bitcoin applications and services building with LDK"
actionText: "Add your project"
actionLink: "https://github.com/orgs/lightningdevkit/discussions/1554"
features:
  - title: "Mutiny"
    details: "A self-custodial lightning wallet that runs in the browser"
    image: "/img/mutiny-featured.png"
    imageAlt: "mutiny logo"
    caseStudyLink: "/blog/mutiny-uses-ldk-the-first-lightning-wallet-for-the-web/"
  - title: "Cash App"
    details: "Send and spend, bank, and buy stocks or bitcoin "
    image: "/img/cash-app-logo.png"
    imageAlt: "cash app logo"
    caseStudyLink: "/blog/cashapp-enables-lightning-withdrawals-and-deposits-using-ldk/"
  - title: "Bitkit"
    details: "Bitkit hands you the keys to your money, profile, contacts, and web accounts"
    image: "/img/bitkit.svg"
    imageAlt: ""
    caseStudyLink: "/blog/bitkit-uses-ldk-to-build-the-ultimate-alternative-to-custodial-wallets/"
editLink: false
lastUpdated: false
---

<h1 class="more-cases-heading">
   Meet the projects building with LDK
</h1>

<CodeSwitcher :languages="{all: 'All', mobile:'Mobile', web:'Web', desktop:'Desktop', custodial: 'Custodial', infra:'Infrastructure', misc:'Misc',}">
  <template v-slot:mobile>
    <div class="case-studies">
     <div class="case-study-item">
      <a href="https://10101.finance/" target="_blank"><img src="./assets/10101.png" /></a>
      <h3><a href="https://10101.finance/" target="_blank">10101</a></h3>
      <p>An on and off-chain wallet infused with trading</p>
    </div>
    <div class="case-study-item">
      <a href="https://bitkit.to/" target="_blank"><img src="./assets/bitkit.png" /></a>
      <h3><a href="https://bitkit.to/" target="_blank">Bitkit</a></h3>
      <p>The ultimate bitcoin toolkit, take charge of your digital life</p>
    </div>
    <div class="case-study-item">
      <a href="https://bluewallet.io/" target="_blank"><img src="./assets/blue-wallet.png" /></a>
      <h3><a href="https://bluewallet.io/" target="_blank">Blue Wallet</a></h3>
      <p>A radically simple and powerful bitcoin and Lightning wallet</p>
    </div>
    <div class="case-study-item">
      <a href="https://github.com/EttaWallet/EttaWallet" target="_blank"><img src="./assets/etta.png" /></a>
      <h3><a href="https://github.com/EttaWallet/EttaWallet" target="_blank">EttaWallet</a></h3>
      <p>A simple open-source wallet with a strong bias toward usability, accessibility, and UX</p>
    </div>
    <div class="case-study-item">
    <a href="https://twitter.com/kumulydev" target="_blank"><img src="./assets/kumuly.png" /></a>
    <h3><a href="https://twitter.com/kumulydev" target="_blank">Kumuly</a></h3>
    <p>Colombian-based mobile bitcoin and Lightning wallet</p>
    </div>
     <div class="case-study-item">
      <a href="https://mercurywallet.com/" target="_blank"><img src="./assets/mercury.png" /></a>
      <h3><a href="https://mercurywallet.com/" target="_blank">Mercury</a></h3>
      <p>A layer 2 bitcoin wallet that enables users to send and swap bitcoin privately</p>
    </div>
     <div class="case-study-item">
      <a href="https://www.velascommerce.com/" target="_blank"><img src="./assets/velas.png" /></a>
      <h3><a href="https://www.velascommerce.com/" target="_blank">Velas</a></h3>
      <p>A way to integrate Lightning into websites, mobile applications, and more</p>
    </div>
    </div>
  </template>

  <template v-slot:web>

  <div class="case-studies">
    <div class="case-study-item">
      <h3><a href="https://mutinywallet.com/" target="_blank"><img src="./assets/mutiny.png" /></a></h3>
      <h3><a href="https://mutinywallet.com/" target="_blank">Mutiny</a></h3>
      <p>A web-first unstoppable bitcoin wallet for everyone</p>
    </div>
  </div>

  </template>

  <template v-slot:desktop>
      <div class="case-studies">
      <div class="case-study-item">
        <a href="https://atomicdex.io/en/" target="_blank"><img src="./assets/atomic.png" /></a>
        <h3><a href="https://atomicdex.io/en/" target="_blank">AtomicDEX</a></h3>
        <p>A multi-coin wallet, bridge, and DEX rolled into one app</p>
      </div>
      <div class="case-study-item">
        <a href="https://hydranet.ai/" target="_blank"><img src="./assets/hydranet.png" /></a>
        <h3><a href="https://hydranet.ai/" target="_blank">Hydranet</a></h3>
        <p>A layer 3 decentralized exchange, allowing trading with native tokens between blockchains</p>
      </div>
      <div class="case-study-item">
        <a href="https://mercurywallet.com/" target="_blank"><img src="./assets/mercury.png" /></a>
        <h3><a href="https://mercurywallet.com/" target="_blank">Mercury</a></h3>
        <p>A layer 2 bitcoin wallet that enables users to send and swap bitcoin privately</p>
      </div>
      </div>
  </template>

  <template v-slot:custodial>

  <div class="case-studies">
  <div class="case-study-item">
    <a href="https://cash.app/" target="_blank"> <img src="./assets/cash-app-logo.png" /></a>
    <h3><a href="https://cash.app/" target="_blank">Cash App</a></h3>
    <p>Send and spend, bank, and buy stocks or bitcoin</p>
  </div>
  </div>

  </template>

  <template v-slot:infra>

  <div class="case-studies">
  <div class="case-study-item">
    <a href="https://github.com/aciedo" target="_blank"><img src="./assets/aciedo.svg" /></a>
    <h3><a href="https://github.com/aciedo" target="_blank">Aciedo</a></h3>
    <p>A financial infrastructure suite for developers and users</p>
  </div>
  <div class="case-study-item">
    <a href="https://cequals.xyz/" target="_blank"><img src="./assets/c=.png" /></a>
    <h3><a href="https://cequals.xyz/" target="_blank">c=</a></h3>
    <p>Tools and services that connect people to the Lightning Network</p>
  </div>
  <div class="case-study-item">
    <a href="https://github.com/kuutamolabs/lightning-knd" target="_blank"><img src="./assets/kuutamo.png" /></a>
    <h3><a href="https://github.com/kuutamolabs/lightning-knd" target="_blank">kuutamo</a></h3>
    <p>A turn-key, end-to-end solution for running self-hosted nodes, anywhere</p>
  </div>
  <div class="case-study-item">
    <a href="https://github.com/lndk-org/lndk" target="_blank"><img src="./assets/lndk.png" /></a>
    <h3><a href="https://github.com/lndk-org/lndk" target="_blank">LNDK</a></h3>
    <p>A standalone daemon that aims to externally implement BOLT 12 functionality for LND</p>
  </div>
  <div class="case-study-item">
    <a href="https://github.com/lexe-tech" target="_blank"><img src="./assets/lexe.png" /></a>
    <h3><a href="https://github.com/lexe-tech" target="_blank">Lexe</a></h3>
    <p>Managed non-custodial Lightning nodes inside secure hardware</p>
  </div>
  <div class="case-study-item">
    <a href="https://www.lightspark.com/" target="_blank"> <img src="./assets/lightspark.png" /></a>
    <h3><a href="https://www.lightspark.com/" target="_blank">Lightspark</a></h3>
    <p>Enterprise-grade, fast, secure payments on Lightning</p>
  </div>
  <div class="case-study-item">
    <a href="https://github.com/L2-Technology/sensei" target="_blank"><img src="./assets/sensei.png" /></a>
    <h3><a href="https://github.com/L2-Technology/sensei" target="_blank">Sensei</a></h3>
    <p>A Lightning node implementation for everyone</p>
  </div>
  <div class="case-study-item">
    <a href="https://github.com/talaia-labs/rust-teos" target="_blank"><img src="./assets/teos.png" /></a>
    <h3><a href="https://github.com/talaia-labs/rust-teos" target="_blank">TEOS</a></h3>
    <p>A bitcoin watchtower with a specific focus on Lightning</p>
  </div>
  <div class="case-study-item">
    <a href="https://vls.tech/" target="_blank"><img src="./assets/vls.png" /></a>
    <h3><a href="https://vls.tech/" target="_blank">VLS</a></h3>
    <p>Separates Lightning private keys and security rule validation from nodes, into a discrete signing device</p>
  </div>
  <div class="case-study-item">
    <a href="https://voltage.cloud/" target="_blank"><img src="./assets/voltage.png" /></a>
    <h3><a href="https://voltage.cloud/" target="_blank">Voltage</a></h3>
    <p>Enterprise-grade infrastructure for the Lightning Network</p>
  </div>  
  </div>

  </template>

  <template v-slot:misc>
      <div class="case-studies">
        <div class="case-study-item">
          <a href="https://github.com/fiksn/gossiper" target="_blank"><img src="./assets/github.png" /></a>
          <h3><a href="https://github.com/fiksn/gossiper" target="_blank">Gossiper</a></h3>
          <p>Lightning Gossip Ingestion</p>
        </div>
         <div class="case-study-item">
          <a href="https://github.com/BitcoinDevShop/hidden-lightning-network" target="_blank"><img src="./assets/github.png" /></a>
          <h3><a href="https://github.com/BitcoinDevShop/hidden-lightning-network" target="_blank">The Hidden LN</a></h3>
          <p>Probes the Lightning Network for the detection of private channels</p>
        </div>
        <div class="case-study-item">
          <a href="https://github.com/TonyGiorgio/ldk-sample-tor" target="_blank"><img src="./assets/github.png" /></a>
          <h3><a href="https://github.com/TonyGiorgio/ldk-sample-tor" target="_blank">ldk-sample with Tor</a></h3>
          <p>An experimentation with tor that adapts the ldk-sample node</p>
        </div>
        <div class="case-study-item">
          <a href="https://github.com/RGB-Tools/rgb-lightning-node" target="_blank"><img src="./assets/github.png" /></a>
          <h3><a href="https://github.com/RGB-Tools/rgb-lightning-node" target="_blank">rgb-lightning-node</a></h3>
          <p>LN node based on ldk-sample supporting RGB assets</p>
        </div>
         <div class="case-study-item">
          <a href="https://github.com/p2pderivatives/rust-dlc" target="_blank"><img src="./assets/github.png" /></a>
          <h3><a href="https://github.com/p2pderivatives/rust-dlc" target="_blank">rust-dlc</a></h3>
          <p>A Rust library for working with Discreet Log Contracts</p>
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
      <a href="https://10101.finance/" target="_blank"><img src="./assets/10101.png" /></a>
      <h3><a href="https://10101.finance/" target="_blank">10101</a></h3>
      <p>An on and off-chain wallet infused with trading</p>
    </div>
    <div class="case-study-item">
    <a href="https://github.com/aciedo" target="_blank"><img src="./assets/aciedo.svg" /></a>
    <h3><a href="https://github.com/aciedo" target="_blank">Aciedo</a></h3>
    <p>A financial infrastructure suite for developers and users</p>
    </div>
    <div class="case-study-item">
      <a href="https://atomicdex.io/en/" target="_blank"><img src="./assets/atomic.png" /></a>
      <h3><a href="https://atomicdex.io/en/" target="_blank">AtomicDEX</a></h3>
      <p>A multi-coin wallet, bridge, and DEX rolled into one app</p>
    </div>
    <div class="case-study-item">
      <a href="https://bitkit.to/" target="_blank"><img src="./assets/bitkit.png" /></a>
      <h3><a href="https://bitkit.to/" target="_blank">Bitkit</a></h3>
      <p>The ultimate bitcoin toolkit, take charge of your digital life</p>
    </div>
    <div class="case-study-item">
      <a href="https://bluewallet.io/" target="_blank"><img src="./assets/blue-wallet.png" /></a>
      <h3><a href="https://bluewallet.io/" target="_blank">Blue Wallet</a></h3>
      <p>A radically simple and powerful bitcoin and Lightning wallet</p>
    </div>
    <div class="case-study-item">
      <a href="https://cequals.xyz/" target="_blank"><img src="./assets/c=.png" /></a>
      <h3><a href="https://cequals.xyz/" target="_blank">c=</a></h3>
      <p>Tools and services that connect people to the Lightning Network</p>
    </div>
    <div class="case-study-item">
      <a href="https://cash.app/" target="_blank"> <img src="./assets/cash-app-logo.png" /></a>
      <h3><a href="https://cash.app/" target="_blank">Cash App</a></h3>
      <p>Send and spend, bank, and buy stocks or bitcoin</p>
    </div>
    <div class="case-study-item">
        <a href="https://github.com/EttaWallet/EttaWallet" target="_blank"><img src="./assets/etta.png" /></a>
        <h3><a href="https://github.com/EttaWallet/EttaWallet" target="_blank">EttaWallet</a></h3>
        <p>A simple open-source wallet with a strong bias toward usability, accessibility, and UX</p>
    </div>
    <div class="case-study-item">
        <a href="https://github.com/fiksn/gossiper" target="_blank"><img src="./assets/github.png" /></a>
        <h3><a href="https://github.com/fiksn/gossiper" target="_blank">Gossiper</a></h3>
        <p>Lightning Gossip Ingestion</p>
    </div>
    <div class="case-study-item">
      <a href="https://hydranet.ai/" target="_blank"><img src="./assets/hydranet.png" /></a>
      <h3><a href="https://hydranet.ai/" target="_blank">Hydranet</a></h3>
      <p>A layer 3 decentralized exchange, allowing trading with native tokens between blockchains</p>
    </div>
   <div class="case-study-item">
    <a href="https://twitter.com/kumulydev" target="_blank"><img src="./assets/kumuly.png" /></a>
    <h3><a href="https://twitter.com/kumulydev" target="_blank">Kumuly</a></h3>
    <p>Colombian-based mobile bitcoin and Lightning wallet</p>
   </div>
   <div class="case-study-item">
      <a href="https://github.com/kuutamolabs/lightning-knd" target="_blank"><img src="./assets/kuutamo.png" /></a>
      <h3><a href="https://github.com/kuutamolabs/lightning-knd" target="_blank">kuutamo</a></h3>
      <p>A turn-key, end-to-end solution for running self-hosted nodes, anywhere</p>
   </div>
   <div class="case-study-item">
    <a href="https://github.com/TonyGiorgio/ldk-sample-tor" target="_blank"><img src="./assets/github.png" /></a>
    <h3><a href="https://github.com/TonyGiorgio/ldk-sample-tor" target="_blank">ldk-sample with Tor</a></h3>
    <p>An experimentation with tor that adapts the ldk-sample node</p>
   </div>
   <div class="case-study-item">
    <a href="https://github.com/lexe-tech" target="_blank"> <img src="./assets/lexe.png" /></a>
    <h3><a href="https://github.com/lexe-tech" target="_blank">Lexe</a></h3>
    <p>Managed non-custodial Lightning nodes inside secure hardware</p>
  </div>
   <div class="case-study-item">
    <a href="https://www.lightspark.com/" target="_blank"> <img src="./assets/lightspark.png" /></a>
    <h3><a href="https://www.lightspark.com/" target="_blank">Lightspark</a></h3>
    <p>Enterprise-grade, fast, secure payments on Lightning</p>
  </div>
  <div class="case-study-item">
    <a href="https://github.com/lndk-org/lndk" target="_blank"><img src="./assets/lndk.png" /></a>
    <h3><a href="https://github.com/lndk-org/lndk" target="_blank">LNDK</a></h3>
    <p>A standalone daemon that aims to externally implement BOLT 12 functionality for LND</p>
  </div>
  <div class="case-study-item">
    <a href="https://mercurywallet.com/" target="_blank"><img src="./assets/mercury.png" /></a>
    <h3><a href="https://mercurywallet.com/" target="_blank">Mercury</a></h3>
    <p>A layer 2 bitcoin wallet that enables users to send and swap bitcoin privately</p>
  </div>
  <div class="case-study-item">
    <a href="https://mutinywallet.com/" target="_blank"><img src="./assets/mutiny.png" /></a>
    <h3><a href="https://mutinywallet.com/" target="_blank">Mutiny</a></h3>
    <p>A web-first unstoppable bitcoin wallet for everyone</p>
  </div>
  <div class="case-study-item">
    <a href="https://github.com/RGB-Tools/rgb-lightning-node" target="_blank"><img src="./assets/github.png" /></a>
    <h3><a href="https://github.com/RGB-Tools/rgb-lightning-node" target="_blank">rgb-lightning-node</a></h3>
    <p>LN node based on ldk-sample supporting RGB assets</p>
  </div>
  <div class="case-study-item">
    <a href="https://github.com/p2pderivatives/rust-dlc" target="_blank"><img src="./assets/github.png" /></a>
    <h3><a href="https://github.com/p2pderivatives/rust-dlc" target="_blank">rust-dlc</a></h3>
    <p>A Rust library for working with Discreet Log Contracts</p>
  </div>
  <div class="case-study-item">
    <a href="https://github.com/L2-Technology/sensei" target="_blank"><img src="./assets/sensei.png" /></a>
    <h3><a href="https://github.com/L2-Technology/sensei" target="_blank">Sensei</a></h3>
    <p>A Lightning node implementation for everyone</p>
  </div>
  <div class="case-study-item">
    <a href="https://github.com/talaia-labs/rust-teos" target="_blank"><img src="./assets/teos.png" /></a>
    <h3><a href="https://github.com/talaia-labs/rust-teos" target="_blank">TEOS</a></h3>
    <p>A bitcoin watchtower with a specific focus on Lightning</p>
  </div>
  <div class="case-study-item">
    <a href="https://github.com/BitcoinDevShop/hidden-lightning-network" target="_blank"><img src="./assets/github.png" /></a>
    <h3><a href="https://github.com/BitcoinDevShop/hidden-lightning-network" target="_blank">The Hidden LN</a></h3>
    <p>Probes the Lightning Network for the detection of private channels</p>
  </div>
  <div class="case-study-item">
    <a href="https://github.com/ConorOkus/uMlando-wallet" target="_blank"><img src="./assets/github.png" /></a>
    <h3><a href="https://github.com/ConorOkus/uMlando-wallet" target="_blank">uMlando</a></h3>
    <p>An educational Android demo wallet</p>
  </div>
  <div class="case-study-item">
    <a href="https://www.velascommerce.com/" target="_blank"><img src="./assets/velas.png" /></a>
    <h3><a href="https://www.velascommerce.com/" target="_blank">Velas</a></h3>
    <p>A way to integrate Lightning into websites, mobile applications, and more</p>
  </div>
  <div class="case-study-item">
    <a href="https://vls.tech/" target="_blank"><img src="./assets/vls.png" /></a>
    <h3><a href="https://vls.tech/" target="_blank">VLS</a></h3>
    <p>Separates Lightning private keys and security rule validation from nodes, into a discrete signing device</p>
  </div>
  <div class="case-study-item">
    <a href="https://voltage.cloud/" target="_blank"><img src="./assets/voltage.png" /></a>
    <h3><a href="https://voltage.cloud/" target="_blank">Voltage</a></h3>
    <p>Enterprise-grade infrastructure for the Lightning Network</p>
  </div>
  </div>

  </template>

</CodeSwitcher>
