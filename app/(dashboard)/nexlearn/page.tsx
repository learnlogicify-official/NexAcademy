import { Button } from "@/components/ui/button"
import { ChevronRight, Star, Award, BookOpen, Users, CheckCircle, TrendingUp } from "lucide-react"
import CourseCard from "./components/course-card"
import FeaturedCourse from "./components/featured-course"
import { Badge } from "@/components/ui/badge"
import CategoryCard from "./components/category-card"
import StatCard from "./components/stat-card"
import TestimonialCard from "./components/testimonial-card"
import PricingCard from "./components/pricing-card"

export default function NexLearnPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <section className="bg-hero-pattern py-20 md:py-32 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/hero-dots.png')] opacity-10"></div>
          <div className="container px-4 md:px-6 relative">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4 animate-slide-up">
                <div className="space-y-2">
                  <Badge className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm">
                    Premium Learning Experience
                  </Badge>
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Elevate Your Skills with <span className="text-blue-200">NexLearn</span>
                  </h1>
                  <p className="max-w-[600px] text-blue-50 md:text-xl">
                    Access world-class education from industry experts. Transform your career with our premium courses
                    and personalized learning paths.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button className="bg-white text-blue-600 hover:bg-blue-50 rounded-full group transition-all duration-300">
                    Explore Courses
                    <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white text-white hover:bg-white/20 rounded-full bg-transparent backdrop-blur-sm"
                  >
                    View Learning Paths
                  </Button>
                </div>
                <div className="flex items-center gap-4 mt-6">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden">
                        <img src={`/avatar-${i}.png`} alt={`User ${i}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <div className="text-sm">
                    <span className="font-bold">10,000+</span> students already enrolled
                  </div>
                </div>
              </div>
              <div className="flex justify-center lg:justify-end animate-slide-down">
                <div className="relative">
                  <div className="absolute -inset-1 bg-blue-600 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
                  <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-2 shadow-premium">
                    <img
                      src="/hero-dashboard.png"
                      alt="NexLearn Dashboard"
                      className="rounded-xl object-cover shadow-lg"
                      width={550}
                      height={400}
                    />
                  </div>
                  <div className="absolute -bottom-6 -left-6 bg-white rounded-lg shadow-premium p-3 animate-bounce">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-600">Certified Courses</span>
                    </div>
                  </div>
                  <div className="absolute -top-6 -right-6 bg-white rounded-lg shadow-premium p-3 animate-pulse">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-600">Career Growth</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
        </section>

        <section className="py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
              <StatCard icon={<Users className="h-6 w-6 text-blue-600" />} value="100,000+" label="Active Students" />
              <StatCard icon={<BookOpen className="h-6 w-6 text-blue-600" />} value="500+" label="Premium Courses" />
              <StatCard icon={<Award className="h-6 w-6 text-blue-600" />} value="200+" label="Expert Instructors" />
              <StatCard icon={<Star className="h-6 w-6 text-blue-600" />} value="4.9" label="Average Rating" />
            </div>

            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2 max-w-3xl">
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Top Categories</Badge>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Explore Our Premium Categories</h2>
                <p className="text-gray-500 md:text-xl/relaxed">
                  Discover high-quality courses across various domains to accelerate your career growth.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
              <CategoryCard
                title="Development"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="m18 16 4-4-4-4"></path>
                    <path d="m6 8-4 4 4 4"></path>
                    <path d="m14.5 4-5 16"></path>
                  </svg>
                }
                count={120}
                color="bg-gradient-to-br from-blue-500 to-blue-700"
              />
              <CategoryCard
                title="Data Science"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M3 3v18h18"></path>
                    <path d="m19 9-5 5-4-4-3 3"></path>
                  </svg>
                }
                count={85}
                color="bg-gradient-to-br from-purple-500 to-purple-700"
              />
              <CategoryCard
                title="Business"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                  </svg>
                }
                count={95}
                color="bg-gradient-to-br from-amber-500 to-amber-700"
              />
              <CategoryCard
                title="Design"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <circle cx="12" cy="12" r="6"></circle>
                    <circle cx="12" cy="12" r="2"></circle>
                  </svg>
                }
                count={78}
                color="bg-gradient-to-br from-pink-500 to-pink-700"
              />
              <CategoryCard
                title="Marketing"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"></path>
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                    <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"></path>
                    <path d="M2 7h20"></path>
                    <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"></path>
                  </svg>
                }
                count={64}
                color="bg-gradient-to-br from-green-500 to-green-700"
              />
              <CategoryCard
                title="IT & Software"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <rect width="20" height="14" x="2" y="3" rx="2"></rect>
                    <line x1="8" x2="16" y1="21" y2="21"></line>
                    <line x1="12" x2="12" y1="17" y2="21"></line>
                  </svg>
                }
                count={110}
                color="bg-gradient-to-br from-cyan-500 to-cyan-700"
              />
            </div>

            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2 max-w-3xl">
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Featured</Badge>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Premium Featured Course</h2>
                <p className="text-gray-500 md:text-xl/relaxed">
                  Our most popular and highly-rated course with comprehensive curriculum and expert instruction.
                </p>
              </div>
            </div>

            <div className="mb-16">
              <FeaturedCourse />
            </div>

            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2 max-w-3xl">
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Trending Now</Badge>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Most Popular Courses</h2>
                <p className="text-gray-500 md:text-xl/relaxed">
                  Explore our highest-rated and most enrolled courses across various categories.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              <CourseCard
                title="Advanced Web Development Bootcamp"
                description="Master modern web development with React, Node.js, and cloud deployment strategies."
                category="Development"
                level="Advanced"
                duration="12 weeks"
                instructor="Sarah Johnson"
                image="/web-development-course.png"
                rating={4.9}
                students={2456}
                featured={true}
              />
              <CourseCard
                title="Data Science & Machine Learning Mastery"
                description="Comprehensive guide to data analysis, visualization, and building machine learning models."
                category="Data Science"
                level="Intermediate"
                duration="10 weeks"
                instructor="Michael Chen"
                image="/data-science-course.png"
                rating={4.8}
                students={1872}
                featured={true}
              />
              <CourseCard
                title="UI/UX Design: From Concept to Prototype"
                description="Learn to create stunning user interfaces and seamless user experiences for digital products."
                category="Design"
                level="Beginner"
                duration="8 weeks"
                instructor="Emily Rodriguez"
                image="/ui-ux-design-course.png"
                rating={4.9}
                students={2105}
                featured={true}
              />
              <CourseCard
                title="Modern JavaScript Frameworks"
                description="Deep dive into React, Vue, and Angular for building modern web applications."
                category="Development"
                level="Advanced"
                duration="12 weeks"
                instructor="David Kim"
                image="/javascript-frameworks-course.png"
                rating={4.7}
                students={1654}
              />
              <CourseCard
                title="Digital Marketing & Growth Strategies"
                description="Learn effective digital marketing techniques for business growth and customer acquisition."
                category="Marketing"
                level="Intermediate"
                duration="8 weeks"
                instructor="Jessica Williams"
                image="/digital-marketing-course.png"
                rating={4.8}
                students={1932}
              />
              <CourseCard
                title="Cloud Architecture & DevOps"
                description="Master cloud platforms and learn to deploy scalable, resilient applications."
                category="IT & Software"
                level="Advanced"
                duration="10 weeks"
                instructor="Robert Taylor"
                image="/cloud-computing-course.png"
                rating={4.9}
                students={1487}
              />
            </div>

            <div className="flex justify-center">
              <Button className="bg-blue-gradient text-white hover:shadow-blue-glow transition-all duration-300 rounded-full group">
                View All Courses
                <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/pattern-dots.png')] opacity-5"></div>
          <div className="container px-4 md:px-6 relative">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
              <div className="space-y-2 max-w-3xl">
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Premium Experience</Badge>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Why Choose NexLearn Premium</h2>
                <p className="text-gray-500 md:text-xl/relaxed">
                  We offer a premium learning experience with features designed to accelerate your career growth.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="flex flex-col items-center text-center space-y-4 p-8 bg-white rounded-2xl shadow-premium hover:shadow-card-hover transition-all duration-300 group">
                <div className="p-4 rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors duration-300">
                  <Award className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Industry-Recognized Certificates</h3>
                <p className="text-gray-500">
                  Earn certificates that boost your professional credibility and showcase your expertise to employers.
                </p>
                <ul className="text-left space-y-2 w-full">
                  {["Accredited certifications", "Shareable credentials", "Employer verification"].map((item, i) => (
                    <li key={i} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col items-center text-center space-y-4 p-8 bg-white rounded-2xl shadow-premium hover:shadow-card-hover transition-all duration-300 group md:-mt-4 md:mb-4">
                <div className="absolute -top-3 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  MOST POPULAR
                </div>
                <div className="p-4 rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors duration-300">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">1-on-1 Mentorship</h3>
                <p className="text-gray-500">
                  Get personalized guidance from industry experts who provide feedback and career advice.
                </p>
                <ul className="text-left space-y-2 w-full">
                  {["Weekly 1:1 sessions", "Project reviews", "Career guidance", "Resume building"].map((item, i) => (
                    <li key={i} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col items-center text-center space-y-4 p-8 bg-white rounded-2xl shadow-premium hover:shadow-card-hover transition-all duration-300 group">
                <div className="p-4 rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors duration-300">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Exclusive Learning Resources</h3>
                <p className="text-gray-500">
                  Access premium content, downloadable resources, and real-world projects not available elsewhere.
                </p>
                <ul className="text-left space-y-2 w-full">
                  {["Premium video content", "Downloadable resources", "Real-world projects", "Source code access"].map(
                    (item, i) => (
                      <li key={i} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-blue-gradient text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/testimonial-pattern.png')] opacity-10"></div>
          <div className="container px-4 md:px-6 relative">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
              <div className="space-y-2 max-w-3xl">
                <Badge className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm">Testimonials</Badge>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">What Our Students Say</h2>
                <p className="text-blue-100 md:text-xl/relaxed">
                  Hear from our students who have transformed their careers with NexLearn.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <TestimonialCard
                quote="NexLearn transformed my career. Within three months of completing my certification, I landed my dream job at a top tech company."
                name="Alex Thompson"
                title="Software Developer"
                image="/testimonial-1.png"
              />
              <TestimonialCard
                quote="The 1-on-1 mentorship was invaluable. My mentor provided personalized guidance that helped me navigate complex projects with confidence."
                name="Sophia Martinez"
                title="Data Scientist"
                image="/testimonial-2.png"
              />
              <TestimonialCard
                quote="The quality of instruction is unmatched. The instructors are industry experts who provide real-world insights you can't get elsewhere."
                name="James Wilson"
                title="UX Designer"
                image="/testimonial-3.png"
              />
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
              <div className="space-y-2 max-w-3xl">
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Pricing</Badge>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Choose Your Learning Plan</h2>
                <p className="text-gray-500 md:text-xl/relaxed">
                  Flexible pricing options designed to fit your learning needs and budget.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <PricingCard
                title="Basic"
                price="Free"
                description="Perfect for beginners exploring new skills"
                features={[
                  "Access to free courses",
                  "Basic community support",
                  "Course completion certificates",
                  "Limited course materials",
                ]}
                buttonText="Get Started"
                buttonVariant="outline"
              />

              <PricingCard
                title="Premium"
                price="$29"
                period="per month"
                description="Our most popular plan for serious learners"
                features={[
                  "Unlimited access to all courses",
                  "1-on-1 mentorship sessions",
                  "Premium certificates",
                  "Downloadable resources",
                  "Priority support",
                ]}
                buttonText="Get Premium"
                buttonVariant="default"
                popular={true}
              />

              <PricingCard
                title="Enterprise"
                price="$199"
                period="per month"
                description="For teams and organizations"
                features={[
                  "Everything in Premium",
                  "Custom learning paths",
                  "Team analytics dashboard",
                  "Dedicated account manager",
                  "Custom certification program",
                  "API access",
                ]}
                buttonText="Contact Sales"
                buttonVariant="outline"
              />
            </div>
          </div>
        </section>

        <section className="py-16 bg-blue-gradient text-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <Badge className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm">
                    Limited Time Offer
                  </Badge>
                  <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Ready to Transform Your Career?</h2>
                  <p className="text-blue-100 md:text-xl/relaxed">
                    Join thousands of students already learning on NexLearn. Get 30% off Premium for your first 3
                    months.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button className="bg-white text-blue-600 hover:bg-blue-50 rounded-full group transition-all duration-300">
                    Get Premium Now
                    <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white text-white hover:bg-white/20 rounded-full backdrop-blur-sm"
                  >
                    Learn More
                  </Button>
                </div>
                <div className="flex items-center gap-4 mt-6">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden">
                        <img src={`/avatar-${i}.png`} alt={`User ${i}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <div className="text-sm">
                    <span className="font-bold">Join 10,000+</span> professionals today
                  </div>
                </div>
              </div>
              <div className="flex justify-center lg:justify-end">
                <div className="relative">
                  <div className="absolute -inset-1 bg-white rounded-2xl blur-xl opacity-20 animate-pulse"></div>
                  <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-premium">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col items-center p-4 bg-white/10 backdrop-blur-md rounded-xl">
                        <div className="text-4xl font-bold">30%</div>
                        <div className="text-sm">Discount</div>
                      </div>
                      <div className="flex flex-col items-center p-4 bg-white/10 backdrop-blur-md rounded-xl">
                        <div className="text-4xl font-bold">3</div>
                        <div className="text-sm">Months</div>
                      </div>
                      <div className="flex flex-col items-center p-4 bg-white/10 backdrop-blur-md rounded-xl">
                        <div className="text-4xl font-bold">500+</div>
                        <div className="text-sm">Courses</div>
                      </div>
                      <div className="flex flex-col items-center p-4 bg-white/10 backdrop-blur-md rounded-xl">
                        <div className="text-4xl font-bold">24/7</div>
                        <div className="text-sm">Support</div>
                      </div>
                    </div>
                    <div className="mt-6 p-4 bg-white/10 backdrop-blur-md rounded-xl">
                      <div className="text-center mb-2 font-medium">Limited Time Offer Ends In:</div>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="bg-white/20 backdrop-blur-md rounded-lg p-2">
                          <div className="text-2xl font-bold">02</div>
                          <div className="text-xs">Days</div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-md rounded-lg p-2">
                          <div className="text-2xl font-bold">18</div>
                          <div className="text-xs">Hours</div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-md rounded-lg p-2">
                          <div className="text-2xl font-bold">45</div>
                          <div className="text-xs">Mins</div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-md rounded-lg p-2">
                          <div className="text-2xl font-bold">30</div>
                          <div className="text-xs">Secs</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
