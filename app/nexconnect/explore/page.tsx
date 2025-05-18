import { Metadata } from "next"
import ExploreFeed from "./components/explore-feed"

export const metadata: Metadata = {
  title: "Explore | NexConnect",
  description: "Discover new connections, trending topics, and interesting content on campus.",
}

export default function ExplorePage() {
  return <ExploreFeed />
} 