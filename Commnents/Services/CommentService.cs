using Commnents.Models;
using Commnents.Repository;

namespace Commnents.Services
{
    public class CommentService
    {
        private readonly CommentRepository _commentRepository;
        public CommentService(CommentRepository commentRepository)
        {
            _commentRepository = commentRepository;
        }

        public async Task<List<Comment>> GetAll()
        {
            return await _commentRepository.GetAll();
        }
        public async Task<CommentDTO> GetPages(int pageNumber)
        {
            return await _commentRepository.GetPages(pageNumber);
        }

        public async Task<Comment> Create(Comment comment)
        {
            return await _commentRepository.Create(comment);
        }

        public async Task<List<Comment>> CreateMany(List<Comment> comments)
        {
            return await _commentRepository.CreateMany(comments);
        }
    }
}
