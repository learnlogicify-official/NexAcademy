import {
  Code,
  FileCode,
  Braces,
  Database,
  Atom,
  TreePine,
  Cpu,
  Globe,
  Smartphone,
  BarChart,
  Cloud,
  Shield,
  Gamepad2,
  Boxes,
  Brush,
  Network,
  type LucideIcon,
} from "lucide-react"

interface CourseTheme {
  icon: LucideIcon
  color: string
  bgColor: string
}

export function getCourseTheme(title: string, tags: string[] = []): CourseTheme {
  // Combine title and tags for better matching
  const allText = [title.toLowerCase(), ...tags.map((tag) => tag.toLowerCase())].join(" ")

  // Python
  if (allText.includes("python")) {
    return {
      icon: FileCode,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    }
  }

  // JavaScript
  if (allText.includes("javascript") || allText.includes("js")) {
    return {
      icon: Braces,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    }
  }

  // React
  if (allText.includes("react")) {
    return {
      icon: Atom,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    }
  }

  // Web Development
  if (allText.includes("web") || allText.includes("html") || allText.includes("css")) {
    return {
      icon: Globe,
      color: "text-sky-400",
      bgColor: "bg-sky-400/10",
    }
  }

  // Data Structures & Algorithms
  if (allText.includes("data structure") || allText.includes("algorithm") || allText.includes("dsa")) {
    return {
      icon: TreePine,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    }
  }

  // Machine Learning / AI
  if (
    allText.includes("machine learning") ||
    allText.includes("ai") ||
    allText.includes("artificial intelligence") ||
    allText.includes("data science")
  ) {
    return {
      icon: BarChart,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    }
  }

  // Mobile Development
  if (
    allText.includes("mobile") ||
    allText.includes("android") ||
    allText.includes("ios") ||
    allText.includes("flutter") ||
    allText.includes("react native")
  ) {
    return {
      icon: Smartphone,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    }
  }

  // Database
  if (allText.includes("database") || allText.includes("sql") || allText.includes("nosql")) {
    return {
      icon: Database,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    }
  }

  // Cloud Computing
  if (allText.includes("cloud") || allText.includes("aws") || allText.includes("azure") || allText.includes("devops")) {
    return {
      icon: Cloud,
      color: "text-sky-500",
      bgColor: "bg-sky-500/10",
    }
  }

  // Cybersecurity
  if (allText.includes("security") || allText.includes("cyber") || allText.includes("hack")) {
    return {
      icon: Shield,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    }
  }

  // Game Development
  if (allText.includes("game")) {
    return {
      icon: Gamepad2,
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
    }
  }

  // UI/UX Design
  if (allText.includes("design") || allText.includes("ui") || allText.includes("ux")) {
    return {
      icon: Brush,
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
    }
  }

  // Systems Programming
  if (allText.includes("c++") || allText.includes("rust") || allText.includes("system")) {
    return {
      icon: Cpu,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    }
  }

  // Networking
  if (allText.includes("network") || allText.includes("protocol")) {
    return {
      icon: Network,
      color: "text-teal-500",
      bgColor: "bg-teal-500/10",
    }
  }

  // Microservices / Architecture
  if (allText.includes("microservice") || allText.includes("architecture")) {
    return {
      icon: Boxes,
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
    }
  }

  // Default - General Programming
  return {
    icon: Code,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  }
}

