namespace Guessing_Game.Dtos.Request_Models
{
    public class CreateAndJoinRequest
    {
        public string PlayerName { get; set; } = string.Empty;
        public Guid gameId { get; set; }
        public string SecretWord { get; set; } = string.Empty;
    }

}
