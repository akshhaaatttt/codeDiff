"use client"

import { useState, useEffect, useRef } from "react"
import { diffLines, type Change } from "diff"
import { Moon, Sun, Copy, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useTheme } from "next-themes"
import type React from "react"

export default function CodeDiffViewer() {
  const [oldCode, setOldCode] = useState<string>("")
  const [newCode, setNewCode] = useState<string>("")
  const [diffResult, setDiffResult] = useState<Change[]>([])
  const oldScrollRef = useRef<HTMLDivElement>(null)
  const newScrollRef = useRef<HTMLDivElement>(null)
  const { theme, setTheme } = useTheme()

  // Example code for demonstration
  const exampleOldCode = `function calculateTotal(items) {
  return items
    .map(item => item.price * item.quantity)
    .reduce((a, b) => a + b, 0);
}

// Log the result
console.log("The total is: " + calculateTotal(items));`

  const exampleNewCode = `function calculateTotal(items) {
  // Add tax calculation
  return items
    .map(item => item.price * item.quantity * 1.1)
    .reduce((a, b) => a + b, 0);
}

// Format currency
const formatCurrency = (amount) => {
  return "$" + amount.toFixed(2);
};

// Log the result with formatting
console.log("The total is: " + formatCurrency(calculateTotal(items)));`

  // Calculate diff when code changes
  useEffect(() => {
    if (oldCode || newCode) {
      const diff = diffLines(oldCode, newCode)
      setDiffResult(diff)
    }
  }, [oldCode, newCode])

  // Load example code
  const loadExampleCode = () => {
    setOldCode(exampleOldCode)
    setNewCode(exampleNewCode)
  }

  // Synchronize scrolling between the two panels
  const handleScroll = (sourceRef: React.RefObject<HTMLDivElement>, targetRef: React.RefObject<HTMLDivElement>) => {
    if (sourceRef.current && targetRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = sourceRef.current
      const percentage = scrollTop / (scrollHeight - clientHeight)
      const targetScrollHeight = targetRef.current.scrollHeight - targetRef.current.clientHeight
      targetRef.current.scrollTop = percentage * targetScrollHeight
    }
  }

  // Copy code to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  // Render line numbers and code with diff highlighting
  const renderDiff = (side: "old" | "new") => {
    if (!diffResult.length) return null

    let lineNumber = 1
    const lines: JSX.Element[] = []

    diffResult.forEach((part) => {
      const value = part.value
      const lineContents = value.split("\n")
      // Remove the last empty line that's created by split
      if (lineContents[lineContents.length - 1] === "") {
        lineContents.pop()
      }

      lineContents.forEach((line) => {
        let shouldRender = false
        let bgColor = ""

        if (side === "old") {
          shouldRender = !part.added
          bgColor = part.removed ? "bg-red-100 dark:bg-red-900/30" : ""
        } else {
          shouldRender = !part.removed
          bgColor = part.added ? "bg-green-100 dark:bg-green-900/30" : ""
        }

        if (shouldRender) {
          lines.push(
            <div key={`${side}-${lineNumber}`} className={`flex ${bgColor}`}>
              <div className="w-12 text-right pr-4 select-none text-gray-500 border-r border-gray-300 dark:border-gray-700">
                {lineNumber}
              </div>
              <pre className="pl-4 whitespace-pre-wrap break-all">{line}</pre>
            </div>,
          )
          lineNumber++
        }
      })
    })

    return lines
  }

  return (
    <div className="flex flex-col min-h-screen p-4 md:p-8 bg-white dark:bg-gray-950">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Code Diff Viewer</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => loadExampleCode()} title="Load Example">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-medium">Original Code</h2>
            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(oldCode)} className="h-8">
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>
          <Textarea
            value={oldCode}
            onChange={(e) => setOldCode(e.target.value)}
            placeholder="Paste original code here..."
            className="font-mono h-60 resize-none"
          />
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-medium">Modified Code</h2>
            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(newCode)} className="h-8">
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>
          <Textarea
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            placeholder="Paste modified code here..."
            className="font-mono h-60 resize-none"
          />
        </div>
      </div>

      <div className="flex flex-col flex-grow">
        <h2 className="text-lg font-medium mb-2">Diff Result</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
          <div
            ref={oldScrollRef}
            onScroll={() => handleScroll(oldScrollRef, newScrollRef)}
            className="border rounded-md overflow-auto bg-gray-50 dark:bg-gray-900 font-mono text-sm"
          >
            {renderDiff("old")}
          </div>
          <div
            ref={newScrollRef}
            onScroll={() => handleScroll(newScrollRef, oldScrollRef)}
            className="border rounded-md overflow-auto bg-gray-50 dark:bg-gray-900 font-mono text-sm"
          >
            {renderDiff("new")}
          </div>
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-100 dark:bg-green-900/30 mr-2"></div>
            <span>Added</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-100 dark:bg-red-900/30 mr-2"></div>
            <span>Removed</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900/30 mr-2"></div>
            <span>Modified</span>
          </div>
        </div>
      </div>
    </div>
  )
}
