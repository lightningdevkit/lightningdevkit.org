# Networking

To enable you to run a full Lightning node on an embedded machine, LDK doesn't specify exactly how to connect to another node at all! The default implementation uses TCP sockets, but, e.g., if you wanted to run your full Lightning node on a hardware wallet, you could, by piping the Lightning network messages over USB/serial and then sending them in a TCP socket from another machine.

Learn more about [connect to peers.](../building-a-node-with-ldk/connect-to-peers.md)