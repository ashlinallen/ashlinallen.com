using System;
using System.ComponentModel;
using System.Web.UI;
using System.Web.UI.HtmlControls;
using System.Web.UI.WebControls;

namespace AshCode.Controls
{
    public enum ControlSize
    {
        Normal,
        Large,
        Small
    }

    public enum ButtonType
    {
        Default,
        Back,
        Next,
        Danger,
        Icon
    }

    public enum ButtonStyle
    {
        Default,
        Flat
    }

    [ToolboxData("<{0}:ButtonLink runat=\"server\" />")]
    public class ButtonLink : LinkButton
    {
        Literal anchorText;
        HtmlGenericControl anchorIcon;
        bool dataBound;

        #region Properties
        [Browsable(true)]
        [UrlProperty]
        public string NavigateUrl
        {
            get { return ViewState.GetValue<string>("NavigateUrl", "#!"); }
            set { ViewState["NavigateUrl"] = value; }
        }

        public override string ToolTip
        {
            get { return ViewState.GetValue<string>("ToolTip"); }
            set { ViewState["ToolTip"] = value; }
        }

        public override string Text
        {
            get { return ViewState.GetValue<string>("Text"); }
            set { ViewState["Text"] = value; }
        }

        public string ConfirmText
        {
            get { return ViewState.GetValue<string>("ConfirmText"); }
            set { ViewState["ConfirmText"] = value; }
        }

        public FontIcon Icon
        {
            get { return ViewState.GetValue<FontIcon>("Icon", FontIcon.None); }
            set { ViewState["Icon"] = value; }
        }

        public ControlSize ButtonSize
        {
            get { return ViewState.GetValue<ControlSize>("ButtonSize", ControlSize.Normal); }
            set { ViewState["ButtonSize"] = value; }
        }

        public ControlSize IconSize
        {
            get { return ViewState.GetValue<ControlSize>("IconSize", ControlSize.Normal); }
            set { ViewState["IconSize"] = value; }
        }

        public ButtonType Type
        {
            get { return ViewState.GetValue<ButtonType>("Type", ButtonType.Default); }
            set { ViewState["Type"] = value; }
        }

        public ButtonStyle DisplayStyle
        {
            get { return ViewState.GetValue<ButtonStyle>("DisplayStyle", ButtonStyle.Default); }
            set { ViewState["DisplayStyle"] = value; }
        }

        public LinkDisplayMode DisplayMode
        {
            get { return ViewState.GetValue<LinkDisplayMode>("DisplayMode", LinkDisplayMode.ShowAlways); }
            set { ViewState["DisplayMode"] = value; }
        }

        public bool IconOnly
        {
            get { return ViewState.GetValue<bool>("IconOnly", false); }
            set { ViewState["IconOnly"] = value; }
        }

        public bool LinkPostback
        {
            get { return ViewState.GetValue<bool>("LinkPostback", true); }
            set { ViewState["LinkPostback"] = value; }
        }

        public bool DisableOnSubmit
        {
            get { return ViewState.GetValue<bool>("DisableOnSubmit", false); }
            set { ViewState["DisableOnSubmit"] = value; }
        }
        #endregion

        #region Methods
        protected void SetClass()
        {
            string existingClass;
            string btnSizeClass;
            string iconSizeClass;
            string typeClass;

            existingClass = this.Attributes["class"];

            switch (ButtonSize)
            {
                case ControlSize.Small:
                    btnSizeClass = "btn-small";
                    break;
                case ControlSize.Large:
                    btnSizeClass = "btn-large";
                    break;
                case ControlSize.Normal:
                default:
                    btnSizeClass = "btn-default";
                    break;
            }

            switch (Type)
            {
                case ButtonType.Back:
                    typeClass = "btn-back";
                    break;
                case ButtonType.Next:
                    typeClass = "btn-next";
                    break;
                case ButtonType.Danger:
                    typeClass = "btn-danger";
                    break;
                case ButtonType.Default:
                default:
                    typeClass = "";
                    break;
            }

            switch (IconSize)
            {
                case ControlSize.Small:
                    iconSizeClass = "icon-small";
                    break;
                case ControlSize.Large:
                    iconSizeClass = "icon-large";
                    break;
                case ControlSize.Normal:
                default:
                    iconSizeClass = "icon-default";
                    break;
            }

            this.AddCssClass(btnSizeClass);
            this.AddCssClass(typeClass);
            this.AddCssClass(existingClass);
            if (this.IconOnly) this.AddCssClass("btn-icon");
            if (this.DisplayStyle == ButtonStyle.Flat) this.AddCssClass("btn-flat");
            if (this.DisableOnSubmit) this.AddCssClass("disableOnSubmit");
            this.AddCssClass("GeneratedButtonLink");

            anchorIcon.AddCssClass(iconSizeClass);
        }

