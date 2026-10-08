using CommentsApp.Core.Services;

using Commnents.Constans;
using Commnents.Models;
using Commnents.Services;

using Microsoft.AspNetCore.Mvc;


namespace Commnents.Controllers
{
    [Route(RouteConst.Default)]
    [ApiController]
    public class CommentController : Controller
    {
        private readonly CommentService _commentService;
        private readonly HtmlSanitizerService _htmlSanitizerService;
        private readonly CloudinaryImageUploadService _cloudinaryImageUploadService;

        public CommentController(CommentService commentService, HtmlSanitizerService htmlSanitizerService,
            CloudinaryImageUploadService cloudinaryImageUploadService)
        {
            _commentService = commentService;
            _htmlSanitizerService = htmlSanitizerService;
            _cloudinaryImageUploadService = cloudinaryImageUploadService;
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] int pageNumber)
        {
            return Json(await _commentService.GetPages(pageNumber));
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromForm] Comment comment, [FromForm] IFormFile? file)
        {
            try
            {
                if (file != null)
                {
                    comment.FilePath = await _cloudinaryImageUploadService.Upload(file);
                    comment.FileType = file.ContentType;
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            comment.Text = _htmlSanitizerService.Clean(comment.Text);

            return (_htmlSanitizerService.IsValidXhtml(comment.Text))
                ? Json(await _commentService.Create(comment))
                : BadRequest("invalid XHTML check text your message");
        }

        // method for mock data
        [HttpPost]
        [Route("many")]
        public async Task<IActionResult> PostMany(List<Comment> comments)
        {
            return Json(await _commentService.CreateMany(comments));
        }
    }
}
