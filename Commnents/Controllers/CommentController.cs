using CommentsApp.Core.Services;

using Commnents.Constans;
using Commnents.Infrastructure;
using Commnents.Models;
using Commnents.Services;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;


namespace Commnents.Controllers
{
    [Route(RouteConst.Default)]
    [ApiController]
    public class CommentController : Controller
    {
        private readonly CommentService _commentService;
        private readonly HtmlSanitizerService _htmlSanitizerService;
        private readonly CloudinaryImageService _cloudinaryImageService;
        private readonly IHubContext<CommentHub> _hubContext;

        public CommentController(CommentService commentService, HtmlSanitizerService htmlSanitizerService,
            CloudinaryImageService cloudinaryImageService, IHubContext<CommentHub> hubContext)
        {
            _commentService = commentService;
            _htmlSanitizerService = htmlSanitizerService;
            _cloudinaryImageService = cloudinaryImageService;
            _hubContext = hubContext;
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
                    comment.FilePath = await _cloudinaryImageService.Upload(file);
                    comment.FileType = file.ContentType;
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            comment.Text = _htmlSanitizerService.Clean(comment.Text);

            if (_htmlSanitizerService.IsValidXhtml(comment.Text))
            {
                await _commentService.Create(comment);

                await _hubContext.Clients.All.SendAsync("ReceiveComment", comment);

                return Json(comment);
            }

            return BadRequest("invalid XHTML check text your message");
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
