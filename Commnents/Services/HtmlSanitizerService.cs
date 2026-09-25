using Philiprehberger.HtmlSanitizer;
using System.Xml;
using System.Xml.Linq;

namespace CommentsApp.Core.Services;

public class HtmlSanitizerService
{
    SanitizerOptions options = new SanitizerOptions
    {
        AllowedTags = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "a", "code", "i", "strong" },
        AllowedAttributes = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "href", "title" },
    };
    public string Clean(string html)
    {
        return Sanitizer.Sanitize(html, options);
    }


    public bool IsValidXhtml(string xhtmlContent)
    {
        string wrapped = $"<root>{xhtmlContent}</root>";

        try
        {
            using (var reader = new StringReader(wrapped))
            {
                XDocument.Load(reader);
            }
            return true;
        }
        catch (XmlException)
        {
            return false;
        }
    }

}
