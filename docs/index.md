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

## Introduction

LDK/Rust-Lightning is a generic library which allows you to build a lightning
node without needing to worry about getting all of the lightning state machine,
routing, and on-chain punishment code (and other chain interactions) exactly
correct. LDK tends to be suitable for use cases where a degree of
customization is desired, e.g. your own chain sync, your own key management
and/or your own storage/backup logic.

We are currently working on a demo node which fetches blockchain data and
on-chain funds via Bitcoin Core RPC/REST. The individual pieces of that demo
are/will be composable, so you can pick the off-the-shelf parts you want and
replace the rest.
