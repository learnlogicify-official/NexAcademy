import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

interface PricingCardProps {
  title: string
  price: string
  period?: string
  description: string
  features: string[]
  buttonText: string
  buttonVariant: "default" | "outline"
  popular?: boolean
}

export default function PricingCard({
  title,
  price,
  period,
  description,
  features,
  buttonText,
  buttonVariant,
  popular = false,
}: PricingCardProps) {
  return (
    <div
      className={`relative rounded-xl overflow-hidden transition-all duration-300 ${
        popular
          ? "bg-white shadow-premium border-2 border-blue-600 hover:shadow-card-hover -mt-4 mb-4"
          : "bg-white shadow-premium border border-gray-100 hover:shadow-card-hover"
      }`}
    >
      {popular && (
        <div className="absolute top-0 left-0 right-0 bg-blue-600 text-white text-center text-sm font-medium py-1">
          MOST POPULAR
        </div>
      )}
      <div className={`p-6 ${popular ? "pt-8" : ""}`}>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-500 mb-4">{description}</p>
        <div className="mb-6">
          <span className="text-3xl font-bold">{price}</span>
          {period && <span className="text-gray-500 ml-1">{period}</span>}
        </div>
        <ul className="space-y-3 mb-6">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5 shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Button
          variant={buttonVariant}
          className={`w-full rounded-full ${
            buttonVariant === "default"
              ? "bg-blue-gradient text-white hover:shadow-blue-glow"
              : "border-blue-600 text-blue-600 hover:bg-blue-50"
          }`}
        >
          {buttonText}
        </Button>
      </div>
    </div>
  )
}
