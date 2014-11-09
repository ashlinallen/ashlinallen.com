using System;
using System.Text;
using System.Web.Script.Services;
using System.Web.Services;

public partial class _Default : System.Web.UI.Page
{
    [WebMethod, ScriptMethod]
        public static String TestFormPost(NameValue[] namevaluepair)
        {
            StringBuilder builder = new StringBuilder();
            foreach(NameValue nvp in namevaluepair)
            {
                builder.Append(nvp.Name + ": " + nvp.Value + ";"); 
            }
            return builder.ToString();
        }


     public class NameValue
    {
        public String Name;
        public String Value;
    }
}