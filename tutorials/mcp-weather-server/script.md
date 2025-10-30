# Building Your First MCP Weather Server

## Segment 1: Introduction
> Duration: 8s
> Screenshot: static

[NARRATION]
Welcome! In this tutorial, you'll learn how to build a simple Model Context Protocol server that provides weather information. By the end, you'll have a working MCP server that Claude can use to fetch weather data.
[/NARRATION]

[IMAGE_PROMPT]
A professional tech tutorial title slide with gradient background (blue to purple). Center text "MCP Weather Server Tutorial" in large bold modern sans-serif font. Below it "Build Your First Model Context Protocol Server" in smaller text. Include a minimalist icon combining a cloud and code brackets </> symbols. Clean, modern, high contrast design suitable for a video thumbnail.
[/IMAGE_PROMPT]

---

## Segment 2: Project Setup
> Duration: 12s
> Screenshot: auto

[NARRATION]
Let's start by creating a new project directory and initializing it with npm. We'll call our project "weather-mcp-server".
[/NARRATION]

[PLAYWRIGHT_INSTRUCTIONS]
Show: Terminal window
Action: Type "mkdir weather-mcp-server && cd weather-mcp-server"
Wait: 1s
Action: Type "npm init -y"
Wait: 2s
[/PLAYWRIGHT_INSTRUCTIONS]

---

## Segment 3: Install Dependencies
> Duration: 10s
> Screenshot: auto

[NARRATION]
Now we need to install the MCP SDK and TypeScript. These packages provide everything we need to build our server.
[/NARRATION]

[PLAYWRIGHT_INSTRUCTIONS]
Show: Terminal window (same as previous)
Action: Type "npm install @modelcontextprotocol/sdk typescript"
Wait: 3s
[/PLAYWRIGHT_INSTRUCTIONS]

---

## Segment 4: Create Server Code
> Duration: 15s
> Screenshot: auto

[NARRATION]
Let's create our main server file. We'll set up a simple tool that returns mock weather data for any city. In a real application, you'd call an actual weather API here.
[/NARRATION]

[PLAYWRIGHT_INSTRUCTIONS]
Show: VS Code with file "src/index.ts" open
Action: Type the following code:
```
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

const server = new Server({
  name: 'weather-server',
  version: '1.0.0',
});

server.tool('get-weather', { city: 'string' }, async ({ city }) => {
  return \`Weather in ${city}: Sunny, 72°F\`;
});
```
Wait: 2s
[/PLAYWRIGHT_INSTRUCTIONS]

---

## Segment 5: Test the Server
> Duration: 10s
> Screenshot: auto

[NARRATION]
Finally, let's compile and test our server. Once it's running, you can connect it to Claude and ask about the weather in any city.
[/NARRATION]

[PLAYWRIGHT_INSTRUCTIONS]
Show: Terminal window
Action: Type "npx tsc && node dist/index.js"
Wait: 2s
Action: Show output "MCP Weather Server running..."
[/PLAYWRIGHT_INSTRUCTIONS]

---

## Segment 6: Conclusion
> Duration: 7s
> Screenshot: static

[NARRATION]
Congratulations! You've just built your first MCP server. You can now extend this with real weather APIs, add more tools, or create entirely different types of servers. Happy coding!
[/NARRATION]

[IMAGE_PROMPT]
A celebration completion slide with gradient background matching the intro. Large text "Tutorial Complete!" at the top. Below show a checklist with green checkmarks: "✓ Project Created", "✓ Dependencies Installed", "✓ Server Code Written", "✓ Server Tested". At bottom "Happy Coding!" in friendly font. Professional, clean design with positive energy.
[/IMAGE_PROMPT]
