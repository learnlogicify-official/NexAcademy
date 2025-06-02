import React from "react";
import {
  FileText,
  BookOpenCheck,
  BarChart2,
  MessageSquare,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ProblemHeader from "./ProblemHeader";
import DescriptionTab from "./DescriptionTab";
import SolutionTab from "./SolutionTab";
import SubmissionsTab from "./SubmissionsTab";
import DiscussionTab from "./DiscussionTab";

interface LeftPanelProps {
  hasMounted: boolean;
  isMobile: boolean;
  activePanel: string;
  leftPanelWidth: string;
  handleTabChange: (value: string) => void;
  problemNumber: string;
  problemTitle: string;
  difficulty: string;
  isLeftPanelExpanded: boolean;
  toggleLeftPanelExpansion: () => void;
  getDifficultyBadge: (diff: string) => React.ReactElement;
  codingQuestion: any;
  description: string;
  examples: any[];
  formatTestCase: (content: string) => React.ReactNode;
  submissions: any[];
  submissionsLoading: boolean;
  submissionsError: any;
  currentPage: number;
  totalPages: number;
  selectedSubmission: any;
  fetchSubmissions: () => void;
  viewSubmissionDetails: (submission: any, e?: React.MouseEvent) => void;
  closeSubmissionDetails: () => void;
  loadSubmissionCode: (submission: any, e?: React.MouseEvent) => void;
  renderSubmissionStatus: (submission: any) => React.ReactElement;
  formatSubmissionDate: (
    dateString: string | Date | number | null | undefined
  ) => string;
  getLanguageColor: (language: string) => string;
  parseLanguageName: (fullName: string | undefined | null) => {
    name: string;
    version: string;
  };
  JUDGE0_LANGUAGES: any;
  getMonacoLanguage: (languageName: string) => string;
  fontSize: number;
  tabSize: number;
  appTheme: string;
  setActivePanel: (panel: "code" | "results" | "problem") => void;
  toast: any;
}

export default function LeftPanel({
  hasMounted,
  isMobile,
  activePanel,
  leftPanelWidth,
  handleTabChange,
  problemNumber,
  problemTitle,
  difficulty,
  isLeftPanelExpanded,
  toggleLeftPanelExpansion,
  getDifficultyBadge,
  codingQuestion,
  description,
  examples,
  formatTestCase,
  submissions,
  submissionsLoading,
  submissionsError,
  currentPage,
  totalPages,
  selectedSubmission,
  fetchSubmissions,
  viewSubmissionDetails,
  closeSubmissionDetails,
  loadSubmissionCode,
  renderSubmissionStatus,
  formatSubmissionDate,
  getLanguageColor,
  parseLanguageName,
  JUDGE0_LANGUAGES,
  getMonacoLanguage,
  fontSize,
  tabSize,
  appTheme,
  setActivePanel,
  toast,
}: LeftPanelProps) {
  return (
    <div
      className={`h-full flex-1 overflow-hidden bg-[#f2f3f5] dark:bg-black ${
        hasMounted && isMobile
          ? activePanel === "problem"
            ? "block w-full"
            : "hidden"
          : ""
      } ${hasMounted && isMobile ? "pb-24" : ""}`}
      style={{
        width: hasMounted && isMobile ? "100%" : `${leftPanelWidth}%`,
      }}
    >
      <div className="m-4 mb-0 mr-[2px] border border-[#e4e6eb] dark:border-none rounded-lg overflow-hidden bg-[white] dark:bg-[#1f1f1f] flex flex-col h-[calc(100vh-8rem)]">
        <Tabs
          defaultValue="description"
          className="flex flex-col h-full"
          onValueChange={handleTabChange}
        >
          <TabsList className="flex justify-start gap-2 px-3 p-1 rounded-none shrink-0 bg-[#ffffff] dark:bg-[#292929] border-b border-[#e4e6eb] dark:border-none">
            <TabsTrigger
              value="description"
              className="px-3 py-2 text-[black] dark:text-[white] text-sm bg-transparent data-[state=active]:font-semibold   data-[state=active]:opacity-100 opacity-50 hover:opacity-90 hover:bg-[#f2f3f5] dark:hover:bg-[#3f3f3f] transition-colors duration-300 "
            >
              <FileText className="h-4 w-4 mr-1.5 text-[#a040ff]" />
              <span>Description</span>
            </TabsTrigger>
            <TabsTrigger
              value="solution"
              className="px-4 text-[black] dark:text-[white] py-2 text-sm bg-transparent data-[state=active]:font-semibold data-[state=active]:opacity-100 opacity-50 hover:opacity-90  hover:bg-[#f2f3f5] dark:hover:bg-[#3f3f3f] transition-colors duration-300"
            >
              <BookOpenCheck className="h-4 w-4 mr-1.5 text-[#ffcf40]" />
              <span>Solution</span>
            </TabsTrigger>
            <TabsTrigger
              value="submissions"
              className="px-3 py-2 text-[black] dark:text-[white] text-sm bg-transparent data-[state=active]:font-semibold data-[state=active]:opacity-100 opacity-50 hover:opacity-90 hover:bg-[#f2f3f5] dark:hover:bg-[#3f3f3f] transition-colors duration-300"
            >
              <BarChart2 className="h-4 w-4 mr-1.5 text-[#18ff65]" />
              <span>Submissions</span>
            </TabsTrigger>
            <TabsTrigger
              value="discussion"
              className="px-3 py-2 text-[black] dark:text-[white] text-sm bg-transparent data-[state=active]:font-semibold data-[state=active]:opacity-100 opacity-50 hover:opacity-90 hover:bg-[#f2f3f5] dark:hover:bg-[#3f3f3f] transition-colors duration-300"
            >
              <MessageSquare className="h-4 w-4 mr-1.5 text-[#1871ff]" />
              <span>Discussion</span>
            </TabsTrigger>
          </TabsList>
          <div className="shrink-0">
            <ProblemHeader
              problemNumber={parseInt(problemNumber)}
              problemTitle={problemTitle}
              difficulty={difficulty}
              isLeftPanelExpanded={isLeftPanelExpanded}
              toggleLeftPanelExpansion={toggleLeftPanelExpansion}
              isMobile={isMobile}
              getDifficultyBadge={getDifficultyBadge}
              solvedBy={codingQuestion.question?.solvedBy || 1248}
              tags={
                codingQuestion.question?.tags || [
                  { name: "Array" },
                  { name: "Hash Table" },
                  { name: "Two Pointers" },
                ]
              }
            />
          </div>
          <TabsContent
            value="description"
            className="mt-3 space-y-5 focus-visible:outline-none focus-visible:ring-0 overflow-y-auto flex-1 pb-4 custom-scrollbar"
          >
            <DescriptionTab
              description={description}
              examples={examples}
              formatTestCase={formatTestCase}
            />
          </TabsContent>

          <TabsContent
            value="solution"
            className="mt-4 focus-visible:outline-none focus-visible:ring-0 overflow-y-auto flex-1 pb-4"
          >
            <SolutionTab />
          </TabsContent>

          <TabsContent
            value="submissions"
            className="mt-4 focus-visible:outline-none focus-visible:ring-0 overflow-y-auto flex-1 pb-4"
          >
            <SubmissionsTab
              submissions={submissions}
              submissionsLoading={submissionsLoading}
              submissionsError={submissionsError}
              currentPage={currentPage}
              totalPages={totalPages}
              selectedSubmission={selectedSubmission}
              fetchSubmissions={fetchSubmissions}
              viewSubmissionDetails={viewSubmissionDetails}
              closeSubmissionDetails={closeSubmissionDetails}
              loadSubmissionCode={loadSubmissionCode}
              renderSubmissionStatus={renderSubmissionStatus}
              formatSubmissionDate={formatSubmissionDate}
              getLanguageColor={getLanguageColor}
              parseLanguageName={parseLanguageName}
              JUDGE0_LANGUAGES={JUDGE0_LANGUAGES}
              getMonacoLanguage={getMonacoLanguage}
              fontSize={fontSize}
              tabSize={tabSize}
              appTheme={appTheme}
              setActivePanel={(panel: "code" | "results" | "problem") =>
                setActivePanel(panel)
              }
              toast={toast}
            />
          </TabsContent>

          <TabsContent
            value="discussion"
            className="mt-4 focus-visible:outline-none focus-visible:ring-0 overflow-y-auto flex-1 pb-4"
          >
            <DiscussionTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
