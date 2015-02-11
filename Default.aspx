<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Default.aspx.cs" Inherits="_Default" %>
<!DOCTYPE html>
    <head prefix="og: http://ogp.me/ns# fb: http://ogp.me/ns/fb#">
        <title>Ashlin Allen - Web Developer</title>

        <meta charset="utf-8" />
        <meta content="IE=edge" http-equiv="X-UA-Compatible" />
        <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
        <meta content="The online portfolio of Seattle-area Front-End Web Developer, Ashlin Allen." name="description" />
        <meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" name="viewport" />

        <meta property="og:title" content="Ashlin Allen, Web Developer"/>
        <meta property="og:type" content="profile"/>
        <meta property="og:url" content="http://ashlinallen.com/"/>
        <meta property="og:image" content="http://ashlinallen.com/img/fb_thumb.png" />
        <meta property="og:site_name" content="http://ashlinallen.com"/>
        <meta property="og:email" content="ashlin.allen@gmail.com"/>
        <meta property="og:description" content="The portfolio site of Seattle-area Web Developer, Ashlin Allen."/>

        <link rel="stylesheet" type="text/css" href="css/normalize.css" />
        <link rel="stylesheet" type="text/css" href="css/main.css" />
        <link rel="stylesheet" type="text/css" href="css/site.css" />
        <link rel="stylesheet" type="text/css" href="css/props.css" />
        <link rel="stylesheet" type="text/css" href="css/jquery.fancybox.css" media="screen" />
        <link rel="stylesheet" type="text/css" href="css/jquery.fancybox-thumbs.css" media="screen" />

        <script type="text/javascript" data-main="js/app" src="http://cdnjs.cloudflare.com/ajax/libs/require.js/2.1.15/require.min.js"></script>
        <script type="text/javascript">window.requirejs || document.write('<script type="text/javascript" data-main="js/app" src="js/require.js"><\/script>');</script>
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
                        <feFuncR class="lin" type="linear" slope="1"/>
                        <feFuncG class="lin" type="linear" slope="1"/>
                        <feFuncB class="lin" type="linear" slope="1"/>
                    </feComponentTransfer>
                </filter>
            </svg>

            <div id="contactInfo">
                <h1>Ashlin Allen</h1>
                <h3>Web Developer, Seattle WA</h3>
                <a class="fa fa-file-pdf-o" href="files/Ashlin-Allen_resume.pdf" target="_blank"></a>
                <a class="fa fa-file-word-o" href="files/Ashlin-Allen_resume.docx" target="_blank"></a>
                <a class="fa fa-at" href="mailto:me@ashlinallen.com"></a>
                <a id="contactIcon" class="fa fa-comment" href="#"></a>
                <a class="fa fa-linkedin" href="https://www.linkedin.com/profile/view?id=360485132" target="_blank"></a>
                <a class="fa fa-github-alt" href="https://github.com/ashlinallen" target="_blank"></a>
            </div>

            <span id="theHeavens">
                <span id="theStars"></span>

                <span id="topMarginContainer">
                    <span id="moon" class="sprite"></span>

                    <span id="lowEarthOrbit">
                        <span id="satellite" class="sprite"></span>
                        <span id="spaceShuttle" class="sprite"></span>
                    </span>

                    <span id="ash" class="sprite walking">
                        <span id="status"></span>
                    </span>

                    <span id="planetEarth" class="sprite">
                        <a id="computers" class="sprite"></a>
                        <a id="nature" class="sprite"></a>
                        <a id="sheri" class="sprite"></a>
                        <a id="games" class="sprite"></a>
                    </span>
                    <span id="earthShadow"></span>

                    <span id="contactForm">
                        <label for="txtName">Name:</label><input type="text" id="txtName" required><br>
                        <label for="txtEmail">E-mail:</label><input type="text" id="txtEmail" required><br>
                        <label for="txtMsg">Message:</label><textarea id="txtMsg" required></textarea><br>
                        <span id="contactSend" class="fa fa-rocket"></span>
                    </span>

                    <span id="contactThanks">
                        Your message was sent. Thanks!
                    </span>
                </span>
            </span>

            <div id="infoPanel">
                <a id="infoPrev"></a>
                <a id="infoNext"></a>
                <div>
                    <a id="infoClose" class="fa fa-close"></a>
                    <h2 id="infoHeader">.</h2>
                    <hr />
                    <span id="infoContent"></span>
                </div>
            </div>
        </form>
    </body>
</html>