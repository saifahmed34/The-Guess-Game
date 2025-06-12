using Guessing_Game.Data;
using Guessing_Game.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Guessing_Game.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class GameController : ControllerBase
    {
        private readonly AppDbContext _context;
        public GameController(AppDbContext context) => _context = context;

        [HttpPost("create-and-join")]
        public async Task<IActionResult> CreateAndJoin([FromBody] CreateAndJoinRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.PlayerName) || string.IsNullOrWhiteSpace(req.SecretWord))
                return BadRequest("Name and Secret Word Required");

            var player = new Player
            {
                Id = Guid.NewGuid(),
                Name = req.PlayerName,
                SecretWord = req.SecretWord,
            };
            var game = new Game
            {
                Id = Guid.NewGuid(),
                CurrentTurnPlayerId = player.Id,
                Players = new List<Player> { player }
            };
            player.GameId = game.Id;

            _context.games.Add(game);
            _context.players.Add(player);
            await _context.SaveChangesAsync();

            return Ok(new { gameId = game.Id, playerId = player.Id });
        }

        [HttpPost("join")]
        public async Task<IActionResult> Join([FromBody] CreateAndJoinRequest req)
        {
            var g = await _context.games.Include(g => g.Players)
                .FirstOrDefaultAsync(g => g.Id == req.gameId);
            if (g == null) return NotFound("Game Not Found");
            if (g.Players.Count >= 2) return BadRequest("The Game is Full");

            var p = new Player
            {
                Id = Guid.NewGuid(),
                Name = req.PlayerName,
                SecretWord = req.SecretWord,
                GameId = g.Id
            };
            _context.players.Add(p);
            g.Players.Add(p);
            await _context.SaveChangesAsync();
            return Ok(new { gameId = g.Id, playerId = p.Id });
        }

        [HttpPost("question")]
        public async Task<IActionResult> Ask([FromBody] QuestionRequest r)
        {
            // Add validation
            if (r.GameId == Guid.Empty || r.AskingPlayerId == Guid.Empty || string.IsNullOrWhiteSpace(r.Question))
            {
                return BadRequest("GameId, AskingPlayerId and Question are required");
            }

            var g = await _context.games.FindAsync(r.GameId);
            if (g == null) return NotFound("Game not found");

            var turn = new Turn
            {
                Id = Guid.NewGuid(),
                GameId = r.GameId,
                AskingPlayerId = r.AskingPlayerId,
                Question = r.Question,
                IsAnswered = false
            };
            _context.turns.Add(turn);
            await _context.SaveChangesAsync();
            return Ok(turn);
        }


        [HttpPost("answer")]
        public async Task<IActionResult> Answer([FromBody] AnswerRequest r)
        {
            var t = await _context.turns.FindAsync(r.TurnId);
            if (t == null) return NotFound("New Turn Not Found");
            t.Answer = r.Answer;
            t.AnsweringPlayerId = r.AnsweringPlayerId;
            t.IsAnswered = true;
            await _context.SaveChangesAsync();
            return Ok(t);
        }

        [HttpPost("guess")]
        public async Task<IActionResult> Guess([FromQuery] Guid gameId, [FromQuery] Guid playerId, [FromQuery] string guess)
        {
            // Add validation
            if (gameId == Guid.Empty || playerId == Guid.Empty || string.IsNullOrWhiteSpace(guess))
            {
                return BadRequest("GameId, PlayerId and Guess are required");
            }

            var g = await _context.games
                .Include(g => g.Players)
                .FirstOrDefaultAsync(g => g.Id == gameId);
            if (g == null || g.IsCompleted) return NotFound("Game not found or completed");

            var opponent = g.Players.FirstOrDefault(p => p.Id != playerId);
            if (opponent == null) return BadRequest("Opponent not joined yet");

            bool correct = opponent.SecretWord.Equals(guess, StringComparison.OrdinalIgnoreCase);
            if (correct)
            {
                g.IsCompleted = true;
                g.WinnerPlayerId = playerId;
            }

            var turn = new Turn
            {
                Id = Guid.NewGuid(),
                GameId = gameId,
                AskingPlayerId = playerId,
                Question = "(guess)",
                Guess = guess,
                IsGuessCorrect = correct,
                IsAnswered = true
            };
            _context.turns.Add(turn);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = correct ? "You Win!" : "Not Correct💀",
                gameCompleted = correct,
                correct = correct
            });
        }

        [HttpGet("{gameId}")]
        public async Task<IActionResult> Get([FromRoute] Guid gameId)
        {
            var g = await _context.games
                .Include(g => g.Players)
                .Include(g => g.Turns)
                .FirstOrDefaultAsync(g => g.Id == gameId);
            if (g == null) return NotFound();
            return Ok(g);
        }
    }
}