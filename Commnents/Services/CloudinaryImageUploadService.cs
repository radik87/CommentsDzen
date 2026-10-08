using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace Commnents.Services
{
    public class CloudinaryImageUploadService
    {
        const string Cloud = "lpksjyhd";
        const string ApiKey = "366749331539276";
        const string ApiSecret = "uzxnSFmr2_q5GlzI8ZaeSKQKD3k";

        private readonly Cloudinary _cloudinary;
        private readonly string[] _allowedImageExtensions = { ".txt", ".jpg", ".jpeg", ".gif", ".png" };

        public CloudinaryImageUploadService()
        {
            Account account = new Account(Cloud, ApiKey, ApiSecret);
            _cloudinary = new Cloudinary(account);
            _cloudinary.Api.Secure = true;
        }

        public async Task<string> Upload(IFormFile file)
        {
            string imageUrls;

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

                imageUrls = result.SecureUrl.ToString();
                return imageUrls;
            }

            else
            {
                throw new Exception("Unsupported file format.");
            }
        }
    }
}
