import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Handle GitHub OAuth callback
export async function GET(request: NextRequest) {
  try {
    // Get code and state from query parameters
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const stateParam = searchParams.get("state");
    
    // Get state from cookie
    const storedState = request.cookies.get("github_oauth_state")?.value;
    
    // Validate code and state
    if (!code) {
      return renderCallbackPage(false, "No authorization code received from GitHub");
    }
    
    if (!stateParam || !storedState || stateParam !== storedState) {
      return renderCallbackPage(false, "Invalid state parameter. Please try again.");
    }
    
    // Decode state to get userId and returnTo
    let userId;
    let returnTo = "/profile";
    try {
      const decoded = JSON.parse(Buffer.from(stateParam, 'base64').toString());
      userId = decoded.userId;
      // Extract returnTo path if it exists
      if (decoded.returnTo) {
        returnTo = decoded.returnTo;
      }
    } catch (error) {
      return renderCallbackPage(false, "Invalid state format");
    }
    
    // Exchange code for access token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      })
    });
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      return renderCallbackPage(false, tokenData.error_description || "Failed to get access token");
    }
    
    // Get GitHub user info
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/vnd.github.v3+json"
      }
    });
    
    const githubUser = await userResponse.json();
    
    if (!githubUser.login) {
      return renderCallbackPage(false, "Failed to get GitHub user information");
    }
    
    // Update user record in database
    await prisma.user.update({
      where: { id: userId },
      data: {
        githubUsername: githubUser.login,
        githubAccessToken: tokenData.access_token
      }
    });
    
    // Return success page that will communicate with the opener window
    return renderCallbackPage(true, undefined, returnTo);
    
  } catch (error) {
    console.error("Error handling GitHub callback:", error);
    return renderCallbackPage(false, "An unexpected error occurred");
  }
}

// Render HTML page that communicates with opener window
function renderCallbackPage(success: boolean, errorMessage?: string, returnTo?: string) {
  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <title>GitHub Connection ${success ? "Successful" : "Failed"}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
          background-color: #f8f9fa;
          color: #333;
        }
        .container {
          text-align: center;
          padding: 2rem;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          max-width: 500px;
        }
        h1 {
          margin-top: 0;
          color: ${success ? '#28a745' : '#dc3545'};
        }
        p {
          margin-bottom: 1.5rem;
          line-height: 1.5;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>${success ? "GitHub Connected Successfully" : "Connection Failed"}</h1>
        <p>${
          success 
            ? "Your GitHub account has been successfully connected. You can now close this window." 
            : `There was a problem connecting your GitHub account: ${errorMessage || "Unknown error"}`
        }</p>
      </div>
      <script>
        // Communicate with the opener window
        if (window.opener && !window.opener.closed) {
          try {
            window.opener.githubOAuthCallback(${success}, ${errorMessage ? `"${errorMessage}"` : "undefined"});
            
            // Close this window after a short delay
            setTimeout(() => {
              window.close();
            }, 1500);
          } catch (e) {
            console.error("Error communicating with opener:", e);
            // If communication fails, redirect to returnTo path
            ${returnTo ? `window.location.href = "${returnTo}";` : ''}
          }
        } else {
          // If opener is not available, redirect to returnTo path
          ${returnTo ? `window.location.href = "${returnTo}";` : ''}
        }
      </script>
    </body>
  </html>
  `;
  
  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html",
    },
  });
} 