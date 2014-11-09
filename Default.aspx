<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Default.aspx.cs" Inherits="_Default" %>
<!DOCTYPE html>

<head runat="server">
    <script type="text/javascript" src="js/vendor/jquery-1.11.1.min.js"></script>
    <script type="text/javascript">
        function btnclick() {
            var nameVal, companyVal, options;

            nameVal = $("#txtName").val();
            companyVal = $("#txtCompany").val();

            options = {
                type: "POST",
                url: "Default.aspx/SendEmail",
                data: "{ Name:" + nameVal + ", Company:" + companyVal + "}",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: fnsuccesscallback,
                error: fnerrorcallback
            }

            $.ajax(options);
        }

        function fnsuccesscallback(data) {
            alert("Success");
        }
        function fnerrorcallback(result) {
            alert(data.d);
        }
    </script>
</head>

<body>
    <form runat="server">
        <div>
            <table>
                <tr>
                    <td>
                        <asp:Label AssociatedControlID="txtName" Text="Name" />
                    </td>
                    <td>
                        <asp:TextBox id="txtName" ClientIDMode="Static" runat="server" />
                    </td>
                </tr>
                <tr>
                    <td>
                        <asp:Label AssociatedControlID="txtCompany" Text="Company" />
                    </td>
                    <td>
                        <asp:TextBox id="txtCompany" ClientIDMode="Static" runat="server" />
                    </td>
                </tr>
            </table>
            <input type="button" style="width: 104px" value="Submit" onclick="btnclick();" />
        </div>
    </form>
</body>
</html>