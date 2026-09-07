import { WHATSAPP_NUMBER } from "@/lib/products"

const faqs = [
  {
    question: "What products does Swadam Foods sell?",
    answer:
      "We sell three products: Patal Poha Chivda (200 g, ₹90), a ready-to-eat crunchy flattened rice snack; Instant Kanda Poha Premix (150 g, ₹70), ready in 5 minutes with hot water; and Instant Upma Premix (150 g, ₹70), also ready in 5 minutes with hot water.",
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
      "Add your favourite products to the cart on our website, then check out via WhatsApp. We confirm the order and arrange delivery. You can also message us directly on WhatsApp at +91 88888 51522.",
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
    <section id="faq" className="scroll-mt-20 py-16 md:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="mb-10 text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            Questions & Answers
          </span>
          <h2 className="mt-2 text-balance font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-3 text-pretty text-muted-foreground">
            Everything you need to know about our Indian snacks and instant
            premixes.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map((faq) => (
            <div
              key={faq.question}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <h3 className="font-heading text-base font-bold text-foreground">
                {faq.question}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Still have questions?{" "}
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary transition-colors hover:text-accent"
          >
            Message us on WhatsApp
          </a>{" "}
          and we&apos;ll be happy to help.
        </p>
      </div>
    </section>
  )
}
