using System.ComponentModel.DataAnnotations;

namespace Commnents.Models
{
    public class Comment
    {
        [Key]
        public Guid Id { get; set; } = new Guid();
        [Required]
        public string Text { get; set; }
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.Now;

        public string? FilePath { get; set; }
        public string? FileType { get; set; }

        public Guid UserId { get; set; }
        [Required]
        public User User { get; set; }
        public Guid? ParentId { get; set; }
        public Comment? Parent { get; set; }
        public List<Comment>? Replies { get; set; }
    }
}
