using Microsoft.EntityFrameworkCore;

namespace Commnents.Models
{
    public class CommentContext : DbContext
    {
        public DbSet<Comment> Comments { get; set; }
        public DbSet<User> Users { get; set; }
        public CommentContext(DbContextOptions<CommentContext> options) : base(options)
        {
            Database.Migrate();
        }
    }
}
