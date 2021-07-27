---
home: true
heroText: Lightning Dev Kit
tagline: A flexible Lightning implementation and supporting batteries.
actionText: Get started
actionLink: /overview/
features:
- title: "Customizable"
  details: "LDK was designed from the ground up to be easily customized to your application needs: persistence, networking, chain source, routing, key management, wallet, you name it."
  image: "customizable"
- title: "Focus on what matters"
  details: "LDK lets you focus on your user experience and we'll handle all the low-level lightning logic."
  image: "focus"
- title: "Mobile first"
  details: "As lightweight as you need it to be and with language bindings suitable for iOS or Android -- it may be written in secure Rust, but you'll never have to touch Rust code."
  image: "mobile"
---

<div class="intro">
<h2>Why LDK?</h2>
<p>Leading Bitcoin open source projects love LDK …</p>
</div>

<div class="features">
<div class="feature">
<h3>Cross-Language Bindings</h3>

As the application is an SDK and not a standalone binary opinionated about its execution environment, we would provide FFI bindings into whichever languages developers happen to build Lightning applications in, be they C, Swift, or Python. You can open the same wallet in multiple environments (e.g. in a web browser, on a phone, on a desktop, etc)!

[Documentation →](./overview/)

</div>

<div class="feature">
<h3>Custom Storage Backend</h3>

Synchronize node state across multiple clients sharing the same channels. Back up new state before it goes live and missing it loses funds.

[Documentation →](./overview/)

</div>

<div class="feature">
<h3>Blockchain Truth Sourcing</h3>

Use a local full node, an SPV node, or your own server with API access to source data about the blockchain truth and feed it to the LDK for decision-making about whether to sign a state update. Or if you’re running your own server that does custom verification, have that server sign a message and then simply verify that signature in lieu of doing any local state verification.

[Documentation →](./blockdata/)

</div>

<div class="feature">
<h3>Custom Routing, Peer Scoring, and Channel Creation</h3>

Implement a custom routing engine to take more control over routing decisions with native ownership of the full routing table. Also take more control over channel creation and peer selection.

[Documentation →](./overview/)

</div>
</div>
