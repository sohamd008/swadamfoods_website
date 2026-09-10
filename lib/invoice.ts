export function numberToWordsINR(amount: number): string {
  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"
  ]
  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
  ]

  function convertTwoDigits(n: number): string {
    if (n === 0) return ""
    if (n < 20) return ones[n]
    return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "")
  }

  function convertThreeDigits(n: number): string {
    const hundred = Math.floor(n / 100)
    const rest = n % 100
    let res = ""
    if (hundred > 0) res += ones[hundred] + " Hundred"
    if (rest > 0) res += (res ? " " : "") + convertTwoDigits(rest)
    return res
  }

  const rounded = Math.round(amount)
  if (rounded === 0) return "INR Zero Only"

  let num = rounded
  const crore = Math.floor(num / 10000000)
  num %= 10000000
  const lakh = Math.floor(num / 100000)
  num %= 100000
  const thousand = Math.floor(num / 1000)
  num %= 1000
  const remainder = num

  let parts: string[] = []
  if (crore > 0) parts.push(convertTwoDigits(crore) + " Crore")
  if (lakh > 0) parts.push(convertTwoDigits(lakh) + " Lakh")
  if (thousand > 0) parts.push(convertTwoDigits(thousand) + " Thousand")
  if (remainder > 0) parts.push(convertThreeDigits(remainder))

  return "INR " + parts.join(" ") + " Only"
}
