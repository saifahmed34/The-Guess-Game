using System.Text.Json.Serialization;

public class Player
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public Guid GameId { get; set; }
    [JsonIgnore]
    public Game? Game { get; set; }
    public string SecretWord { get; set; } = string.Empty;
}
