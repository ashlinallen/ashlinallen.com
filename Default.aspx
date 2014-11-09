<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Default.aspx.cs" Inherits="_Default" %>
<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
<script type="text/javascript">
    function btnclick() {
        var array = $("#form1").serializeArray();
        $.ajax({
            type: "POST",
            url: "Default.aspx/TestFormPost",
            data: JSON.stringify({ 'namevaluepair': $("#form1").serializeArray() }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: fnsuccesscallback,
            error: fnerrorcallback
        });
    }

    function fnsuccesscallback(data) {
        alert(data.d);

    }
    function fnerrorcallback(result) {
        alert(result.statusText);
    }
    </script>
</head>
<body>
    <form id="form2" runat="server">
    <asp:ScriptManager EnablePageMethods="true" runat="server">
    </asp:ScriptManager>
    <div>
        <table runat="server">
            <tr>
                <td>
                    <label id="lblName" runat="server" title="Name">
                        Name</label>
                </td>
                <td>
                    <input type="text" id="txtName" runat="server" />
                </td>
            </tr>
            <tr>
                <td>
                    <label id="lblCompany" runat="server" title="Company">
                        Company</label>
                </td>
                <td>
                    <input type="text" id="txtCompany" runat="server" />
                </td>
            </tr>
        </table>
        <input type="button" style="width: 104px" value="Submit" onclick="btnclick();" />
    </div>
    </form>
</body>
</html>