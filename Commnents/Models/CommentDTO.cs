namespace Commnents.Models
{
    public class CommentDTO
    {
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalItems { get; set; }
        public int TotalPages { get; set; }
        public List<Comment> Comments { get; set; } = new List<Comment>();
    }
}
