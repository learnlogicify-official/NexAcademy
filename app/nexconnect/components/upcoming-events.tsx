"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from "next/image"

  const events = [
    {
      id: 1,
    title: "Spring Campus Festival",
    date: "May 15, 2025",
    time: "12:00 PM - 10:00 PM",
    location: "Main Campus Quad",
    attendees: 342,
    category: "Entertainment",
    image: "https://images.unsplash.com/photo-1472653431158-6364773b2a56?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
    },
    {
      id: 2,
    title: "AI in Education Conference",
    date: "May 18, 2025",
    time: "9:00 AM - 5:00 PM",
    location: "Science Building, Room 305",
    attendees: 125,
    category: "Academic",
    image: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
    },
    {
      id: 3,
    title: "Career Fair: Tech Edition",
    date: "May 23, 2025",
    time: "10:00 AM - 4:00 PM",
    location: "Student Union Hall",
    attendees: 278,
    category: "Career",
    image: "https://images.unsplash.com/photo-1560523159-4a9692d222f9?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    id: 4,
    title: "Campus Sustainability Workshop",
    date: "May 30, 2025",
    time: "2:00 PM - 4:00 PM",
    location: "Environmental Studies Building",
    attendees: 87,
    category: "Workshop",
    image: "https://images.unsplash.com/photo-1487187939378-79fdc7273af4?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  }
]

export default function UpcomingEvents() {
  return (
    <Card className="border-none shadow-md overflow-hidden relative">
      <div className="absolute top-0 left-0 w-40 h-40 bg-green-500/10 rounded-full -mt-20 -ml-20 blur-2xl"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mb-16 -mr-16 blur-xl"></div>
      
      <CardHeader className="pb-2 relative z-10">
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg font-bold">Upcoming Events</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <ScrollArea className="h-[320px] pr-4">
          <div className="space-y-4">
          {events.map((event) => (
              <div 
                key={event.id} 
                className="group cursor-pointer rounded-xl overflow-hidden border border-gray-100 hover:border-blue-200 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="relative h-32 w-full bg-blue-100">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <Badge className="absolute top-2 right-2 bg-blue-600/90 hover:bg-blue-700 backdrop-blur-sm">
                    {event.category}
                  </Badge>
                </div>
                
                <div className="p-3">
                  <h3 className="font-semibold text-sm group-hover:text-blue-600 transition-colors mb-2 line-clamp-1">
                    {event.title}
                  </h3>
                  
                  <div className="space-y-1">
                    <div className="flex items-center text-xs text-gray-600">
                      <Calendar className="h-3.5 w-3.5 mr-1 text-gray-500" />
                      <span>{event.date}</span>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-600">
                      <Clock className="h-3.5 w-3.5 mr-1 text-gray-500" />
                      <span>{event.time}</span>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-600">
                      <MapPin className="h-3.5 w-3.5 mr-1 text-gray-500" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-600">
                      <Users className="h-3.5 w-3.5 mr-1 text-gray-500" />
                      <span>{event.attendees} attending</span>
                    </div>
              </div>
                </div>
              </div>
            ))}
            </div>
        </ScrollArea>
        
        <div className="mt-4 text-center pt-2 border-t">
          <button className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors">
            See all events
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
