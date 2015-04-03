using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Web;
using System.Web.Optimization;
using System.Web.UI;
using BundleTransformer.Core.Transformers;

namespace ashlinallen.com
{
    public class BundleConfig
    {
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.UseCdn = true;

            Bundle jquery = new ScriptBundle("~/bundles/jquery", "https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js")
                                    .Include("~/source_files/js/vendor/jquery-1.11.2.min.js");

            Bundle vendorJSBundle = new ScriptBundle("~/bundles/vendorjs")
                .Include(
                    "~/source_files/js/vendor/fancybox/jquery.fancybox.pack.js",
                    "~/source_files/js/vendor/fancybox/jquery.fancybox-thumbs.js",
                    "~/source_files/js/vendor/gsap/TweenMax.min.js",
                    "~/source_files/js/vendor/happyjs/happy.min.js",
                    "~/source_files/js/vendor/happyjs/happy.methods.min.js",
                    "~/source_files/js/ga.js"
                );

            Bundle customJSBundle = new ScriptBundle("~/bundles/customjs")
                .Include("~/source_files/js/main.js");

            Bundle cssBundle = new StyleBundle("~/bundles/css").Include(
                "~/source_files/css/jquery.fancybox.css",
                "~/source_files/css/jquery.fancybox-thumbs.css",
                "~/source_files/less/main.less",
                "~/source_files/less/variables.less",
                "~/source_files/less/site.less",
                "~/source_files/less/props.less"
              );

            jquery.Transforms.Add(new JsMinify());
            customJSBundle.Transforms.Add(new JsMinify());
            vendorJSBundle.Transforms.Add(new JsMinify());
            cssBundle.Transforms.Add(new StyleTransformer());
            cssBundle.Transforms.Add(new CssMinify());

            bundles.Add(jquery);
            bundles.Add(customJSBundle);
            bundles.Add(vendorJSBundle);
            bundles.Add(cssBundle);

            BundleTable.EnableOptimizations = true;
        }
    }
}