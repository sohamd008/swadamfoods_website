export type Product = {
  id: string
  name: string
  tagline: string
  description: string
  weight: string
  price: number
  image: string
  badge?: string
}

export const WHATSAPP_NUMBER = "918888851522"

export const business = {
  name: "Swadam Foods",
  phoneDisplay: "+91 88888 51522",
  email: "swadamfoods.eu.cc",
  address: "Lane No. 30/31 B, Ganesh Nagar, Dhayari, Pune",
  gstin: "27AOCPD1930N1Z1",
  fssai: "21526080002094",
  udyam: "UDYAM-MH-26-1188295",
  legalEmail: "swadamfoodsindia@gmail.com",
  legalPhone: "8888851522",
} as const

export const products: Product[] = [
  {
    id: "patal-poha-chivda",
    name: "Patal Poha Chivda",
    tagline: "Our signature crunchy classic",
    description:
      "Thin, crisp flattened rice tossed with roasted peanuts, curry leaves and a delicate turmeric-spice blend. A light, moreish tea-time snack made the traditional way.",
    weight: "200 g",
    price: 90,
    image: "/images/patal-poha-chivda.png",
    badge: "Bestseller",
  },
  {
    id: "kanda-poha-premix",
    name: "Instant Kanda Poha Premix",
    tagline: "Maharashtra's favourite breakfast, in minutes",
    description:
      "Everything you need for authentic Kanda Poha in one pack. Just add hot water, rest, and enjoy a soft, fragrant breakfast with onions, chilies and turmeric.",
    weight: "150 g",
    price: 70,
    image: "/images/kanda-poha.png",
    badge: "Ready in 5 min",
  },
  {
    id: "upma-premix",
    name: "Instant Upma Premix",
    tagline: "Comforting South Indian classic",
    description:
      "A savoury semolina premix with curry leaves, mustard, chilies and cashew notes. Add hot water for a warm, wholesome upma anytime of the day.",
    weight: "150 g",
    price: 70,
    image: "/images/upma.png",
    badge: "Ready in 5 min",
  },
]
