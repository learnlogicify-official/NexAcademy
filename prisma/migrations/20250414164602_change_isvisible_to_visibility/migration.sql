-- Drop the existing isVisible column
ALTER TABLE "Course" DROP COLUMN "isVisible";

-- Add the new visibility column
ALTER TABLE "Course" ADD COLUMN "visibility" TEXT NOT NULL DEFAULT 'SHOW';

-- Create the Module and Submodule tables
CREATE TABLE "Module" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Submodule" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Submodule_pkey" PRIMARY KEY ("id")
);

-- Add foreign keys
ALTER TABLE "Module" ADD CONSTRAINT "Module_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Submodule" ADD CONSTRAINT "Submodule_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create indexes
CREATE INDEX "Module_courseId_idx" ON "Module"("courseId");
CREATE INDEX "Submodule_moduleId_idx" ON "Submodule"("moduleId"); 