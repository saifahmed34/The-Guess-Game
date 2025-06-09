using System.Text.Json.Serialization;

public class Turn
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid GameId { get; set; }
    [JsonIgnore]
    public Game Game { get; set; } = null!;
    public Guid AskingPlayerId { get; set; }
    public string Question { get; set; } = string.Empty;
    public Guid? AnsweringPlayerId { get; set; }
    public string? Answer { get; set; }
    public string? Guess { get; set; }
    public bool IsGuessCorrect { get; set; } = false;
    public bool IsAnswered { get; set; } = false;
}
