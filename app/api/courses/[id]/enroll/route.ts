import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Enrollment, User } from '@prisma/client';

// Validation schema for enrollment request
const enrollmentSchema = z.object({
  userIds: z.array(z.string()).min(1, 'At least one user must be selected')
});

// Define return type for enrollment with relations
type EnrollmentWithRelations = Enrollment & {
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  };
  enrolledByUser: {
    id: string;
    name: string | null;
    email: string;
  } | null;
};

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: Please sign in' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized: Only admins can enroll users' },
        { status: 403 }
      );
    }

    // Get course ID from params
    const courseId = params.id;
    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Check if the course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const { userIds } = enrollmentSchema.parse(body);

    // Enroll each user
    const results = await Promise.all(
      userIds.map(async (userId) => {
        try {
          // Check if user exists
          const user = await prisma.user.findUnique({
            where: { id: userId }
          });

          if (!user) {
            return { userId, success: false, error: 'User not found' };
          }

          // Check if enrollment already exists
          const existingEnrollment = await prisma.enrollment.findUnique({
            where: {
              userId_courseId: {
                userId,
                courseId
              }
            }
          });

          if (existingEnrollment) {
            return { userId, success: false, error: 'User already enrolled' };
          }

          // Create enrollment
          const enrollment = await prisma.enrollment.create({
            data: {
              user: { connect: { id: userId } },
              course: { connect: { id: courseId } },
              enrolledByUser: { connect: { id: session.user.id } },
              status: 'active'
            }
          });

          return { userId, success: true, enrollment };
        } catch (error) {
          console.error(`Error enrolling user ${userId}:`, error);
          return { userId, success: false, error: 'Failed to enroll user' };
        }
      })
    );

    // Count successes and failures
    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;

    return NextResponse.json({
      message: `Successfully enrolled ${successful} users${failed > 0 ? `, ${failed} failed` : ''}`,
      results
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error in enrollment endpoint:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}

// Get enrolled users for a course
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: Please sign in' },
        { status: 401 }
      );
    }

    // Get course ID from params
    const courseId = params.id;
    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Get pagination params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    // Get enrollments with user data
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        enrolledByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { enrolledAt: 'desc' },
      skip,
      take: limit
    }) as EnrollmentWithRelations[];

    // Get total count for pagination
    const total = await prisma.enrollment.count({
      where: { courseId }
    });

    return NextResponse.json({
      enrollments: enrollments.map((e) => ({
        id: e.id,
        userId: e.userId,
        courseId: e.courseId,
        enrolledAt: e.enrolledAt.toISOString(),
        enrolledBy: e.enrolledBy,
        status: e.status,
        user: {
          _id: e.user.id,
          name: e.user.name,
          email: e.user.email,
          role: e.user.role
        },
        enrolledByUser: e.enrolledByUser ? {
          _id: e.enrolledByUser.id,
          name: e.enrolledByUser.name,
          email: e.enrolledByUser.email
        } : null
      })),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
} 