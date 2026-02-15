# Guessing-Game

A simple multiplayer guessing game built with ASP.NET Core (minimal API / MVC). This repository contains the backend API, EF Core DbContext and migrations, and a small static frontend under `wwwroot` for playing the game in the browser.

**Key components**
- `Guessing-Game/Program.cs`: Application entrypoint and web host configuration.
- `Guessing-Game/Controller/gameController.cs`: API controller for game actions.
- `Guessing-Game/Data/AppDbContext.cs`: EF Core DbContext and models.
- `Guessing-Game/Models`: `Game`, `Player`, `Turn` model classes.
- `Guessing-Game/Migrations`: EF Core migrations (schema history).
- `Guessing-Game/wwwroot`: Static frontend (`index.html`, `game.html`, CSS and JS).

## Features
- Create and join multiplayer games
- Submit answers and take turns
- Persistent game state using EF Core and a relational database
- Minimal static web UI included for quick testing

## Requirements
- .NET 9.0 SDK (or the version used to build the project)
- A relational database supported by EF Core (SQLite, SQL Server, etc.) if you want persistence beyond the included development settings

## Quickstart (development)
1. Install the .NET SDK (9.0+).
2. Restore packages and build:

```
dotnet restore
dotnet build
```

3. Apply database migrations (requires `dotnet-ef` tools installed):

```
dotnet tool install --global dotnet-ef
cd Guessing-Game
dotnet ef database update
```

4. Run the app:

```
dotnet run --project Guessing-Game/Guessing-Game.csproj
```

5. Open the web UI in a browser:

- Development static UI: `Guessing-Game/wwwroot/index.html` or `Guessing-Game/wwwroot/game.html`

## API (overview)
The project exposes a small REST API for game operations. Common endpoints live in the `gameController` and include (examples):

- `POST api/game/create-and-join` — create a new game or create-and-join
- `POST api/game/join` — join an existing game
- `POST api/game/question` — ask the question
- `POST api/game/answer` — submit an answer / take your turn
- `Post api/game/guess` — check your guess
- `GET api/game/{gameId}` — Get Game Details

Refer to `Guessing-Game/Controller/gameController.cs` for exact routes and request/response DTOs.

## Configuration
- App settings live in `Guessing-Game/appsettings.json` and `Guessing-Game/appsettings.Development.json`.
- Connection strings and environment-specific settings should be configured there.

## Development notes
- Models and DbContext are in `Guessing-Game/Models` and `Guessing-Game/Data`.
- DTOs for requests live in `Guessing-Game/Dtos/Request Models` and `Guessing-Game/GameDtos`.
- Migrations are checked into `Guessing-Game/Migrations` for easy setup in development.

## Testing manually
- Use the included static pages to play locally.
- Use an API client (Postman / curl) to exercise the endpoints.

Example curl to create a game:

```
curl -X POST http://localhost:5189/api/game/create-and-join -H "Content-Type: application/json" -d '{ "name": "Test Game" }'
```

## Real-time (polling)

The client UI keeps in sync with the server using a simple polling strategy. Polling repeatedly requests the game state endpoint and updates the chat and game UI.

Guidelines
- Poll a compact endpoint such as `GET /api/game/{gameId}` that returns players, turns and game status.
- Use an interval between requests (recommended: 1000–3000 ms). Default in client: 2000 ms.
- Implement backoff on errors and stop polling when the user leaves the game view or the game completes.

Quick example (place in `wwwroot/js/game.js`):

```
const POLL_INTERVAL_MS = 2000;
let pollTimer = null;

async function pollGame(gameId) {
	try {
		const res = await fetch(`/api/game/${gameId}`);
		if (!res.ok) throw new Error('Fetch failed');
		const state = await res.json();
		updateGameUI(state); // implement this to redraw only what changed
	} catch (err) {
		console.error('Polling error:', err);
	} finally {
		if (!gameOver) pollTimer = setTimeout(() => pollGame(gameId), POLL_INTERVAL_MS);
	}
}

function stopPolling() {
	if (pollTimer) { clearTimeout(pollTimer); pollTimer = null; }
}
```

When to use another approach
- For lower latency or many concurrent clients, prefer SignalR / WebSockets over polling.

## Contributing
- Fork the repo, create a feature branch, and open a pull request.
- Please include clear descriptions and (where appropriate) small, focused commits.
