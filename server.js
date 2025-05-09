const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Wait for Next.js to prepare the server
app.prepare().then(() => {
  // Create HTTP server with extended timeout
  const server = createServer({
    // Increase the timeout to 5 minutes for API requests (300000 ms)
    timeout: 300000
  }, (req, res) => {
    // Parse the request URL
    const parsedUrl = parse(req.url, true);
    
    // Increase timeout for GraphQL endpoint
    if (parsedUrl.pathname === '/api/graphql') {
      // Set longer timeout for GraphQL requests (5 minutes)
      req.setTimeout(300000);
      res.setTimeout(300000);
    }
    
    // Let Next.js handle the request
    handle(req, res, parsedUrl);
  });

  // Start listening on the specified port
  const port = process.env.PORT || 3000;
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
    
    // We'll use the standard route.ts approach for GraphQL and WebSockets
    // rather than a custom subscription server
    console.log('> Using built-in GraphQL yoga for WebSocket subscriptions');
    console.log('> Extended request timeout enabled for GraphQL endpoints');
  });
}); 