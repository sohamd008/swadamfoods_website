export function sanitizePhone(raw: string): string {
  let clean = raw.replace(/\D/g, "")
  if (clean.length === 12 && clean.startsWith("91")) {
    clean = clean.slice(2)
  } else if (clean.length === 11 && clean.startsWith("0")) {
    clean = clean.slice(1)
  }
  return clean.slice(0, 10)
}

export function validateIndianMobile(raw: string): { isValid: boolean; error?: string; cleanPhone: string } {
  const digits = sanitizePhone(raw)

  if (digits.length === 0) {
    return { isValid: false, error: "Please enter your 10-digit mobile number.", cleanPhone: "" }
  }

  if (digits.length !== 10) {
    return { isValid: false, error: "Mobile number must be exactly 10 digits.", cleanPhone: digits }
  }

  if (!/^[6-9]/.test(digits)) {
    return { isValid: false, error: "Indian mobile numbers must start with 6, 7, 8, or 9.", cleanPhone: digits }
  }

  if (/^(\d)\1{9}$/.test(digits)) {
    return { isValid: false, error: "Please enter a valid mobile number, not repeated digits.", cleanPhone: digits }
  }

  if (new Set(digits.split("")).size < 3) {
    return { isValid: false, error: "Please enter a valid mobile number, not dummy digits.", cleanPhone: digits }
  }

  if (/(\d)\1{5,}/.test(digits)) {
    return { isValid: false, error: "Please enter a valid mobile number.", cleanPhone: digits }
  }

  const dummySequences = ["0123456789", "1234567890", "0987654321"]
  if (dummySequences.includes(digits)) {
    return { isValid: false, error: "Please enter a valid mobile number.", cleanPhone: digits }
  }

  return { isValid: true, cleanPhone: digits }
}
