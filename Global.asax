<%@ Application Language="C#" %>
<%@ Import Namespace="ashlinallen.com" %>
<%@ Import Namespace="System.Web.Optimization" %>
<%@ Import Namespace="System.Web.Routing" %>

<script runat="server">

    void Application_Start(object sender, EventArgs e)
    {
        BundleConfig.RegisterBundles(BundleTable.Bundles);
    }

</script>
