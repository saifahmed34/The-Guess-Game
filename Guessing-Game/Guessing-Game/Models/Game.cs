public class Game
{
    public Guid Id { get; set; }
    public bool IsCompleted { get; set; } = false;
    public Guid? WinnerPlayerId { get; set; }
    public Guid CurrentTurnPlayerId { get; set; }
    public List<Player> Players { get; set; } = new();
    public List<Turn> Turns { get; set; } = new();
}
