# Building Your First MCP Weather Server

## Segment 1: Introduction
> Duration: 8s
> Screenshot: static

[NARRATION]
Welcome! In this tutorial, you'll learn how to build a simple Model Context Protocol server that provides weather information. By the end, you'll have a working MCP server that Claude can use to fetch weather data.
[/NARRATION]

[IMAGE_PROMPT]
A fun, cartoonized illustration of a happy smiling sun character wearing sunglasses and a tiny programmer hat, holding a laptop showing code brackets </> on screen. Around the sun are playful cartoon clouds (white and fluffy) with cute faces. The scene is bright and cheerful with a gradient sky background from light blue to soft purple. The text "MCP Weather Server Tutorial" appears in bold, friendly rounded font at the top. Style: vibrant, cartoon illustration, Pixar-like quality, whimsical and inviting for developers.
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
A cheerful cartoon celebration scene with the same friendly sun character from the intro, now jumping with joy and raising its arms in celebration. Around it are cartoon weather elements: a happy rainbow, dancing clouds with big smiles, raindrops with cute faces, and snowflakes with little grins. Confetti and stars sparkle around them. The text "Tutorial Complete!" appears at the top in bold, playful font with a gold trophy emoji. Below is a cute checklist with animated green checkmarks and the text "You're a Weather Server Pro!" at the bottom. Style: vibrant, cartoon illustration, celebratory mood, Pixar-like quality, warm and encouraging for developers.
[/IMAGE_PROMPT]
