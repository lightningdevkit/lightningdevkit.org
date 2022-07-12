---
title: "Introducing Phantom Node Payments"
description: "Phantom node payments let enterprise users running high-volume lightning nodes generate invoices that can be paid to one of multiple production nodes."
date: "2022-07-11"
authors:
  - Valentine Wallace
tags:
  - Enterprise 
  - Phantom
--- 

Introducing phantom node payments, a new-ish feature for LDK.

Phantom node payments let enterprise users running high-volume lightning nodes generate invoices that can be paid to one of multiple production nodes. Since it’s safe to assume that payers will retry along an alternate route hint if one fails, phantom payments allow for load balancing between nodes and resilience if a node or nodes go down.

## Phantom Payment Flow

Using LNMerchant as an example company, here’s how phantom payments work:  

1. Buyer on the Lightning Network requests an invoice 

2. LNMerchant replies with an invoice. Per standard invoice protocol, it contains information on routing to LNMerchant. However, unlike conventional invoice route hints, phantom route hints include a combination of real and fake routing information. This fake or “phantom” routing information will later signal to LDK that the payment’s intended destination is a phantom node.

The following illustration demonstrates how phantom route hints work:

![Phantom Hints](../assets/phantom-hints.png)

3. The buyer’s node generates a normal route. Using the route hints, the last two hops are [LNMerchantNode, PhantomNode], i.e., the phantom node is the destination node, and the second-to-last hop is an actual LNMerchant node. (Note: If the LNMerchant has public channels, only the last hop containing the fake channel is strictly necessary for the route hints.)

The buyer uses this route, including the fake forwarding information from the route hints, to generate the payment onion. On Lightning, each hop along the route unwraps one layer of sender-constructed onion.

4. The buyer forwards the payment to the route’s first hop, which gets forwarded through intermediate hops.

5. The payment forwards to the second-to-last hop, an actual LNMerchant node. 

6. The LNMerchant node checks what channel to forward the payment to and recognizes a phantom channel ID. 

7. The LNMerchant node knows the phantom node’s secret key, so it can unwrap the last layer of the onion and verify the payment details. It also knows the preimage for the payment, so it can claim the amount owed without forwarding the payment to the non-existent phantom.

![Phantom PMT](../assets/phantom-pmt.png)
## Why It’s OK to Not Support MPP
One potential drawback to phantom node payments is the lack of multi-path payments (MPP) support.

MPP payments benefit large transactions because they aren’t restricted to routes where each channel must carry its entire payment balance. 

With this in mind, a compelling compromise is to:  
 - Create MPP-supporting invoices against a single node for large payments.
 - Create phantom invoices for smaller payments, which are the most common and are unlikely to use MPP.

## Why MPP Shouldn’t Be Enabled
 
 Let’s say that we want to implement MPP for phantom payments. In this case, each real LNMerchant node may receive a slice of the phantom node-destined phantom payment. In this case, the question becomes: How do real nodes know when a payment is accepted across all nodes so that it’s safe to release the preimage?

On the surface, it seems like users should be able to tell LDK when a payment has been received across all nodes and is safe to claim. However, this would significantly compromise our safety guarantees because releasing the preimage before receiving the total payment value opens up the possibility for intermediate nodes to claim remaining payment parts. Furthermore, implementing this would violate our API’s layers of abstraction, giving users a power that only LDK should access.

---

Thanks for taking the time to learn about phantom nodes and payments. We think it’s an exciting showcase for the lightning protocol’s flexibility and variety of use cases. 

Want to make your own contribution to LDK? Join us on GitHub at our [LDK repo](https://github.com/lightningdevkit/). 