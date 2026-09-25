using Commnents.Models;
using System.Xml.Linq;

namespace Commnents.Services
{
    public class FileService
    {
        private readonly string[] _allowedImageExtensions = { ".txt", ".jpg", ".jpeg", ".gif", ".png" };

        public async Task<Comment> SaveFile(Comment comment, IFormFile file)
        {
            comment.FilePath = await ProcessUploadedFileAsync(file.OpenReadStream(), file.FileName, file.Length);
            comment.FileType = Path.GetExtension(file.FileName).ToLower() == ".txt" ? "text" : "image";

            return comment;
        }
        private async Task<string?> ProcessUploadedFileAsync(Stream fileStream, string fileName, long fileSize)
        {
            string ext = Path.GetExtension(fileName).ToLower();

            if (_allowedImageExtensions.Contains(ext))
            {
                if (fileSize > 100 * 1024) // 100 KB
                {
                    throw new Exception("The text file must not exceed 100 KB.");
                }

                string path = Path.Combine("wwwroot", "uploads", $"{Guid.NewGuid()}{ext}");
                using FileStream fs = new FileStream(path, FileMode.Create);
                await fileStream.CopyToAsync(fs);
                return path.Replace('\\', '/');
            }
            else
            {
                throw new Exception("Unsupported file format.");
            }

            
        }
    }
}
