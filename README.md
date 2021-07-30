# Attic Server Etomon Location

Allows `@etomon/etomon-location` to be used from the RPC interface of `@znetstar/attic-server`.

For the parameters of each RPC call see [the `@etomon/etomon-location` documentation](https://etomonusa.github.io/etomon-location/interfaces/IGeoRPCHandler.html).

## Example

You need an `AccessToken` with the following scopes: `['rpc.resolveOneLocation', 'rpc.resolveLocations', 'rpc.autocompleteSearch']`.
```javascript
const token = await (await fetch('https://some-attic-server/auth/token', {
    method: "POST",
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "client_id": "some-client-id",
      "client_secret": "some-client-secret",
      "redirect_uri": "http://some-redirect-uri",
      "grant_type": "client_credentials",
      "username": "some-user",
      "scope": ['rpc.resolveOneLocation', 'rpc.resolveLocations', 'rpc.autocompleteSearch']
    })
})).json();
```

Then you can make the RPC calls using the accccess token
```javascript
const token = await (await fetch('https://some-attic-server/rpc', {
    method: "POST",
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer some-access-token'
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: (new Date()).getTime(),
      method: 'resolveOneLocation',
      params: [
        { 
            "ipAddress": "58.217.200.35"
        }
      ]
    })
})).json();
```
