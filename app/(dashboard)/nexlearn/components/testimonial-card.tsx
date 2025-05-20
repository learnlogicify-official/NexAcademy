interface TestimonialCardProps {
    quote: string
    name: string
    title: string
    image: string
  }
  
  export default function TestimonialCard({ quote, name, title, image }: TestimonialCardProps) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-premium hover:shadow-card-hover transition-all duration-300">
        <div className="flex flex-col h-full">
          <div className="mb-4">
            <svg
              width="45"
              height="36"
              className="text-blue-300 opacity-70"
              viewBox="0 0 45 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13.5 0C6.04416 0 0 6.04416 0 13.5C0 20.9558 6.04416 27 13.5 27H18V36H9C4.02944 36 0 31.9706 0 27V13.5C0 6.04416 6.04416 0 13.5 0ZM40.5 0C33.0442 0 27 6.04416 27 13.5C27 20.9558 33.0442 27 40.5 27H45V36H36C31.0294 36 27 31.9706 27 27V13.5C27 6.04416 33.0442 0 40.5 0Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <p className="text-blue-50 mb-6 flex-grow">{quote}</p>
          <div className="flex items-center mt-auto">
            <div className="w-12 h-12 rounded-full overflow-hidden mr-4 border-2 border-white/30">
              <img src={image || "/placeholder.svg"} alt={name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h4 className="font-bold text-white">{name}</h4>
              <p className="text-blue-200 text-sm">{title}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
  