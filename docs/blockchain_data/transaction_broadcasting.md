# Transaction Broadcasting

Inevitably, LDK will need to broadcast transactions on your behalf. As you
notify it of blocks, it will determine if it should broadcast a transaction and
do so using an implementation of `BroadcasterInterface` that you have provided.

And as those transactions or those from your peers are confirmed on-chain, they
will be likewise processed when notified of a connected block. Thus, continuing
the cycle.