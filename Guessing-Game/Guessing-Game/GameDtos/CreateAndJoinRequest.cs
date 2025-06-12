using System.Text.Json.Serialization;

public class CreateAndJoinRequest
{
    public Guid gameId { get; set; }
    public string PlayerName { get; set; }
    public string SecretWord { get; set; }
}
