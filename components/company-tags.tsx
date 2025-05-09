import { Badge } from "@/components/ui/badge"
import { Crown } from "lucide-react"

export function CompanyTags() {
  const companies = [
    { name: "Amazon", count: 387, color: "bg-yellow-100 text-yellow-800" },
    { name: "Google", count: 342, color: "bg-blue-100 text-blue-800" },
    { name: "Microsoft", count: 298, color: "bg-green-100 text-green-800" },
    { name: "Facebook", count: 276, color: "bg-indigo-100 text-indigo-800" },
    { name: "Apple", count: 245, color: "bg-gray-100 text-gray-800" },
    { name: "Bloomberg", count: 187, color: "bg-purple-100 text-purple-800" },
    { name: "Adobe", count: 156, color: "bg-red-100 text-red-800" },
    { name: "Uber", count: 134, color: "bg-emerald-100 text-emerald-800" },
  ]

  return (
    <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
      <h3 className="font-medium text-orange-800 mb-3 flex items-center gap-2">
        <Crown className="h-4 w-4" />
        Company Tags
        <Badge variant="outline" className="ml-2 text-xs border-orange-200 text-orange-600">
          Premium
        </Badge>
      </h3>

      <div className="flex flex-wrap gap-2">
        {companies.map((company) => (
          <div
            key={company.name}
            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${company.color}`}
          >
            {company.name}
            <span className="bg-white bg-opacity-50 px-1.5 py-0.5 rounded-full text-xs">{company.count}</span>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-medium text-orange-800 mb-2">Interview Frequency</h4>
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Amazon</span>
              <span>Very High</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="bg-yellow-500 h-full" style={{ width: "92%" }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Google</span>
              <span>High</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full" style={{ width: "85%" }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Microsoft</span>
              <span>Medium</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="bg-green-500 h-full" style={{ width: "70%" }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
