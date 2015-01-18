requirejs.config({
    baseUrl: 'js/',
    paths: {
        jquery: [
            'http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min',
            'vendor/jquery-1.11.1.min'
        ],
        fancybox: [
            'http://cdnjs.cloudflare.com/ajax/libs/fancybox/2.1.5/jquery.fancybox.pack',
            'vendor/fancybox/jquery.fancybox.pack'
        ],
        fancybox_thumbs: [
            'http://cdnjs.cloudflare.com/ajax/libs/fancybox/2.1.5/helpers/jquery.fancybox-thumbs',
            'vendor/fancybox/jquery.fancybox-thumbs'
        ],
        tweenmax: [
            'http://cdnjs.cloudflare.com/ajax/libs/gsap/1.14.2/TweenMax.min',
            'vendor/gsap/TweenMax.min'
        ],
        happyjs: [
            'vendor/happyjs/happy.min'
        ],
        happymethods: [
            'vendor/happyjs/happy.methods.min'
        ],
        analytics: [
            'ga'
        ]
    },
    shim: {
        fancybox: ['jquery'],
        fancybox_thumbs: ['fancybox'],
        happyjs: ['jquery'],
        happymethods: ['happyjs']
    }
});

requirejs(["main.min"]);