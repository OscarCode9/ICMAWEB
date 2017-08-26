function ws_parallax(k, g, a) {
    var c = jQuery;
    var f = c(this);
    var d = a.find(".ws_list");
    var b = k.parallax || 0.25;
    var e = c("<div>").css({ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", overflow: "hidden" }).addClass("ws_effect ws_parallax").appendTo(a);

    function j(l) { return Math.round(l * 1000) / 1000 }
    var i = c("<div>").css({ position: "absolute", left: 0, top: 0, overflow: "hidden", width: "100%", height: "100%", transform: "translate3d(0,0,0)" }).appendTo(e);
    var h = i.clone().appendTo(e);
    this.go = function(l, r, p) {
        var s = c(g.get(r));
        s = { width: s.width(), height: s.height(), marginTop: s.css("marginTop"), marginLeft: s.css("marginLeft") };
        p = p ? 1 : -1;
        var n = c(g.get(r)).clone().css(s).appendTo(i);
        var o = c(g.get(l)).clone().css(s).appendTo(h);
        var m = a.width() || k.width;
        var q = a.height() || k.height;
        d.hide();
        wowAnimate(function(v) {
            v = c.easing.swing(v);
            var x = j(p * v * m),
                u = j(p * (-m + v * m)),
                t = j(-p * m * b * v),
                w = j(p * m * b * (1 - v));
            if (k.support.transform) {
                i.css("transform", "translate3d(" + x + "px,0,0)");
                n.css("transform", "translate3d(" + t + "px,0,0)");
                h.css("transform", "translate3d(" + u + "px,0,0)");
                o.css("transform", "translate3d(" + w + "px,0,0)")
            } else {
                i.css("left", x);
                n.css("margin-left", t);
                h.css("left", u);
                o.css("margin-left", w)
            }
        }, 0, 1, k.duration, function() {
            e.hide();
            n.remove();
            o.remove();
            f.trigger("effectEnd")
        })
    }
};

jQuery("#wowslider-container1").wowSlider({ effect: "parallax", prev: "", next: "", duration: 10 * 100, delay: 90 * 100, width: 1400, height: 600, autoPlay: true, autoPlayVideo: false, playPause: true, stopOnHover: false, loop: false, bullets: 1, caption: true, captionEffect: "parallax", controls: true, controlsThumb: false, responsive: 1, fullScreen: false, gestures: 2, onBeforeStep: 0, images: 0 });