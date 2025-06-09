namespace Guessing_Game.Models
{
    public class AnswerRequest
    {
        public Guid TurnId { get; set; }
        public Guid AnsweringPlayerId { get; set; }
        public string Answer { get; set; } = string.Empty;
    }

}
