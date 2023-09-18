# Closing a Channel

Close Channel

<CodeSwitcher :languages="{rust:'Rust', java:'Java', swift:'Swift'}">
  <template v-slot:rust>

```rust
// TODO: Add Rust Code Here
```

  </template>
  <template v-slot:java>

```java
// TODO: Add Java Code Here
```

  </template>
  <template v-slot:swift>

```Swift
let channelId: [UInt8] = // Add Channel Id in bytes
let counterpartyNodeId: [UInt8] = // Add Counterparty Node Id in bytes
let res = channelManager.closeChannel(channelId: channelId, counterpartyNodeId: counterpartyNodeId)
if res!.isOk() {
    print("Channel Closed")
}
```

  </template>
</CodeSwitcher>


Claim Funds using Custom KeysManager. (Single Fees)

<CodeSwitcher :languages="{rust:'Rust', java:'Java', swift:'Swift'}">
  <template v-slot:rust>

```rust
// TODO: Add Rust Code Here
```

  </template>
  <template v-slot:java>

```java
// TODO: Add Java Code Here
```

  </template>
  <template v-slot:swift>

```Swift
class MyKeysManager {
    let keysManager: KeysManager
    let signerProvider: MySignerProvider // Use signerProvider instead of asSignerProvider()
    let wallet: Wallet

    init(seed: [UInt8], startingTimeSecs: UInt64, startingTimeNanos: UInt32, wallet: Wallet) {
        self.keysManager = KeysManager(seed: seed, startingTimeSecs: startingTimeSecs, startingTimeNanos: startingTimeNanos)
        self.wallet = wallet
        signerProvider = MySignerProvider()
        signerProvider.myKeysManager = self
    }
}

class MySignerProvider: SignerProvider {
    weak var myKeysManager: MyKeysManager?
    override func deriveChannelSigner(channelValueSatoshis: UInt64, channelKeysId: [UInt8]) -> Bindings.WriteableEcdsaChannelSigner {
        return myKeysManager!.keysManager.asSignerProvider().deriveChannelSigner(channelValueSatoshis: channelValueSatoshis, channelKeysId: channelKeysId)
    }
    
    override func generateChannelKeysId(inbound: Bool, channelValueSatoshis: UInt64, userChannelId: [UInt8]) -> [UInt8] {
        return myKeysManager!.keysManager.asSignerProvider().generateChannelKeysId(inbound: inbound, channelValueSatoshis: channelValueSatoshis, userChannelId: userChannelId)
    }
    
    override func readChanSigner(reader: [UInt8]) -> Bindings.Result_WriteableEcdsaChannelSignerDecodeErrorZ {
        return myKeysManager!.keysManager.asSignerProvider().readChanSigner(reader: reader)
    }
    
    override func getDestinationScript() -> [UInt8] {
        do {
            let address = try myKeysManager!.wallet.getAddress(addressIndex: .new)
            return address.address.scriptPubkey().toBytes()
        } catch {
            return myKeysManager!.keysManager.asSignerProvider().getDestinationScript()
        }
    }

    override func getShutdownScriptpubkey() -> Bindings.ShutdownScript {
        do {
            let address = try myKeysManager!.wallet.getAddress(addressIndex: .new).address
            let payload = address.payload()
            if case let .witnessProgram(`version`, `program`) = payload {
                let ver: UInt8
                switch version {
                case .v0:
                    ver = 0
                case .v1:
                    ver = 1
                case .v2:
                    ver = 2
                case .v3:
                    ver = 3
                case .v4:
                    ver = 4
                case .v5:
                    ver = 5
                case .v6:
                    ver = 6
                case .v7:
                    ver = 7
                case .v8:
                    ver = 8
                case .v9:
                    ver = 9
                case .v10:
                    ver = 10
                case .v11:
                    ver = 11
                case .v12:
                    ver = 12
                case .v13:
                    ver = 13
                case .v14:
                    ver = 14
                case .v15:
                    ver = 15
                case .v16:
                    ver = 16
                }
                let res = ShutdownScript.newWitnessProgram(version: ver, program: program)
                if res.isOk() {
                    return res.getValue()!
                }
            }
            return myKeysManager!.keysManager.asSignerProvider().getShutdownScriptpubkey()
        } catch {
            return myKeysManager!.keysManager.asSignerProvider().getShutdownScriptpubkey()
        }
    }
}
```

  </template>
</CodeSwitcher>

Claim Funds using Events. (Double Fees)

<CodeSwitcher :languages="{rust:'Rust', java:'Java', swift:'Swift'}">
  <template v-slot:rust>

```rust
// TODO: Add Rust Code Here
```

  </template>
  <template v-slot:java>

```java
// TODO: Add Java Code Here
```

  </template>
  <template v-slot:swift>

```Swift
func handleEvent(event: Event) {
    if let event = event.getValueAsSpendableOutputs() {
        let outputs = event.getOutputs()
        do {
            let address = ldkManager!.bdkManager.getAddress(addressIndex: .new)!
            let script = try Address(address: address).scriptPubkey().toBytes()
            let res = ldkManager?.keysManager?.spendSpendableOutputs(descriptors: outputs, outputs: [], changeDestinationScript: script, feerateSatPer1000Weight: 1000)
            if res!.isOk() {
                ldkManager.broadcaster.broadcastTransaction(tx: res!.getValue()!)
            }
        } catch {
            print(error)
        }
    }
}
```

  </template>

</CodeSwitcher>