        protected void SetHref(HtmlTextWriter writer)
        {
            string href = string.Empty;

            if (this.NavigateUrl == "#!" || !this.Enabled)
            {
                href = "#!";
            }
            else
            {
                if (this.NavigateUrl.StartsWith("#") ||
                    this.NavigateUrl.StartsWith("."))
                {
                    href = this.NavigateUrl;
                } else {
                    href = ResolveUrl(this.NavigateUrl);
                }
            }

            writer.AddAttribute(HtmlTextWriterAttribute.Href, href);
        }

        protected void SetIcon()
        {
            if (Icon != FontIcon.None)
            {
                anchorIcon.AddCssClass(FontIconHelper.GetIconClass(Icon));
            }
        }

        protected void SetVisibility()
        {
            if (this.DisplayMode != LinkDisplayMode.ShowAlways)
            {
                bool hasAccess = SiteMapHelper.ShouldDisplayLink(this.NavigateUrl, true);

                if (!hasAccess)
                {
                    if (this.DisplayMode == LinkDisplayMode.HideIfNoAccess)
                    {
                        this.Visible = false;
                    }
                    else if (this.DisplayMode == LinkDisplayMode.DisableIfNoAccess)
                    {
                        this.Enabled = false;
                    }
                }
            }
        }

        protected void SetOnclick(HtmlTextWriter writer)
        {
            ClientScriptManager cs = this.Page.ClientScript;
            string existingClick = this.OnClientClick;
            string postbackJs = string.Empty;
            string onclick = string.Empty;

            if (this.Enabled)
            {
                if (this.NavigateUrl.EndsWith("#!") && this.LinkPostback)
                {
                    PostBackOptions postBackOptions = this.GetPostBackOptions();
                    if (postBackOptions != null)
                    {
                        postbackJs = cs.GetPostBackEventReference(postBackOptions, true).Replace("javascript:", "");
                        postbackJs = Extensions.EnsureEndWithSemiColon(postbackJs);
                        onclick = postbackJs;
                    }
                }

                if (!string.IsNullOrWhiteSpace(existingClick))
                {
                    existingClick = Extensions.EnsureEndWithSemiColon(existingClick);
                    onclick = string.Format("{0}{1}", existingClick, onclick);
                }

                if (!string.IsNullOrWhiteSpace(ConfirmText))
                {
                    if (String.IsNullOrWhiteSpace(onclick))
                    {
                        onclick = string.Format("return $(this).trySubmit('{0}', null);", ConfirmText);
                    }
                    else
                    {
                        onclick = string.Format("return $(this).trySubmit('{0}', function() {{ {1} }});", ConfirmText, onclick);
                    }
                }
            }
            else
            {
                onclick = "return $(this).trySubmit();";
            }

            if (!string.IsNullOrWhiteSpace(onclick))
            {
                writer.AddAttribute(HtmlTextWriterAttribute.Onclick, onclick);
            }
        }

        protected void SetToolTip()
        {
            if (!string.IsNullOrWhiteSpace(ToolTip))
            {
                string tooltip = ToolTip.Replace("'", "\'");
                this.Attributes["data-tip"] = tooltip;
            }
        }

        protected override void OnInit(EventArgs e)
        {
            base.OnInit(e);

            anchorIcon = new HtmlGenericControl("I");
            anchorText = new Literal();
        }

        protected override void OnDataBinding(EventArgs e)
        {
            base.OnDataBinding(e);

            dataBound = true;
        }

        protected override void OnPreRender(EventArgs e)
        {
            base.OnPreRender(e);

            if (!this.dataBound &&
                (this.FindParent<DataBoundControl>() == null) &&
                (this.FindParent<DataGrid>() == null) &&
                (this.FindParent<Repeater>() == null))
            {
                this.DataBind();
            }
        }

        protected override void Render(HtmlTextWriter writer)
        {
            if (Icon != FontIcon.None) Controls.Add(anchorIcon);

            Controls.Add(anchorText);

            if (!Page.IsPostBack && !string.IsNullOrWhiteSpace(this.NavigateUrl))
            {
                this.SetVisibility();
            }

            if (this.Visible)
            {
                this.SetOnclick(writer);
                this.SetHref(writer);

                this.SetClass();
                this.SetIcon();
                this.SetToolTip();

                anchorText.Text = this.Text;
            }

            base.Render(writer);
        }

        #endregion
    };
}