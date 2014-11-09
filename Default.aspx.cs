using System;
using System.Net.Mail;
using System.Text;
using System.Web;
using System.Web.Script.Services;
using System.Web.Services;

public partial class _Default : System.Web.UI.Page
{
    [WebMethod, ScriptMethod]
    public static void SendEmail(NameValue[] namevaluepair)
    {
        StringBuilder builder = new StringBuilder();
        SmtpClient client = new SmtpClient();
        MailAddress from = new MailAddress("contactform@ashlinallen.com");
        MailAddress to = new MailAddress("ashlin.allen@gmail.com");
        MailMessage msg = new MailMessage(from, to);

        foreach(NameValue nvp in namevaluepair)
        {
            builder.Append(nvp.Name + ": " + nvp.Value + ";"); 
        }

        msg.Subject = "New contact form submission from ashlinallen.com!";
        msg.Body = HttpContext.Current.Server.HtmlEncode(builder.ToString());

        client.Send(msg);
    }

    public class NameValue
    {
        public String Name;
        public String Value;
    }
}