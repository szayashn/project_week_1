(function($, window, document) {
    "use strict";

    var pluginName = "colorpicker",
        defaults = {
            bind: "click keyup",
            position: "below"
        };


    /* GLOBALS
    ==================== */
    var win = $(window),
        doc = $(document);
    
    // RegExp
    var hexregex = /^(?:[0-9a-f]{3}){1,2}$/i,
        rgbregex = /rgba?\([^)]/g,
        hlsaregex = /hsla?\([^)]/g,
        colornameRegex = /^[a-z]+$/;


    /* COLOR NAMES
    ==================== */
    var colorNames = {aliceblue:"f0f8ff",antiquewhite:"faebd7",aqua:"00ffff",aquamarine:"7fffd4",azure:"f0ffff",beige:"f5f5dc",bisque:"ffe4c4",black:"000000",blanchedalmond:"ffebcd",blue:"0000ff",blueviolet:"8a2be2",brown:"a52a2a",burlywood:"deb887",cadetblue:"5f9ea0",chartreuse:"7fff00",chocolate:"d2691e",coral:"ff7f50",cornflowerblue:"6495ed",cornsilk:"fff8dc",crimson:"dc143c",cyan:"00ffff",darkblue:"00008b",darkcyan:"008b8b",darkgoldenrod:"b8860b",darkgray:"a9a9a9",darkgreen:"006400",darkkhaki:"bdb76b",darkmagenta:"8b008b",darkolivegreen:"556b2f",darkorange:"ff8c00",darkorchid:"9932cc",darkred:"8b0000",darksalmon:"e9967a",darkseagreen:"8fbc8f",darkslateblue:"483d8b",darkslategray:"2f4f4f",darkturquoise:"00ced1",darkviolet:"9400d3",deeppink:"ff1493",deepskyblue:"00bfff",dimgray:"696969",dodgerblue:"1e90ff",feldspar:"d19275",firebrick:"b22222",floralwhite:"fffaf0",forestgreen:"228b22",fuchsia:"ff00ff",gainsboro:"dcdcdc",ghostwhite:"f8f8ff",gold:"ffd700",goldenrod:"daa520",gray:"808080",green:"008000",greenyellow:"adff2f",honeydew:"f0fff0",hotpink:"ff69b4",indianred:"cd5c5c",indigo:"4b0082",ivory:"fffff0",khaki:"f0e68c",lavender:"e6e6fa",lavenderblush:"fff0f5",lawngreen:"7cfc00",lemonchiffon:"fffacd",lightblue:"add8e6",lightcoral:"f08080",lightcyan:"e0ffff",lightgoldenrodyellow:"fafad2",lightgrey:"d3d3d3",lightgreen:"90ee90",lightpink:"ffb6c1",lightsalmon:"ffa07a",lightseagreen:"20b2aa",lightskyblue:"87cefa",lightslateblue:"8470ff",lightslategray:"778899",lightsteelblue:"b0c4de",lightyellow:"ffffe0",lime:"00ff00",limegreen:"32cd32",linen:"faf0e6",magenta:"ff00ff",maroon:"800000",mediumaquamarine:"66cdaa",mediumblue:"0000cd",mediumorchid:"ba55d3",mediumpurple:"9370d8",mediumseagreen:"3cb371",mediumslateblue:"7b68ee",mediumspringgreen:"00fa9a",mediumturquoise:"48d1cc",mediumvioletred:"c71585",midnightblue:"191970",mintcream:"f5fffa",mistyrose:"ffe4e1",moccasin:"ffe4b5",navajowhite:"ffdead",navy:"000080",oldlace:"fdf5e6",olive:"808000",olivedrab:"6b8e23",orange:"ffa500",orangered:"ff4500",orchid:"da70d6",palegoldenrod:"eee8aa",palegreen:"98fb98",paleturquoise:"afeeee",palevioletred:"d87093",papayawhip:"ffefd5",peachpuff:"ffdab9",peru:"cd853f",pink:"ffc0cb",plum:"dda0dd",powderblue:"b0e0e6",purple:"800080",red:"ff0000",rosybrown:"bc8f8f",royalblue:"4169e1",saddlebrown:"8b4513",salmon:"fa8072",sandybrown:"f4a460",seagreen:"2e8b57",seashell:"fff5ee",sienna:"a0522d",silver:"c0c0c0",skyblue:"87ceeb",slateblue:"6a5acd",slategray:"708090",snow:"fffafa",springgreen:"00ff7f",steelblue:"4682b4",tan:"d2b48c",teal:"008080",thistle:"d8bfd8",tomato:"ff6347",turquoise:"40e0d0",violet:"ee82ee",violetred:"d02090",wheat:"f5deb3",white:"ffffff",whitesmoke:"f5f5f5",yellow:"ffff00",yellowgreen:"9acd32"};


    var cpk = {};
    cpk.saturation = {};
    cpk.hue = {};
    cpk._hsv = {
        h: 0,
        s: 0,
        v: 0
    };

    // only a single colorpicker should be active at any time
    cpk.singleton = function() {
        $.data(this, cpk._parent.val());
        var _cpk = $("#cpk-colorpicker").show();

        if(!_cpk.length) _cpk = $('<div id="cpk-colorpicker"><div id="cpk-sat-picker"><div id="cpk-sat-cursor" class="cpk-cursor" style="left:-4px;top:-4px;"></div></div><div id="cpk-hue-picker"><div id="cpk-hue-cursor" class="cpk-cursor" style="top:-3px;"></div></div></div>').appendTo("body");

        // set up some helpers
        cpk.saturation.picker = _cpk.find("#cpk-sat-picker");
        cpk.saturation.cursor = _cpk.find("#cpk-sat-cursor");
        cpk.hue.picker = _cpk.find("#cpk-hue-picker");
        cpk.hue.cursor = _cpk.find("#cpk-hue-cursor");

        cpk.saturation.picker.mousedown(function(e) {
            cpk.saturation.update(e);
            doc.mousemove(cpk.saturation.update);
        });

        cpk.hue.picker.mousedown(function(e) {
            cpk.hue.update(e);
            doc.mousemove(cpk.hue.update);
        });

        doc.mouseup(function() {
            doc.off("mousemove");
        });

        doc.click(function() {
            cpk.close();
        });

        _cpk.click(function(e) {
            e.stopPropagation();
        });

        return _cpk;
    };

    cpk.register = function() {

        // position + offset
        cpk.reposition();

        var color = cpk._parent.val();
        if(!color.replace(/ |#/g, '').match(hexregex) && !colorNames[color] ) color = (typeof cpk.settings.color === "function") ? cpk.settings.color(cpk._parent) : cpk.settings.color;
        cpk.set( color ? (colorNames[color] || color) : $.data(this, "defaultColor") || "#ffffff" );
    };

    cpk.reposition = function() {
        var position = cpk._parent.offset();
        var offsetX = cpk.settings.position === "right" ? cpk._parent.outerWidth() + 5 : 0;
        var offsetY = cpk.settings.position === "below" ? cpk._parent.outerHeight() + 5 : 0;

        cpk.singleton().css({
            left: position.left + offsetX,
            top: position.top + offsetY
        });
    };

    // force the colorpicker to close
    cpk.close = function() {
        $("#cpk-colorpicker").hide();
    };

    // colorpicker callback
    cpk.callback = function() {
        var hex = cpk.calc.hsvToHex(cpk._hsv),
            rgb = cpk.calc.hsvToRgb(cpk._hsv);

        if(cpk._parent.is("input")) cpk._parent.val(hex);
        if(cpk.settings.callback) cpk.settings.callback(hex, rgb, cpk._hsv, cpk._parent);
    };

    // repositions cursor and sets color values
    cpk.saturation.update = function(e) {
        var position = cpk.saturation.picker.offset();

        var x = e.pageX - Math.ceil(position.left);
        var y = e.pageY - Math.ceil(position.top);

        x = x < 0 ? 0 : x;
        x = x > 166 ? 166 : x;
        y = y < 0 ? 0 : y;
        y = y > 166 ? 166 : y;

        cpk.saturation.cursor.css({
            left: x - 4,
            top: y - 4
        });

        cpk._hsv.s = Math.round(x / 166 * 100);
        cpk._hsv.v = Math.round(100 - (y / 166 * 100));

        cpk.callback();
    };

    // repositions cursor and sets color values
    cpk.hue.update = function(e) {
        var position = cpk.hue.picker.offset();
        var y = e.pageY - Math.ceil(position.top);

        y = y < 0 ? 0 : y;
        y = y > 166 ? 166 : y;

        var offset = y ? 4 : 3;

        cpk.hue.cursor.css({
            top: y - offset
        });

        cpk._hsv.h = 360 - Math.round(y / 166 * 360);

        // update color map
        var bg = cpk.calc.hsvToHex({
            s: 100,
            v: 100,
            h: cpk._hsv.h
        });

        cpk.saturation.picker.css({
            backgroundColor: bg
        });

        cpk.callback();
    };

    // reposition cursors based on hex value
    cpk.set = function(hex) {
        // get the hsv color from hex
        if(hex) cpk._hsv = cpk.calc.hexToHsv(hex);

        var bg = cpk.calc.hsvToHex({
            s: 100,
            v: 100,
            h: cpk._hsv.h
        });
        cpk.saturation.picker.css({
            backgroundColor: bg
        });

        var x = cpk._hsv.s / 100 * 166;
        var y = (100 - cpk._hsv.v) / 100 * 166;

        cpk.saturation.cursor[0].style.left = (x - 4) + "px";
        cpk.saturation.cursor[0].style.top = (y - 4) + "px";

        var hy = 166 - (cpk._hsv.h / 360 * 166);
        var offset = (hy) ? 4 : 3;

        cpk.hue.cursor.css({
            // top: (hy - offset) + "px"
        });
    };


    cpk.calc = {

        // convert hsv value to rgb
        // http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
        hsvToRgb: function(hsv){

            var r, g, b;
            var h = hsv.h / 360,
                s = hsv.s / 100,
                v = hsv.v / 100;

            var i = Math.floor(h * 6);
            var f = h * 6 - i;
            var p = v * (1 - s);
            var q = v * (1 - f * s);
            var t = v * (1 - (1 - f) * s);

            switch(i % 6) {
            case 0:
                r = v;
                g = t;
                b = p;
                break;
            case 1:
                r = q;
                g = v;
                b = p;
                break;
            case 2:
                r = p;
                g = v;
                b = t;
                break;
            case 3:
                r = p;
                g = q;
                b = v;
                break;
            case 4:
                r = t;
                g = p;
                b = v;
                break;
            case 5:
                r = v;
                g = p;
                b = q;
                break;
            }

            return {
                r: r * 255,
                g: g * 255,
                b: b * 255
            };
        },


        // convert rgb value to hsv
        // http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
        rgbToHsv: function(rgb) {

            var r = rgb.r / 255,
                g = rgb.g / 255,
                b = rgb.b / 255;

            var max = Math.max(r, g, b),
                min = Math.min(r, g, b);

            var h, s, v = max;

            var d = max - min;
            s = max === 0 ? 0 : d / max;

            if(max == min) {
                h = 0; // achromatic
            } else {
                switch(max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
                }

                h /= 6;
            }

            return {
                h: h * 360,
                s: s * 100,
                v: v * 100
            };
        },


        // convert rgb to hex
        rgbToHex: function(rgb) {
            return "#" + ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1,7).toUpperCase();
        },


        // convert hex value to rgb
        hexToRgb: function(hex) {
            hex = hex.replace(/ |#/g, '');
            if(hex.length === 3) hex = hex.replace(/./g, function(e, i){
                var arr = [];        
                return arr[i%1] = Array(3).join(e);
            });
            hex = hex.match(/../g);    
            return {
                r: parseInt(hex[0], 16),
                g: parseInt(hex[1], 16),
                b: parseInt(hex[2], 16)
            };
        },

        // convert hex value to hsv
        hexToHsv: function(hex) {
            return cpk.calc.rgbToHsv(cpk.calc.hexToRgb(hex));
        },


        // convert hsv value to hex
        hsvToHex: function(hsv) {
            var c = cpk.calc.hsvToRgb(hsv);
            return cpk.calc.rgbToHex(c);
        }
    };


    $.fn.colorpicker = function(settings) {
        settings = $.extend({}, defaults, settings);

        return this.bind(settings.bind, function(e) {
            cpk._parent = $(this);
            cpk.settings = settings;
            cpk.register();
            e.stopPropagation();
            e.preventDefault();
        });
    };

}(jQuery, window, document));

$(function() {
    $("input.basic").colorpicker();

    $("a.advanced").colorpicker({
        callback: function(hex, rgb, hsv, el) {
            el.css({
                backgroundColor: hex
            });
            $("#" + el.attr("data-id")).val(hex);
            $('.rgb').val(rgb.g, rgb.g, rgb.b);
            $(".hsv").val(hsv);
        },
        color: function(el) {
            return $("#" + el.attr("data-id")).val();
        },
        position: "right"
    });
});