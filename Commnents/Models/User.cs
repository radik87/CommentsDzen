using Commnents.Constans;
using System.ComponentModel.DataAnnotations;

namespace Commnents.Models
{
    public class User
    {
        [Key]
        public Guid Id { get; set; } = new Guid();

        [Required]
        [RegularExpression(RegexConst.DigitsAndLetters)]
        public string UserName { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }
        public string? HomePage { get; set; }
        public List<Comment> Comments { get; set; } = new List<Comment>();
    }
}
