<%@ Page 
    Language="C#" 
    AutoEventWireup="true" 
    CodeBehind="Default.aspx.cs" 
    Inherits="ashlinallen.com.Default" %><!DOCTYPE html>
<html lang="en">
    <head prefix="og: http://ogp.me/ns# fb: http://ogp.me/ns/fb#">
        <title>Ashlin Allen - Web Developer</title>

        <meta charset="utf-8" />
        <meta content="IE=edge" http-equiv="X-UA-Compatible" />
        <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
        <meta content="The online portfolio of Seattle-area Front-End Web Developer, Ashlin Allen." name="description" />
        <meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" name="viewport" />
        
        <meta property="og:title" content="Ashlin Allen, Web Developer" />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content="http://ashlinallen.com/" />
        <meta property="og:image" content="http://ashlinallen.com/img/fb_thumb.png" />
        <meta property="og:site_name" content="AshlinAllen.com" />
        <meta property="og:email" content="ashlin.allen@gmail.com" />
        <meta property="og:description" content="The portfolio site of Seattle-area Web Developer, Ashlin Allen." />
        
        <%: System.Web.Optimization.Styles.Render("~/bundles/css") %>
    </head>
    <body>
        <form runat="server">
            <svg xmlns="http://www.w3.org/2000/svg" height="0" width="0">
                <style type="text/css" >
                    <![CDATA[
                        #moon, #lowEarthOrbit, #ash, #planetEarth {
                            filter:url(#darken);
                        }
                    ]]>
                </style>
                <filter id="darken">
                    <feComponentTransfer>
                        <feFuncR id="fefuncr" type="linear" slope="1"></feFuncR>
                        <feFuncG id="fefuncg" type="linear" slope="1"></feFuncG>
                        <feFuncB id="fefuncb" type="linear" slope="1"></feFuncB>
                    </feComponentTransfer>
                </filter>
            </svg>

            <div id="contactInfo">
                <h1>Ashlin Allen</h1>
                <h3>Web Developer, Seattle WA</h3>
                <a class="fa fa-file-pdf-o" href="files/Ashlin-Allen_resume.pdf" target="_blank"></a>
                <a class="fa fa-file-word-o" href="files/Ashlin-Allen_resume.docx" target="_blank"></a>
                <a class="fa fa-at" href="mailto:me@ashlinallen.com"></a>
                <a class="fa fa-comment" href="#" id="contactIcon"></a>
                <a class="fa fa-linkedin" href="https://www.linkedin.com/profile/view?id=360485132" target="_blank"></a>
                <a class="fa fa-github-alt" href="https://github.com/ashlinallen" target="_blank"></a>
            </div>

            <div id="theHeavens">
                <div id="theStars"></div>

                <div id="topMarginContainer">
                    <div id="moon">
                        <div class="sprite"></div>
                    </div>

                    <div id="lowEarthOrbit">
                        <div id="satellite" class="sprite"></div>
                        <div id="spaceShuttle" class="sprite"></div>
                    </div>

                    <div id="ash" class="sprite walking">
                        <div id="status" class="sprite"></div>
                    </div>

                    <div id="planetEarth">
                        <a id="computers" class="sprite"></a>
                        <a id="nature" class="sprite"></a>
                        <a id="sheri" class="sprite"></a>
                        <a id="games" class="sprite"></a>
                    </div>
                    <div id="earthShadow"></div>

                    <div id="contactForm">
                        <label for="txtName">Name:</label><input type="text" id="txtName" value="Name" required><br>
                        <label for="txtEmail">E-mail:</label><input type="text" id="txtEmail" value="ashlin.allen@gmail.com" required><br>
                        <label for="txtMsg">Message:</label><textarea id="txtMsg" required>Test</textarea><br>
                        <div class="fa fa-rocket" id="contactSend"></div>
                    </div>
                    
                    <div id="contactThanks">
                        Your message was sent. Thanks!
                    </div>
                </div>
            </div>

            <div id="infoPanel">
                <a id="infoPrev" class="sprite"></a>
                <a id="infoNext" class="sprite"></a>
                <div>
                    <a id="infoClose" class="fa fa-close"></a>
                    <h2 id="infoHeader">.</h2>
                    <hr />
                    <span id="infoContent"></span>
                </div>
            </div>
        </form>
        <%: System.Web.Optimization.Scripts.Render("~/bundles/jquery")%>

        <script type="text/javascript">
            if (typeof jQuery == 'undefined') {
                var e = document.createElement('script');
                e.src = '@Url.Content("~/source_files/js/vendor/jquery-1.11.2.min.js")';
                e.type = 'text/javascript';
                document.getElementsByTagName("head")[0].appendChild(e);
            }
        </script>

        <%: System.Web.Optimization.Scripts.Render("~/bundles/vendorjs")%>
        <%: System.Web.Optimization.Scripts.Render("~/bundles/customjs")%>
    </body>
</html>