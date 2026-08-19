import net from "node:net"
import http from "node:http"

function openHttpTunnel(host, port) {
  return new Promise((resolve, reject) => {
    const proxyHost = process.env.PROXY_HOST
    const proxyPort = Number(process.env.PROXY_PORT) || 3128
    const auth = "Basic " + Buffer.from(
      `${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}`
    ).toString("base64")
    const req = http.request({
      host: proxyHost,
      port: proxyPort,
      method: "CONNECT",
      path: `${host}:${port}`,
      headers: {
        Host: `${host}:${port}`,
        "Proxy-Authorization": auth,
        "Proxy-Connection": "keep-alive",
      },
    })
    req.setTimeout(15000, () => req.destroy(new Error("proxy CONNECT timeout")))
    req.once("connect", (res, socket) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        socket.setKeepAlive(true)
        socket.on("error", () => {})
        resolve(socket)
      } else {
        socket.destroy()
        reject(new Error(`proxy CONNECT failed with status ${res.statusCode}`))
      }
    })
    req.once("error", reject)
    req.end()
  })
}

function parseSocksRequest(buffer) {
  if (buffer.length < 4) return null
  const ver = buffer[0]
  const cmd = buffer[1]
  const atyp = buffer[3]
  if (ver !== 5 || cmd !== 1) {
    const e = new Error(`unsupported socks request ver=${ver} cmd=${cmd}`)
    e.badRequest = true
    throw e
  }
  let host
  let headerLen
  if (atyp === 1) {
    if (buffer.length < 10) return null
    host = [...buffer.subarray(4, 8)].join(".")
    headerLen = 10
  } else if (atyp === 3) {
    if (buffer.length < 5) return null
    const alen = buffer[4]
    if (buffer.length < 5 + alen + 2) return null
    host = buffer.subarray(5, 5 + alen).toString()
    headerLen = 5 + alen + 2
  } else if (atyp === 4) {
    if (buffer.length < 22) return null
    const addr = [...buffer.subarray(4, 20)]
    host = Array.from({ length: 8 }, (_, i) =>
      addr.slice(i * 2, i * 2 + 2).join("")
    ).join(":")
    headerLen = 22
  } else {
    const e = new Error(`unsupported address type ${atyp}`)
    e.badRequest = true
    throw e
  }
  const port = buffer.readUInt16BE(headerLen - 2)
  return { host, port, headerLen }
}

function startSocksBridgeForHttpProxy() {
  return new Promise((resolve, reject) => {
    const server = net.createServer((client) => {
      let buffer = Buffer.alloc(0)
      let handshaked = false
      let connected = false

      const fail = (code) => {
        if (!connected) client.end(Buffer.from([0x05, code, 0x00, 0x01, 0, 0, 0, 0, 0, 0]))
        client.destroy()
      }

      client.on("error", () => {})
      client.on("data", (chunk) => {
        if (connected) return
        buffer = Buffer.concat([buffer, chunk])
        if (!handshaked) {
          if (buffer.length < 2) return
          const nMethods = buffer[1]
          if (buffer.length < 2 + nMethods) return
          const methods = buffer.subarray(2, 2 + nMethods)
          buffer = buffer.subarray(2 + nMethods)
          if (!methods.includes(0x00)) return fail(0xff)
          handshaked = true
          client.write(Buffer.from([0x05, 0x00]))
        }
        try {
          const target = parseSocksRequest(buffer)
          if (!target) return
          openHttpTunnel(target.host, target.port)
            .then((upstream) => {
              client.write(Buffer.from([0x05, 0x00, 0x00, 0x01, 0, 0, 0, 0, 0, 0]))
              connected = true
              const rest = buffer.subarray(target.headerLen)
              buffer = Buffer.alloc(0)
              if (rest.length > 0) upstream.write(rest)
              upstream.pipe(client)
              client.pipe(upstream)
            })
            .catch(() => fail(0x05))
        } catch (e) {
          if (e.badRequest) fail(0x07)
          else fail(0x08)
        }
      })
    })
    server.on("error", reject)
    server.listen(0, "127.0.0.1", () =>
      resolve({ port: server.address().port, close: () => server.close() })
    )
  })
}

export default startSocksBridgeForHttpProxy