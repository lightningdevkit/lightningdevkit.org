(window.webpackJsonp=window.webpackJsonp||[]).push([[10],{313:function(e,t,n){e.exports=n.p+"assets/img/OM-dm-image-1.8264e375.png"},314:function(e,t,n){e.exports=n.p+"assets/img/OM-dm-image-2.e3e05fcb.png"},315:function(e,t,n){e.exports=n.p+"assets/img/OM-dm-image-3.fd401501.png"},316:function(e,t,n){e.exports=n.p+"assets/img/OM-dm-image-4.934aee81.png"},338:function(e,t,n){"use strict";n.r(t);var o=n(6),s=Object(o.a)({},(function(){var e=this,t=e._self._c;return t("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[t("p",[e._v("We recently merged support for onion message forwarding, a precursor to deprecating today’s Lightning invoice format, in favor of "),t("a",{attrs:{href:"https://github.com/lightning/bolts/pull/798",target:"_blank",rel:"noopener noreferrer"}},[e._v("offers"),t("OutboundLink")],1),e._v(". Offers bring many improvements to Lightning, including static invoices, refunds, and receiving payments in a way that doesn’t reveal your node ID or UTXOs. Then, once offer extensions are added, support for subscriptions follows.")]),e._v(" "),t("p",[e._v("So a lot is happening. Including…")]),e._v(" "),t("p",[e._v("Once the network supports "),t("a",{attrs:{href:"https://bitcoinops.org/en/topics/ptlc/",target:"_blank",rel:"noopener noreferrer"}},[e._v("PTLCs"),t("OutboundLink")],1),e._v(", onion messages will help enable "),t("a",{attrs:{href:"https://github.com/lightning/bolts/pull/989",target:"_blank",rel:"noopener noreferrer"}},[e._v("asynchronous Lightning payments"),t("OutboundLink")],1),e._v(" that remove the rule requiring nodes to be online when receiving payments. We expect onion messages to provide a better foundation for noncustodial Lightning payment UX, including privacy bonuses.")]),e._v(" "),t("h2",{attrs:{id:"how-onion-messages-work"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#how-onion-messages-work"}},[e._v("#")]),e._v(" How Onion Messages Work")]),e._v(" "),t("p",[e._v("Onion messages are lightweight, flexible messages sent between Lightning Network peers using onion routing. Unlike today’s payment messages, peers may send onion messages along a blinded route, thus concealing the recipient’s info. But what’s a blinded route?")]),e._v(" "),t("h2",{attrs:{id:"blinded-routes"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#blinded-routes"}},[e._v("#")]),e._v(" Blinded Routes")]),e._v(" "),t("p",[e._v("If Alice doesn’t want to reveal lots of personal information about her channels and UTXOs, she can use cryptography to create an obfuscated or “blinded” route to herself for the sender (we’ll call him Bob) to send an onion message along. To construct this route, she’ll first find a route to herself from some PopularNode in the graph that has a lot of peers.")]),e._v(" "),t("p",[e._v("By selecting PopularNode from this network chart, Alice’s anonymity set includes all highlighted peers:")]),e._v(" "),t("figure",[t("img",{attrs:{src:n(313),alt:"OM"}})]),e._v(" "),t("p",[e._v("To Bob and any other observers, any node within two hops of PopularNode could be the destination of the onion message. Adding more hops further expands Alice’s anonymity set. (Note that PopularNode’s direct peers are candidates because blinded routes may contain fake dummy hops.)")]),e._v(" "),t("p",[e._v("After selecting the path from PopularNode, she’ll create an encrypted blob for each hop that contains information about reaching the next hop, which ends at her node. At this point, the blinded route looks like this:")]),e._v(" "),t("figure",[t("img",{attrs:{src:n(314),alt:"OM"}})]),e._v(" "),t("p",[e._v("Finally, she’ll provide this blinded route to Bob, who will find a route to PopularNode and use Alice’s blinded route when constructing the last three hop payloads within the onion packet.")]),e._v(" "),t("h2",{attrs:{id:"onion-message-structure"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#onion-message-structure"}},[e._v("#")]),e._v(" Onion Message Structure")]),e._v(" "),t("p",[e._v("Continuing with this example, let’s say Bob finds this path to Alice’s blinded route:")]),e._v(" "),t("figure",[t("img",{attrs:{src:n(315),alt:"OM"}})]),e._v(" "),t("p",[e._v("If Bob sends an invoice request through Alice’s blinded route via onion message, his message would look like this:")]),e._v(" "),t("figure",[t("img",{attrs:{src:n(316),alt:"OM"}})]),e._v(" "),t("p",[e._v("So each intermediate layer of the onion contains encrypted forwarding information for the next hop, and the last layer contains the content of the onion message intended for the final hop. This content may include invoice requests and invoices for offers.")]),e._v(" "),t("h2",{attrs:{id:"beyond-offers-asynchronous-payments"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#beyond-offers-asynchronous-payments"}},[e._v("#")]),e._v(" Beyond Offers: Asynchronous Payments")]),e._v(" "),t("p",[e._v("While offers were the original point of onion messages, their flexible format unlocks further opportunities to improve the Lightning Network.")]),e._v(" "),t("p",[e._v("For context, a significant problem facing the Lightning Network is that users running noncustodial Lightning wallets on phones must have their wallet app in the foreground to receive payments. This is a big departure from the Cash App-like UX that users want and even expect.")]),e._v(" "),t("p",[e._v("A key part of the solution here is that all mobile wallets are likely to be using Lightning Service Providers (LSPs), which manage channel liquidity and stay online on behalf of end users.")]),e._v(" "),t("p",[e._v("Enter asynchronous Lightning payments. Async payments utilize LSPs on both ends, sender and receiver. The sender’s LSP will hold onto a payment until it receives an onion message from the recipient's LSP indicating the recipient is online and ready to receive funds. At this point, the sender’s LSP releases the payment.")]),e._v(" "),t("p",[e._v("While it may sound like it, this does not tie up network liquidity via long CLTV timeouts like today's \"async payments\" because the only locked liquidity is the sender's, and the sender has already bid farewell to those funds.")]),e._v(" "),t("p",[e._v("For more information, "),t("a",{attrs:{href:"https://github.com/lightning/bolts/pull/989",target:"_blank",rel:"noopener noreferrer"}},[e._v("follow the development of async payments"),t("OutboundLink")],1),e._v(".")]),e._v(" "),t("h2",{attrs:{id:"future-security-directions"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#future-security-directions"}},[e._v("#")]),e._v(" Future Security Directions")]),e._v(" "),t("p",[e._v("The concept of onion messages might make you ask: “Free, flexible messages? What if there’s a ton of spam, or people stream videos over Lightning?”")]),e._v(" "),t("p",[e._v("The good news is that there are many ways to rate limit onion messages. For example, limiting peers to a few kilobytes worth of onion messages per second would not be enough bandwidth to allow for streaming. You can also restrict forwarded onion messages to channel peers only, meaning that even if someone attempted a full-on DoS attack, they would be forced to open a great deal of channels.")]),e._v(" "),t("p",[e._v("For more information, see this "),t("a",{attrs:{href:"https://lists.linuxfoundation.org/pipermail/lightning-dev/2022-June/003623.html",target:"_blank",rel:"noopener noreferrer"}},[e._v("mailing list post and replies"),t("OutboundLink")],1),e._v(".")]),e._v(" "),t("h2",{attrs:{id:"seeya"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#seeya"}},[e._v("#")]),e._v(" Seeya")]),e._v(" "),t("p",[e._v("Thanks for taking the time to learn about onion messages and their use cases. We think it’s a big first step towards a grandparent-friendly noncustodial Lightning UX.")]),e._v(" "),t("p",[e._v("Want to contribute to LDK? Join us on GitHub at our "),t("a",{attrs:{href:"https://github.com/lightningdevkit/",target:"_blank",rel:"noopener noreferrer"}},[e._v("LDK repo"),t("OutboundLink")],1),e._v(".")])])}),[],!1,null,null,null);t.default=s.exports}}]);