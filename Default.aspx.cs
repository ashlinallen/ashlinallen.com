using System.Net.Mail;
using System.Text;
using System.Web;
using System.Web.Script.Services;
using System.Web.Services;

public partial class _Default : System.Web.UI.Page
{
    [WebMethod, ScriptMethod]
    public static void SendEmail(string name, string company)
    {
        StringBuilder sbBody = new StringBuilder();
        SmtpClient client = new SmtpClient();
        MailAddress from = new MailAddress("contactform@ashlinallen.com");
        MailAddress to = new MailAddress("ashlin.allen@gmail.com");
        MailMessage msg = new MailMessage(from, to);

        sbBody.Append("Name: " + name);
        sbBody.Append("\n");
        sbBody.Append("Company: " + company);

        msg.Subject = "New contact form submission from ashlinallen.com!";
        msg.Body = HttpContext.Current.Server.HtmlEncode(sbBody.ToString());

        //try {
        client.Send(msg);

        //fail:?
        //Context.Response.Clear();
        //Context.Response.ContentType = "application/json";
        //Context.Response.AddHeader("content-length", strResponse.Length.ToString());
        //Context.Response.Flush();
        //
        //Context.Response.Write(strResponse);

        
    }
}