export type Product = {
  id: string
  name: string
  tagline: string
  description: string
  weight: string
  price: number
  image: string
  badge?: string
  prepTitle?: string
  prepSteps?: string[]
}

export const WHATSAPP_NUMBER = "918888851522"

export const business = {
  name: "Swadam Foods",
  phoneDisplay: "+91 88888 51522",
  email: "swadamfoodsindia@gmail.com",
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
    image: "/images/patal-poha-chivda.webp",
    badge: "Bestseller",
    prepTitle: "Serving & storage",
    prepSteps: [
      "Ready to eat — no cooking needed. Just open and enjoy.",
      "Pairs perfectly with a cup of chai or coffee.",
      "Reseal the pack tightly after opening to keep it crisp.",
      "Store in a cool, dry place away from direct sunlight.",
    ],
  },
  {
    id: "kanda-poha-premix",
    name: "Instant Kanda Poha Premix",
    tagline: "Maharashtra's favourite breakfast, in minutes",
    description:
      "Everything you need for authentic Kanda Poha in one pack. Just add hot water, rest, and enjoy a soft, fragrant breakfast with onions, chilies and turmeric.",
    weight: "150 g",
    price: 70,
    image: "/images/kanda-poha.webp",
    badge: "Ready in 5 min",
    prepTitle: "How to prepare",
    prepSteps: [
      "Empty the premix into a bowl.",
      "Add hot boiling water equal to exactly half the amount of premix (1 part water to 2 parts premix).",
      "Cover the bowl and let it rest.",
      "It will be ready in 5 minutes. Fluff gently and serve.",
    ],
  },
  {
    id: "upma-premix",
    name: "Instant Upma Premix",
    tagline: "Comforting South Indian classic",
    description:
      "A savoury semolina premix with curry leaves, mustard and chilies. Add hot water for a warm, comforting upma anytime of the day.",
    weight: "150 g",
    price: 70,
    image: "/images/upma.webp",
    badge: "Ready in 5 min",
    prepTitle: "How to prepare",
    prepSteps: [
      "Empty the premix into a bowl.",
      "Add hot boiling water equal to exactly the same amount as the premix (1 part water to 1 part premix).",
      "Cover the bowl and let it rest.",
      "It will be ready in 5 minutes. Fluff gently and serve.",
    ],
  },
]
