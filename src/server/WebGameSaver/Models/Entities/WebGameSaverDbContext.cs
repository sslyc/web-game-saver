using Microsoft.EntityFrameworkCore;

namespace WebGameSaver.Models.Entities
{
    public class WebGameSaverDbContext : DbContext
    {
        public WebGameSaverDbContext(DbContextOptions<WebGameSaverDbContext> options) : base(options) { }
        public DbSet<Profile> Profiles { get; set; }
        public DbSet<User> Users { get; set; }
    }
}
