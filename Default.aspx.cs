using System.Net.Mail;
using System.Text;
using System.Web;
using System.Web.Script.Services;
using System.Web.Services;

public partial class _Default : System.Web.UI.Page
{
    [WebMethod, ScriptMethod]
    public static void SendEmail(string name, string email, string msg)
    {
        StringBuilder sbBody = new StringBuilder();
        SmtpClient client = new SmtpClient();
        MailAddress from = new MailAddress("contactform@ashlinallen.com");
        MailAddress to = new MailAddress("ashlin.allen@gmail.com");
        MailMessage mailMsg = new MailMessage(from, to);

        sbBody.Append("Name: " + name);
        sbBody.Append("\n");
        sbBody.Append("Email: " + email);
        sbBody.Append("\n");
        sbBody.Append("Message: " + msg);

        mailMsg.Subject = "New contact form submission from ashlinallen.com!";
        mailMsg.Body = HttpContext.Current.Server.HtmlEncode(sbBody.ToString());

        client.Send(mailMsg);
    }
}