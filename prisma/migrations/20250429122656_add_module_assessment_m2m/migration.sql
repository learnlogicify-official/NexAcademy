-- CreateTable
CREATE TABLE "_ModuleAssessments" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ModuleAssessments_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ModuleAssessments_B_index" ON "_ModuleAssessments"("B");

-- AddForeignKey
ALTER TABLE "_ModuleAssessments" ADD CONSTRAINT "_ModuleAssessments_A_fkey" FOREIGN KEY ("A") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ModuleAssessments" ADD CONSTRAINT "_ModuleAssessments_B_fkey" FOREIGN KEY ("B") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;
