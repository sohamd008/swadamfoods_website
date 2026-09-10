import { WHATSAPP_NUMBER } from "@/lib/products"
import { HelpCircle, ChevronDown } from "lucide-react"

const faqs = [
  {
    question: "What products does Swadam Foods sell?",
    answer:
      "We sell three handcrafted products: Patal Poha Chivda (200 g, ₹90), a ready-to-eat crunchy flattened rice snack; Instant Kanda Poha Premix (150 g, ₹70), ready in 5 minutes with hot water; and Instant Upma Premix (150 g, ₹70), also ready in 5 minutes with hot water.",
  },
  {
    question: "How do I prepare the Instant Kanda Poha Premix?",
    answer:
      "Empty the premix into a bowl, add hot boiling water equal to exactly half the amount of premix (1 part water to 2 parts premix), cover the bowl and let it rest. It will be ready in 5 minutes. Fluff gently and serve.",
  },
  {
    question: "How do I prepare the Instant Upma Premix?",
    answer:
      "Empty the premix into a bowl, add hot boiling water equal to the same amount as the premix (1 part water to 1 part premix), cover the bowl and let it rest. It will be ready in 5 minutes. Fluff gently and serve.",
  },
  {
    question: "How do I order from Swadam Foods?",
    answer:
      "Add your favourite products to the cart on our website, then proceed to checkout to enter your delivery address and pay securely online via PhonePe Payment Gateway (UPI, Cards & NetBanking). You will receive live order tracking and live updates on WhatsApp.",
  },
  {
    question: "Is Swadam Foods a registered business?",
    answer:
      "Yes. We are FSSAI registered (license no. 21526080002094) and UDYAM MSME registered (UDYAM-MH-26-1188295). We are a women-owned and women-operated business based in Pune, Maharashtra.",
  },
  {
    question: "Does Patal Poha Chivda need cooking?",
    answer:
      "No, Patal Poha Chivda is ready to eat — just open the pack and enjoy. It pairs perfectly with a cup of chai or coffee. Reseal the pack tightly after opening to keep it crisp, and store in a cool, dry place away from direct sunlight.",
  },
]

export function FaqSection() {
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}`

  return (
    <section id="faq" className="relative scroll-mt-20 py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="mb-12 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card/80 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary shadow-xs">
            Pantry FAQ
          </span>
          <h2 className="mt-3 text-balance font-heading font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Frequently asked questions
          </h2>
          <p className="mt-3 text-pretty text-muted-foreground">
            Everything you need to know about our Indian snacks, instant premixes, and ordering.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm divide-y divide-border/60">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-6 transition-colors hover:bg-secondary/30"
            >
              <h3 className="flex items-center gap-2.5 font-heading font-serif text-base font-bold text-foreground">
                <HelpCircle className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <span>{faq.question}</span>
              </h3>
              <p className="mt-2 pl-6.5 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-xs sm:text-sm text-muted-foreground">
          Still have questions?{" "}
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-primary transition-colors hover:text-accent underline underline-offset-4"
          >
            Message us on WhatsApp (+91 88888 51522)
          </a>{" "}
          and we&apos;ll be happy to help.
        </p>
      </div>
    </section>
  )
}
