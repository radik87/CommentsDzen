using Commnents.Models;
using Microsoft.EntityFrameworkCore;

namespace Commnents.Repository
{
    public class CommentRepository
    {
        private readonly CommentContext _commentContext;

        public CommentRepository(CommentContext commentContext)
        {
            _commentContext = commentContext;
        }

        public async Task<List<Comment>> GetAll()
        {
            return await _commentContext.Comments
                .Include(c => c.User)
                .OrderByDescending(c => c.CreatedAt)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<CommentDTO> GetPages(int pageNumber)
        {
            if(pageNumber < 1)
            {
                pageNumber = 1;
            }

            int commentsCount = await _commentContext.Comments.CountAsync();
            const int pageSize = 25;

            List<Comment> commentsPaged = await _commentContext.Comments
                .Include(c => c.User)
                .OrderByDescending(c => c.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .AsNoTracking()
                .ToListAsync();

            return new CommentDTO
            {
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalItems = commentsCount,
                TotalPages = (int)Math.Ceiling(commentsCount / (double)pageSize),
                Comments = commentsPaged
            };
        }

        public async Task<Comment> Create(Comment comment)
        {
            _commentContext.Comments.Add(comment);
            _commentContext.Users.Add(comment.User);
            await _commentContext.SaveChangesAsync();

            return comment;
        }


        public async Task<List<Comment>> CreateMany(List<Comment> comments)
        {
            foreach (Comment comment in comments)
            {
                _commentContext.Comments.Add(comment);
                _commentContext.Users.Add(comment.User);
            }
            await _commentContext.SaveChangesAsync();

            return comments;
        }
    }
}
