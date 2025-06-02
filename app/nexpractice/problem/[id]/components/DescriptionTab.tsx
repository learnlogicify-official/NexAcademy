import React from "react";
import DOMPurify from "isomorphic-dompurify";
import { useState } from "react";
// @ts-ignore: SimpleBar types workaround for TypeScript
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";


interface DescriptionTabProps {
  description: string;
  examples: Array<{
    id: string;
    input: string;
    output: string;
    explanation?: string;
  }>;
  formatTestCase: (testCase: string) => React.ReactNode;
}

const DescriptionTab: React.FC<DescriptionTabProps> = ({
  description,
  examples,
  formatTestCase,
}) => (
  <SimpleBar style={{ maxHeight: "100%", height: "100%" }}>
    {/* Problem description with content-card styling */}
    <div className="">
      <article
        className="problem-description prose prose-indigo dark:prose-invert max-w-none px-7 py-5"
        style={{ borderRadius: "0" }}
      >
        <div
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(description),
          }}
        />
      </article>
    </div>
    {/* Examples Section */}
    {examples && examples.length > 0 && (
      <div className="px-7 pb-5">
        <h3 className="font-semibold text-lg mb-3">Examples</h3>
        <div className="space-y-6">
          {examples.map((ex, idx) => {
            // Add state for copy buttons
            const [inputCopied, setInputCopied] = useState(false);
            const [outputCopied, setOutputCopied] = useState(false);

            // Copy function for input
            const copyInput = () => {
              navigator.clipboard.writeText(ex.input);
              setInputCopied(true);
              setTimeout(() => setInputCopied(false), 2000);
            };

            // Copy function for output
            const copyOutput = () => {
              navigator.clipboard.writeText(ex.output);
              setOutputCopied(true);
              setTimeout(() => setOutputCopied(false), 2000);
            };

            return (
              <div key={ex.id || idx}>
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Input Box - Left Side */}
                  <div className="flex-1 rounded-lg overflow-hidden border border-gray-200 dark:border-[#1a1a1a]">
                    <div className="bg-gray-100 dark:bg-[#1a1a1a] text-gray-800 dark:text-white px-4 py-2 flex justify-between items-center">
                      <span className="font-medium">Input</span>
                      <button
                        onClick={copyInput}
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-transform duration-200 ease-in-out"
                        style={{
                          transform: inputCopied ? "scale(1.2)" : "scale(1)",
                        }}
                        aria-label="Copy input to clipboard"
                      >
                        {inputCopied ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-green-500 dark:text-green-400"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect
                              x="9"
                              y="9"
                              width="13"
                              height="13"
                              rx="2"
                              ry="2"
                            ></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                          </svg>
                        )}
                      </button>
                    </div>
                    <div className="bg-white dark:bg-[#121212] text-gray-800 dark:text-white p-4 font-mono text-sm h-full">
                      {formatTestCase(ex.input)}
                    </div>
                  </div>

                  {/* Output Box - Right Side */}
                  <div className="flex-1 rounded-lg overflow-hidden border border-gray-200 dark:border-[#1a1a1a]">
                    <div className="bg-gray-100 dark:bg-[#1a1a1a] text-gray-800 dark:text-white px-4 py-2 flex justify-between items-center">
                      <span className="font-medium">Output</span>
                      <button
                        onClick={copyOutput}
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-transform duration-200 ease-in-out"
                        style={{
                          transform: outputCopied ? "scale(1.2)" : "scale(1)",
                        }}
                        aria-label="Copy output to clipboard"
                      >
                        {outputCopied ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-green-500 dark:text-green-400"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect
                              x="9"
                              y="9"
                              width="13"
                              height="13"
                              rx="2"
                              ry="2"
                            ></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                          </svg>
                        )}
                      </button>
                    </div>
                    <div className="bg-white dark:bg-[#121212] text-gray-800 dark:text-white p-4 font-mono text-sm h-full">
                      {formatTestCase(ex.output)}
                    </div>
                  </div>
                </div>

                {/* Explanation - Full Width Below */}
                {ex.explanation && (
                  <div className="mt-4 rounded-lg overflow-hidden border border-gray-200 dark:border-[#1a1a1a]">
                    <div className="bg-gray-100 dark:bg-[#1a1a1a] text-gray-800 dark:text-white px-4 py-2">
                      <span className="font-medium">Explanation</span>
                    </div>
                    <div className="bg-white dark:bg-[#121212] text-gray-800 dark:text-white p-4">
                      {ex.explanation}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    )}
  </SimpleBar>
);

export default DescriptionTab;
