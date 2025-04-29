import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import { FaListUl, FaStar, FaRegStar } from "react-icons/fa";
import { MdSlowMotionVideo } from "react-icons/md";
import Link from "next/link";
import type { IconType } from "react-icons";

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  earnedXP: number;
  totalXP: number;
  progress: number;
  lastAccessed: string;
  tags: string[];
  certificate: boolean;
  level: string;
  icon: IconType;
  bannerColor: string;
  topics: number;
  videos: number;
  rating: number;
  enrolledCount: number;
  isLiked: boolean;
  url: string;
}

interface CourseCardProps {
  course: Course;
}

// Format number utility
const formatNumber = (num?: number): string => {
  if (typeof num !== "number" || isNaN(num)) return "0";
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
};

// Rating renderer
const renderRating = (rating: number) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const stars = [];

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(<FaStar key={i} className="text-yellow-400" size={14} />);
    } else if (i === fullStars && hasHalfStar) {
      stars.push(<FaStar key={i} className="text-yellow-400" size={14} />);
    } else {
      stars.push(<FaRegStar key={i} className="text-gray-300" size={14} />);
    }
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex">{stars}</div>
      <span className="text-sm text-gray-600">{rating.toFixed(1)}</span>
    </div>
  );
};

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-all h-full">
      <CardContent className="p-0 flex flex-col h-full justify-between">
        <div
          className="p-6 h-full"
          style={{ backgroundColor: course.bannerColor }}
        >
          <div className="flex flex-row items-center justify-between">
            <div className="bg-white dark:bg-[#121212] inline-block px-4 py-0.5 text-xs font-medium rounded-full text-gray-800 dark:text-white">
              {course.level}
            </div>
            <div className="w-10 h-10 bg-white dark:bg-[#121212] rounded-lg flex justify-center items-center text-gray-800 dark:text-white">
              {course.icon && <course.icon size={25} />}
            </div>
          </div>

          {/* Title */}
          <div className="text-xl font-bold mt-2.5 pl-1.5 leading-[30px] text-gray-800">
            {course.title}
          </div>

          {/* Stats Section */}
          <div className="flex flex-row items-center gap-1 pl-1.5 pt-1.5">
            <div className="text-[11px] text-gray-600 flex flex-row items-center justify-center gap-0.5">
              <FaListUl size={14} />
              <span>{course.topics} Topics</span>
            </div>
            <span className="text-gray-400 text-sm font-medium">|</span>
            <div className="text-[11px] text-gray-600 flex flex-row items-center justify-center gap-0.5">
              <MdSlowMotionVideo size={15} />
              <span>{course.videos} Videos</span>
            </div>
          </div>

          {/* Rating */}
          <div className="mt-2 pl-1.5">{renderRating(course.rating)}</div>

          {/* Description */}
          <div className="mt-2 text-[13px] pl-1.5 text-gray-600 line-clamp-2">
            {course.description}
          </div>
        </div>

        <div className="bg-white dark:bg-[#121212] p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm font-medium text-black dark:text-white">
              Progress
            </div>
            <div className="text-sm font-medium text-black dark:text-white">
              {course.progress}%
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-4">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${course.progress}%` }}
            ></div>
          </div>

          <div className="flex justify-between items-center">
            {/* Enrolled count */}
            <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 z-10">
              <Users className="h-4 w-4 mr-1" />
              <span>{formatNumber(course.enrolledCount)}</span>
            </div>

            {course.url ? (
              <Link href={course.url}>
                <div className="px-5 py-2 bg-black text-white dark:bg-transparent dark:border dark:border-white dark:text-white rounded-full text-sm font-medium hover:bg-gray-800 dark:hover:bg-white dark:hover:text-black transition-colors">
                  Continue
                </div>
              </Link>
            ) : (
              <div className="px-5 py-2 bg-gray-400 text-white rounded-full text-sm font-medium opacity-50 cursor-not-allowed">
                No Link
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
