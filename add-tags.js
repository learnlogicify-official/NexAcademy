// Script to add programming and algorithm tags to NexAcademy
const fetch = require('node-fetch');

// URL of your API endpoint
const API_URL = 'http://localhost:3000/api/tags';

// List of tags to add
const tags = [
  { name: "Array", description: "Problems involving manipulation of arrays" },
  { name: "String", description: "Problems involving manipulation of strings" },
  { name: "Hash Table", description: "Problems involving hash maps or dictionaries" },
  { name: "Dynamic Programming", description: "Problems solved using dynamic programming techniques" },
  { name: "Math", description: "Problems involving mathematical concepts" },
  { name: "Sorting", description: "Problems involving sorting algorithms" },
  { name: "Greedy", description: "Problems solved using greedy algorithms" },
  { name: "Depth-First Search", description: "Problems solved using DFS traversal" },
  { name: "Binary Search", description: "Problems involving binary search algorithms" },
  { name: "Database", description: "Problems related to database concepts" },
  { name: "Matrix", description: "Problems involving 2D arrays or matrices" },
  { name: "Tree", description: "Problems involving tree data structures" },
  { name: "Breadth-First Search", description: "Problems solved using BFS traversal" },
  { name: "Bit Manipulation", description: "Problems involving bit operations" },
  { name: "Two Pointers", description: "Problems solved using two-pointer technique" },
  { name: "Prefix Sum", description: "Problems involving cumulative sums" },
  { name: "Heap (Priority Queue)", description: "Problems involving heap data structures" },
  { name: "Simulation", description: "Problems solved by simulating the process" },
  { name: "Binary Tree", description: "Problems specific to binary trees" },
  { name: "Stack", description: "Problems involving stack data structures" },
  { name: "Graph", description: "Problems involving graph algorithms" },
  { name: "Counting", description: "Problems involving counting techniques" },
  { name: "Sliding Window", description: "Problems solved using sliding window technique" },
  { name: "Design", description: "Problems involving system design" },
  { name: "Enumeration", description: "Problems involving enumeration techniques" },
  { name: "Backtracking", description: "Problems solved using backtracking algorithms" },
  { name: "Union Find", description: "Problems involving disjoint-set data structures" },
  { name: "Linked List", description: "Problems involving linked list data structures" },
  { name: "Ordered Set", description: "Problems involving ordered collections" },
  { name: "Number Theory", description: "Problems involving number theory concepts" },
  { name: "Monotonic Stack", description: "Problems involving monotonic stack techniques" },
  { name: "Segment Tree", description: "Problems involving segment tree data structures" },
  { name: "Trie", description: "Problems involving trie data structures" },
  { name: "Combinatorics", description: "Problems involving combinatorial mathematics" },
  { name: "Bitmask", description: "Problems involving bit masking techniques" },
  { name: "Queue", description: "Problems involving queue data structures" },
  { name: "Recursion", description: "Problems solved using recursive algorithms" },
  { name: "Divide and Conquer", description: "Problems solved using divide-and-conquer strategy" },
  { name: "Binary Indexed Tree", description: "Problems involving Fenwick tree structures" },
  { name: "Memoization", description: "Problems involving caching of results" },
  { name: "Hash Function", description: "Problems involving hashing functions" },
  { name: "Geometry", description: "Problems involving geometric algorithms" },
  { name: "Binary Search Tree", description: "Problems specific to binary search trees" },
  { name: "String Matching", description: "Problems involving pattern matching in strings" },
  { name: "Topological Sort", description: "Problems involving dependency ordering" },
  { name: "Shortest Path", description: "Problems involving shortest path algorithms in graphs" },
  { name: "Rolling Hash", description: "Problems solved using rolling hash techniques" },
  { name: "Game Theory", description: "Problems involving game theory concepts" },
  { name: "Interactive", description: "Problems requiring interactive solutions" },
  { name: "Data Stream", description: "Problems involving streaming data" },
  { name: "Monotonic Queue", description: "Problems involving monotonic queue techniques" },
  { name: "Brainteaser", description: "Problems involving logical puzzles" },
  { name: "Doubly-Linked List", description: "Problems specific to doubly-linked lists" },
  { name: "Randomized", description: "Problems involving randomized algorithms" },
  { name: "Merge Sort", description: "Problems involving merge sort algorithm" },
  { name: "Counting Sort", description: "Problems involving counting sort algorithm" },
  { name: "Iterator", description: "Problems involving iterator design patterns" },
  { name: "Concurrency", description: "Problems involving concurrent programming" },
  { name: "Probability and Statistics", description: "Problems involving probability concepts" },
  { name: "Quickselect", description: "Problems involving quickselect algorithm" },
  { name: "Suffix Array", description: "Problems involving suffix arrays" },
  { name: "Line Sweep", description: "Problems solved using line sweep algorithms" },
  { name: "Bucket Sort", description: "Problems involving bucket sort algorithm" },
  { name: "Minimum Spanning Tree", description: "Problems involving MST algorithms" },
  { name: "Shell", description: "Problems related to shell scripting" },
  { name: "Reservoir Sampling", description: "Problems involving reservoir sampling technique" },
  { name: "Strongly Connected Component", description: "Problems involving SCC in graphs" },
  { name: "Eulerian Circuit", description: "Problems involving Eulerian paths or circuits" },
  { name: "Radix Sort", description: "Problems involving radix sort algorithm" },
  { name: "Rejection Sampling", description: "Problems involving rejection sampling technique" },
  { name: "Biconnected Component", description: "Problems involving biconnected components in graphs" }
];

// Function to add a tag
async function addTag(tag) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tag),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to add tag "${tag.name}": ${errorData.error || response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Successfully added tag: ${tag.name}`);
    return data;
  } catch (error) {
    console.error(`❌ ${error.message}`);
    return null;
  }
}

// Function to add all tags
async function addAllTags() {
  console.log('🚀 Starting to add tags...');
  console.log(`📊 Total tags to add: ${tags.length}`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const tag of tags) {
    const result = await addTag(tag);
    if (result) {
      successCount++;
    } else {
      errorCount++;
    }
  }
  
  console.log('\n📝 Summary:');
  console.log(`✅ Successfully added: ${successCount} tags`);
  console.log(`❌ Failed to add: ${errorCount} tags`);
  console.log('🎉 Tag addition process completed!');
}

// Run the function
addAllTags().catch(error => {
  console.error('⚠️ An unexpected error occurred:', error);
});
