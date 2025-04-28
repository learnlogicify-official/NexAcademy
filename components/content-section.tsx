"use client"

import { Card, CardContent } from "@/components/ui/card"

interface ContentSectionProps {
  module: {
    id: string
    title: string
  }
}

export function ContentSection({ module }: ContentSectionProps) {
  return (
    <div className="h-[calc(100vh-12rem)]">
      <Card className="overflow-hidden border-0 shadow-md bg-[#121212] h-full">
        <CardContent className="p-6 h-full overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4">{module.title}</h2>

          {module.id === "variables-data-types" && (
            <div className="prose prose-invert max-w-none text-sm">
              <h3>Introduction to Variables</h3>
              <p>
                Variables are containers for storing data values. Unlike other programming languages, Python has no
                command for declaring a variable. A variable is created the moment you first assign a value to it.
              </p>

              <pre className="bg-gray-800 p-3 rounded-md overflow-x-auto text-xs">
                <code>
                  # Variable assignment examples{"\n"}x = 5{"\n"}y = "Hello, World!"{"\n"}z = 3.14
                </code>
              </pre>

              <h3>Data Types in Python</h3>
              <p>Python has the following built-in data types:</p>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <ul className="space-y-1">
                    <li>
                      <strong>Text Type:</strong> str
                    </li>
                    <li>
                      <strong>Numeric Types:</strong> int, float, complex
                    </li>
                    <li>
                      <strong>Sequence Types:</strong> list, tuple, range
                    </li>
                    <li>
                      <strong>Mapping Type:</strong> dict
                    </li>
                  </ul>
                </div>
                <div>
                  <ul className="space-y-1">
                    <li>
                      <strong>Set Types:</strong> set, frozenset
                    </li>
                    <li>
                      <strong>Boolean Type:</strong> bool
                    </li>
                    <li>
                      <strong>Binary Types:</strong> bytes, bytearray
                    </li>
                    <li>
                      <strong>None Type:</strong> NoneType
                    </li>
                  </ul>
                </div>
              </div>

              <h3>Type Conversion</h3>
              <p>You can convert from one type to another with the constructor functions:</p>

              <pre className="bg-gray-800 p-3 rounded-md overflow-x-auto text-xs">
                <code>
                  x = 5 # int{"\n"}y = float(x) # Convert from int to float{"\n"}z = str(x) # Convert from int to str
                </code>
              </pre>
            </div>
          )}

          {module.id !== "variables-data-types" && (
            <div className="prose prose-invert max-w-none">
              <p>
                This is the learning content for {module.title}. It would contain detailed explanations, code examples,
                and interactive elements to help you understand the concepts.
              </p>

              <pre className="bg-gray-800 p-4 rounded-md overflow-x-auto">
                <code>
                  # Example code for {module.title}
                  {"\n"}# This would be replaced with actual relevant code
                </code>
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
