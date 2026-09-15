export function numberToWordsINR(amount: number): string {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"]
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]

  const twoDigits = (value: number): string => {
    if (value === 0) return ""
    if (value < 20) return ones[value]
    return tens[Math.floor(value / 10)] + (value % 10 ? ` ${ones[value % 10]}` : "")
  }

  const threeDigits = (value: number): string => {
    const hundred = Math.floor(value / 100)
    const remainder = value % 100
    return [hundred ? `${ones[hundred]} Hundred` : "", remainder ? twoDigits(remainder) : ""].filter(Boolean).join(" ")
  }

  const rounded = Math.max(0, Math.round(amount))
  if (rounded === 0) return "INR Zero Only"

  let value = rounded
  const crore = Math.floor(value / 10_000_000)
  value %= 10_000_000
  const lakh = Math.floor(value / 100_000)
  value %= 100_000
  const thousand = Math.floor(value / 1_000)
  const remainder = value % 1_000

  return `INR ${[
    crore ? `${twoDigits(crore)} Crore` : "",
    lakh ? `${twoDigits(lakh)} Lakh` : "",
    thousand ? `${twoDigits(thousand)} Thousand` : "",
    remainder ? threeDigits(remainder) : "",
  ].filter(Boolean).join(" ")} Only`
}

export function formatInvoiceNumber(orderId: string): string {
  return `INV-${orderId.replace(/^(SWAD-|SWD-)/i, "")}`
}
