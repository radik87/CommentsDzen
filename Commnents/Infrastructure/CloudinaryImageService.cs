using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace Commnents.Infrastructure
{
    public class CloudinaryImageService
    {
        private readonly Cloudinary _cloudinary;
        private readonly IConfiguration _configuration;
        private readonly string[] _allowedImageExtensions = {".jpg", ".jpeg", ".gif", ".png" };

        public CloudinaryImageService(IConfiguration configuration)
        {
            _configuration = configuration;

            Account account = new Account(
                _configuration.GetValue<string>("Cloudinary:Cloud"),
                _configuration.GetValue<string>("Cloudinary:ApiKey"),
                _configuration.GetValue<string>("Cloudinary:ApiSecret"));

            _cloudinary = new Cloudinary(account);
            _cloudinary.Api.Secure = true;
            
        }

        public async Task<string> Upload(IFormFile file)
        {
            string imageUrl;

            string ext = Path.GetExtension(file.FileName).ToLower();

            if (_allowedImageExtensions.Contains(ext))
            {
                using MemoryStream memoryStream = new MemoryStream();
                await file.CopyToAsync(memoryStream);
                memoryStream.Position = 0;

                ImageUploadParams uploadparams = new ImageUploadParams
                {
                    File = new FileDescription(file.FileName, memoryStream),
                };

                var result = _cloudinary.Upload(uploadparams);

                if (result.Error != null)
                {
                    throw new Exception($"Cloudinary error occured: {result.Error.Message}");
                }

                imageUrl = result.SecureUrl.ToString();
                return imageUrl;
            }

            else
            {
                throw new Exception("Unsupported file format.");
            }
        }
    }
}
