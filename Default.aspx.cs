using System;
using System.Net.Mail;
using System.Runtime.Serialization.Json;
using System.Text;
using System.Web;
using System.Web.Script.Services;
using System.Web.Services;
using System.Xml;
using System.Xml.Linq;
using System.Web.Helpers;

public partial class _Default : System.Web.UI.Page
{
    [WebMethod, ScriptMethod]
    public static void SendEmail(string inJson)
    {
        SmtpClient client = new SmtpClient();
        MailAddress from = new MailAddress("contactform@ashlinallen.com");
        MailAddress to = new MailAddress("ashlin.allen@gmail.com");
        MailMessage msg = new MailMessage(from, to);
        dynamic json = Json.Decode(inJson);

        msg.Subject = "New contact form submission from ashlinallen.com!";
        msg.Body = HttpContext.Current.Server.HtmlEncode("Company: " + json.Company + " Name" + json.Name);

        client.Send(msg);
    }
}