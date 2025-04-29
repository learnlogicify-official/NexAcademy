import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  type: "quiz" | "live" | "deadline";
  course: string;
}

interface UpcomingEventsCardProps {
  events: Event[];
}

export function UpcomingEventsCard({ events }: UpcomingEventsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5 text-violet-500" />
          Upcoming
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="flex gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="flex-shrink-0 bg-primary/10 text-primary h-12 w-12 rounded-lg flex flex-col items-center justify-center text-center">
              <span className="text-xs font-semibold">
                {event.date.split(" ")[0]}
              </span>
              <span className="text-sm font-bold">
                {event.date.split(" ")[1]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{event.title}</p>
              <p className="text-xs text-muted-foreground">
                {event.time} • {event.course}
              </p>
              <Badge
                variant="outline"
                className={`mt-1 text-xs ${
                  event.type === "quiz"
                    ? "bg-blue-500/10 text-blue-500"
                    : event.type === "live"
                    ? "bg-green-500/10 text-green-500"
                    : "bg-amber-500/10 text-amber-500"
                }`}
              >
                {event.type === "quiz"
                  ? "Quiz"
                  : event.type === "live"
                  ? "Live Session"
                  : "Deadline"}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
