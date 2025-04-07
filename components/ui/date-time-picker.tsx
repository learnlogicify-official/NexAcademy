"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface DateTimePickerProps {
  date: Date;
  onChange: (date: Date) => void;
  label?: string;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
}

export function DateTimePicker({
  date,
  onChange,
  label,
  className,
  minDate,
  maxDate,
}: DateTimePickerProps) {
  const handleTimeChange = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes);
    onChange(newDate);
  };

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      const updatedDate = new Date(newDate);
      updatedDate.setHours(date.getHours(), date.getMinutes());
      onChange(updatedDate);
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      {label && <Label>{label}</Label>}
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateChange}
              initialFocus
              disabled={(date) => {
                if (minDate && date < minDate) return true;
                if (maxDate && date > maxDate) return true;
                return false;
              }}
            />
          </PopoverContent>
        </Popover>
        <div className="relative">
          <Input
            type="time"
            value={format(date, "HH:mm")}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="w-[120px]"
          />
          <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
} 