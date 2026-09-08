import { NextResponse } from "next/server"

export async function GET() {
  return new NextResponse(
    JSON.stringify({
      error: "Payment Required",
      message: "This endpoint requires an x402 payment protocol settlement.",
      x402: {
        version: 2,
        scheme: "exact",
        network: "eip155:8453",
        asset: "USDC",
        amount: "1000",
        payTo: "0x023184fe62881ed1d938192b7a4b09d0119d7d39"
      }
    }),
    {
      status: 402,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Payment-Required": "x402",
        "X-Payment-Required": "x402",
        "WWW-Authenticate": 'x402 realm="Swadam Foods API", network="eip155:8453", asset="USDC", amount="1000"'
      }
    }
  )
}

export async function POST() {
  return GET()
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Payment, X-Payment-Proof"
    }
  })
}
