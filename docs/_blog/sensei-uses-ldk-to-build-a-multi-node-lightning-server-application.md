---
title: "Sensei uses LDK to Build a Multi-Node Lightning Server App"
description: "Learn how Sensei built a lightning node app to serve many nodes"
date: "2022-11-19"
authors:
  - John Cantrell
tags:
  - Case Studies 
--- 

Sensei is a lightning node application optimized to serve many nodes within a single instance.  It offers a beautiful web interface for the admin to manage the nodes as well as an interface for individual nodes to perform all of the common lightning network tasks such as connecting to peers, opening and closing channels, and creating and paying invoices.  For programmatic control and automation it exposes http and grpc interfaces to provide full control of the nodes.
 
One goal of the project was to design an application that could make running multiple lightning nodes as lightweight as possible in terms of resource utilization.  We needed a lightning implementation designed for low resource environments and one that could enable sharing of specific components across a set of nodes.

# What we did?

The flexibility that LDK provides was the main reason for using it over the other implementations.  Sensei really needed a way for all of the nodes to share certain components (block data, network graph message handling, pathfinding, etc) and LDK enables this functionality out-of-the-box.

![Sensei architecture](../assets/sensei-architecture.svg)

To do something similar with the other implementations would have required maintaining forks of their projects or running multiple instances of the full daemons. The former creates never-ending maintenance work and the latter could never achieve the desired performance characteristics required.

LDK enabled me to piece together the underlying lightning components exactly how I needed to achieve my goals. I didn’t have to maintain forks containing ugly hacks or be limited by the resource utilization of an existing daemon.

# Results

Using LDK frees up my time to work on the important functionality of my application instead of having to worry about the low-level lightning network protocol details.  It allowed a one person development team to produce a standalone lightning node server with some unique functionality.  It’s still early days for Sensei but I’m already able to use it to run hundreds of lightning nodes on my laptop!