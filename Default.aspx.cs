using System.Net.Mail;
using System.Text;
using System.Web;
using System.Web.Script.Services;
using System.Web.Services;

public partial class _Default : System.Web.UI.Page
{
    [WebMethod, ScriptMethod]
    public static void SendEmail(string name, string email, string note)
    {
        StringBuilder sbBody = new StringBuilder();
        SmtpClient client = new SmtpClient();
        MailAddress from = new MailAddress("contactform@ashlinallen.com");
        MailAddress to = new MailAddress("ashlin.allen@gmail.com");
        MailMessage msg = new MailMessage(from, to);

        sbBody.Append("Name: " + name);
        sbBody.Append("\n");
        sbBody.Append("Email: " + email);
        sbBody.Append("\n");
        sbBody.Append("Note: " + note);

        msg.Subject = "New contact form submission from ashlinallen.com!";
        msg.Body = HttpContext.Current.Server.HtmlEncode(sbBody.ToString());

        client.Send(msg);
    }
}