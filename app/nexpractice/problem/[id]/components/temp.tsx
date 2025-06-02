
<TabsContent
  key={`example-content-${example.id || idx}`}
  value={`example-${idx}`}
  className="focus-visible:outline-none focus-visible:ring-0"
>
  <div className="flex flex-col md:flex-row gap-4 w-full">
    <div className="flex-1 rounded-md overflow-hidden border   border-gray-200 dark:border-[#1a1a1a]">
      <div className="bg-gray-100 dark:bg-[#1a1a1a]  px-4 py-3 border-none dark:border-b dark:border-[#333333] text-sm font-medium  text-[black] dark:text-white flex items-center justify-between">
        <span>Input</span>
        <button
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="Copy input"
          onClick={() => {
            navigator.clipboard.writeText(example.input);
            setCopiedInput(true);
            setTimeout(() => setCopiedInput(false), 2000);
          }}
        >
          {copiedInput ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <LuCopy className="h-4 w-4" />
          )}
        </button>
      </div>
      <div className="p-4 font-mono text-sm bg-[white] dark:bg-[#121212] text-[#262626] dark:text-gray-300 min-h-[100px]">
        {formatTestCase(example.input)}
      </div>
    </div>

    <div className="flex-1 rounded-md overflow-hidden border  border-gray-200 dark:border-[#1a1a1a]">
      <div className="bg-gray-100 dark:bg-[#1a1a1a]  px-4 py-3 border-none dark:border-b dark:border-[#333333] text-sm font-medium text-[black] dark:text-white flex items-center justify-between">
        <span>Output</span>
        <button
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="Copy output"
          onClick={() => {
            navigator.clipboard.writeText(example.output);
            setCopiedOutput(true);
            setTimeout(() => setCopiedOutput(false), 2000);
          }}
        >
          {copiedOutput ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <LuCopy className="h-4 w-4" />
          )}
        </button>
      </div>
      <div className="p-4 font-mono text-sm bg-[white] dark:bg-[#121212] text-[#262626] dark:text-gray-300  min-h-[100px]">
        {formatTestCase(example.output)}
      </div>
    </div>
  </div>
</TabsContent>;