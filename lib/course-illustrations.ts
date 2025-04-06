// Function to get appropriate illustration based on course title and tags
export function getCourseIllustration(title: string, tags: string[]): string {
  const titleLower = title.toLowerCase()
  const tagsLower = tags.map((tag) => tag.toLowerCase())

  // Check for Python courses
  if (titleLower.includes("python") || tagsLower.includes("python")) {
    return "/illustrations/python-course.svg"
  }

  // Check for JavaScript courses
  if (titleLower.includes("javascript") || tagsLower.includes("javascript")) {
    return "/illustrations/javascript-course.svg"
  }

  // Check for Web Development courses
  if (titleLower.includes("web") || tagsLower.includes("web development")) {
    return "/illustrations/web-dev-course.svg"
  }

  // Check for Data Structures & Algorithms
  if (
    titleLower.includes("data structure") ||
    titleLower.includes("algorithm") ||
    tagsLower.includes("dsa") ||
    tagsLower.includes("algorithms")
  ) {
    return "/illustrations/data-structures-course.svg"
  }

  // Check for React courses
  if (titleLower.includes("react") || tagsLower.includes("react")) {
    return "/illustrations/react-course.svg"
  }

  // Check for Machine Learning/AI courses
  if (
    titleLower.includes("machine learning") ||
    titleLower.includes("ai") ||
    tagsLower.includes("machine learning") ||
    tagsLower.includes("ai")
  ) {
    return "/illustrations/machine-learning-course.svg"
  }

  // Default illustration for other courses
  return "/illustrations/coding-course.svg"
}

