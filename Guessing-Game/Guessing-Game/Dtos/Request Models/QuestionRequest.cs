using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

public class QuestionRequest
{
    public Guid GameId { get; set; }
    public Guid AskingPlayerId { get; set; }
    public string Question { get; set; } = string.Empty;
}
