# Building a Node with LDK

## Learn how to build a basic LDK node from scratch using LDK 

The following tutorials will show you how to build the simplest lightning node using LDK, that fufills the following tasks:

1. **Connect to peers** 
2. **Open channels** 
3. **Send Payments** 
4. **Receive Payments**
5. **Close channels**

### Foundational Components

Let's start by looking at the core components we'll need to make this node work for the tasks we outlined above.

1. A Peer Manager, for establishing TCP/IP connections to other nodes on the lightning network.
2. A Channel Manager, to open and close channels.
3. Payments & Routing, ability to create and pay invoices.

To make the above work we also need a series of supporting modules, including:
 - A Fee Estimator 
 - A Logger 
 - A Transaction Broadcaster 
 - A Network Graph 
 - A Persister
 - An Event Handler 
 - A Transaction Filter 
 - A Chain Monitor 
 - A Keys Manager 
 - A Scorer 