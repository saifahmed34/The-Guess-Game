# 🔤 Guessing Game

A two-player, turn-based word guessing game where one player sets a secret word and the other tries to guess it by asking yes/no questions.

---

## 🎯 Game Objective

- **Player 1** creates a game and enters a secret word.
- **Player 2** enter the secret word and join the game and asks yes/no questions.
- The game continues in turns until Player 1 or 2 correctly guesses the secret word.

---

## 🧩 Features

- Turn-based multiplayer gameplay
- RESTful API (ASP.NET Core)
- Secret word entry and question/answer system
- Separate game logic, models, DTOs, and API
- Frontend served via static HTML/CSS/JS
- SQL Server database via EF Core

---

## 🚀 Getting Started

### Requirements

- [.NET 6+ SDK](https://dotnet.microsoft.com/download)
- A modern web browser

### Run the Project

1. Clone the repository:

```bash
git clone https://github.com/saifahmed34/The-Guess-Game.git
cd The-Guess-Game/Guessing-Game
```
# Play the Game
- Navigate to https://localhost:7020/ or http://localhost:5189/

- Player 1 enters a secret word and share the Game Id Player 2 

- Player 2 joins and starts asking yes/no questions.

- Track the game state as you go!

# 🔄 API Overview
## Sample endpoints (defined in gameController.cs):

- POST /api/game/create

- POST /api/game/join

- POST /api/game/question

- POST /api/game/answer

- POST /api/game/guess

# ✅ Future Improvements

- Implement functionality allowing both players to enter their own secret words and alternate turns to guess each other's words.✅
- change the basic frontend to React


## Author

Made by [saifahmed34](https://github.com/saifahmed34)
— Have fun guessing!
