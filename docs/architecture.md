## LDK Architecture
![LDK Architecture](./assets/ldk-architecture.svg)

LDK's core components are shown in the center box labeled `lightning`. Boxes
with dotted borders are LDK's batteries — these must be configured with either
off-the-shelf or custom implementations that you provide.

EventHandler in the diagram is not so much a necessary LDK battery, but instead
refers to the fact that LDK generates events that the user should handle (e.g.
the `PaymentReceived` event).