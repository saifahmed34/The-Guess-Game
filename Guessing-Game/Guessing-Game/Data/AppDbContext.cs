using Microsoft.EntityFrameworkCore;

namespace Guessing_Game.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Game> games => Set<Game>();
        public DbSet<Player> players => Set<Player>();
        public DbSet<Turn> turns => Set<Turn>();
    }
}
