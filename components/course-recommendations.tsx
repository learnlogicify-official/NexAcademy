import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CourseCard } from "@/components/course-card"

// Featured courses data
const featuredCourses = [
  {
    id: "1",
    title: "Python Fundamentals",
    description: "Learn the basics of Python programming language",
    instructor: "Dr. Alex Johnson",
    level: "Beginner",
    duration: "8 weeks",
    enrolled: 1245,
    rating: 4.8,
    progress: 0,
    tags: ["python", "programming", "basics"],
  },
  {
    id: "3",
    title: "Web Development Bootcamp",
    description: "Comprehensive course on modern web development",
    instructor: "Michael Chen",
    level: "Intermediate",
    duration: "12 weeks",
    enrolled: 1567,
    rating: 4.9,
    progress: 0,
    tags: ["web development", "html", "css", "javascript"],
  },
  {
    id: "5",
    title: "React for Beginners",
    description: "Start building modern web applications with React",
    instructor: "David Kim",
    level: "Beginner",
    duration: "8 weeks",
    enrolled: 1432,
    rating: 4.8,
    progress: 0,
    tags: ["react", "javascript", "web development"],
  },
]

export function CourseRecommendations() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended for You</CardTitle>
        <CardDescription>Based on your interests and learning history</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featuredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

