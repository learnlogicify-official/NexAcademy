"use client"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const data = [
  { day: "Mon", xp: 120 },
  { day: "Tue", xp: 180 },
  { day: "Wed", xp: 100 },
  { day: "Thu", xp: 250 },
  { day: "Fri", xp: 300 },
  { day: "Sat", xp: 150 },
  { day: "Sun", xp: 350 },
]

export function XPChart() {
  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <XAxis dataKey="day" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Line
            type="monotone"
            dataKey="xp"
            stroke="#4f46e5"
            strokeWidth={2}
            activeDot={{ r: 6, fill: "#fff", strokeWidth: 2 }}
            dot={{ r: 4, fill: "#fff", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

