function ISlideshow(xmlData, wrapper, basePath, params) {
    this.init = function() {
        return new modelNS.ISlideshowView({
            model: new modelNS.ISlideshow({
                //xmlData: $('<root/>').append(xml),
                xmlData: xmlData,
                wrapper: wrapper,
                basePath: basePath,
                params: params,
                restyling: "title"
            })
        }).renderOnShow();
    };
}

modelNS.ISlideshow = modelNS.BaseModel.extend({
    //defaults: _.extend({}, modelNS.BaseModel.prototype.defaults, {}),
    initialize: function(options) {
        options.defaults = $.extend({
            navHeight: 35
        }, options.defaults);
        this.options = options;
        modelNS.BaseModel.prototype.initialize.apply(this, [options]);
    },
    parseXML: function(xmlData) {
        var $model = this,
            $xml = $(typeof(xmlData) == 'string' ? $.parseXML(xmlData) : xmlData),
            $root = $xml.find('slideshow'),
            arrow = $root.attr('arrow') === 'true',
            titles = $root.attr('titles') === 'true',
            xmlHeigh = $root.attr('height') * 1 || 0,
            xmlWidth = $root.attr('width') * 1 || 0,
            viewwidth = $root.attr('viewwidth') * 1,
            viewheight = $root.attr('viewheight') * 1,
            $objects = $xml.find('object');

        this.height = this.options.height || xmlHeigh || this.defaults.height;
        if (this.height < this.defaults.minHeight) this.height = this.defaults.minHeight;
        if (this.height > this.defaults.maxHeight) this.height = this.defaults.maxHeight;

        this.width = this.options.width || xmlWidth || this.defaults.width;
        if (this.width < this.defaults.minWidth) this.width = this.defaults.minWidth;
        if (this.width > this.defaults.maxWidth) this.width = this.defaults.maxWidth;

        return $.extend($model.defaults, {
            width: $model.width,
            height: $model.height,
            viewwidth: viewwidth,
            viewheight: viewheight,
            objects: $objects,
            arrow: arrow,
            titles: titles
        })
    }
})


modelNS.ISlideshowView = modelNS.BaseModelView.extend({

    events: {
        // 'click .player-controls .play:not(.disable)': 'centerClick',
    },

    centerclick: [],
    onsetcenter: [],

    initialize: function(options) {

        var params = options.model.dataJSON,
            mediaType = params.mediaType,
            self = this;
    },

    onCenterClick: function(fn) {
        this.centerclick.push(fn);
    },

    centerClick: function($img) {
        var openPopup = true;
        for (var i = 0; i < this.centerclick.length; i++) {
            if (this.centerclick[i].apply(this, [$img]) === false) openPopup = false;
        }

        //if (openPopup) this.openPopup($img); // #
    },

    onSetCenter: function(fn) {
        if (fn) {
            this.onsetcenter.push(fn)
        }
        else {
            for (var i = 0; i < this.onsetcenter.length; i++) {
                this.onsetcenter[i].apply(this);
            }
        }
    },

    render: function() {
        modelNS.BaseModelView.prototype.render.apply(this);
        this.$el.addClass('slideshow');

        var params = this.model.dataJSON,
            sizes = _.pick(params, ["width", "height", "minWidth", "minHeight", "maxWidth", "maxHeight"]);

        // размеры модели
        this.$el.css(sizes);

        if (isIE() == 9) this.$el.addClass('ie9');

        this.renderLayout();
        this.renderPics();
        this.renderNav();
        this.renderArrow();

        this.parsePopups();

        return this;
    },

    renderLayout: function() {
        var params = this.model.dataJSON,
            navHeight = params.navHeight;

        this.mainLayout = new modelNS.DualHorizontalLayout({
            nopadding: true,
            bottomPaneHeight: navHeight,
            parent: this.$el
        }).render();

        this.$container = $('<div class="slideshow-container"></div>').appendTo(this.mainLayout.$topPane);

    },

    renderNav: function() {
        var params = this.model.dataJSON,
            objects = params.objects,
            self = this;

        this.$nav = this.mainLayout.$bottomPane;
        for (var o = 0; o < objects.length; o++) {
            var object = $(objects[o]);
            this.$nav.append($("<div class='slideshow-point' index='" + o + "'/>").click(function() {
                self.setCenterByIndex($(this).attr('index'));
            }));
        }
    },

    renderArrow: function() {
        var params = this.model.dataJSON,
            arrow = params.arrow,
            self = this;

        if (arrow) {
            this.$container.append($('<a class="next"/>').click(function() {
                self.setCenter(self.$figure.find('.right'));
            }));
            this.$container.append($('<a class="prev"/>').click(function() {
                self.setCenter(self.$figure.find('.left'));
            }));
            this.$container.addClass('has-arrow');
        }
    },

    renderPics: function() {
        var params = this.model.dataJSON,
            basePath = this.model.options.basePath,
            objects = params.objects,
            self = this,
            $center;

        this.perspective = params.width / 2;

        this.$figure = $('<figure/>')
            .css('perspective', this.perspective)
            .addClass('fast')
            .appendTo(this.$container);

        this.$canvasFigure = $('<figure/>')
            .addClass('canvases')
            .appendTo(this.$container);

        this.loaded = 0;
        this.count = 0;
        for (var o = 0; o < objects.length; o++) {
            var object = $(objects[o]),
                src = basePath + object.attr('file'),
                id = object.attr('id'),
                $img = $('<img id="'+id+'" src="' + src + '" index="' + o + '" title="' + object.text() + '"/>'),
                $canvas = $('<canvas/>'),
                sizesCalcualted = false;

            if (object.attr('width')) $img.attr('width', object.attr('width'));
            if (object.attr('height')) $img.attr('height', object.attr('height'));
            $img.error(function() { self.imgErrorLoad.apply(self, [this, src]) });
            $img.load(function() { self.imgOnLoad.apply(self, [this, $center]) });
            $img.click(function() { self.imgOnClick.apply(self, [this]) });

            (function(img) { $canvas.click(function() { self.imgOnClick.apply(self, [img]) }) })($img[0]);

            if (!$center && object.attr('center')) $center = $img.data('center', 1);

            this.$figure.append($img);

            this.$canvasFigure.append($canvas);
            $img.data('canvas', $canvas);

            this.count++;
            // repeat adding for nice look
            if (o == objects.length - 1 && this.count < 8) o = -1;
        }

        if (!$center) $center = this.$figure.find('img').first();
    },

    imgErrorLoad: function (img, src)
    {
        alert("Error load img: " + src);
    },

    imgOnClick: function(img) {
        return this.setCenter($(img));
    },

    imgOnLoad: function(img, $center) {
        var $img = $(img);

        // size K
        var width = $img.width(),
            height = $img.height(),
            sizek = width / height;

        $img.data({
            width: width,
            height: height,
            sizek: sizek
        });

        if ($img.data('center')) {
            this.setCenter($img);
        }

        this.loaded++;
        if (this.loaded == this.count) {
            $center ? this.setCenter($center) : this.setCenterByIndex(0);
        }

        // #8870
        var kWidth = height/img.naturalHeight * img.naturalWidth,
            kHeight = width/img.naturalWidth * img.naturalHeight;
        if (kWidth < width) $img.css('padding', '0 ' + Math.round((width - kWidth)/2) + 'px');
        if (kHeight < height) $img.css('padding', Math.round((height - kHeight)/2) + 'px 0');
    },

    drawCanvas: function($img, params) {
        var $canvas = $img.data('canvas'),
            canvas = $canvas[0],
            ctx = canvas.getContext('2d'),
            deg = params.rotate,
            scale = 1 - 1 / 90 * Math.abs(deg),
            img = document.createElement('img'),
            currentStyle = $img[0].currentStyle;
        // width = $img.data('width'),
        // height = $img.data('height');


        img.src = $img.attr('src');

        img.onload = function() {

            var width = img.width,
                height = img.height,
                numSlices = width * 1,
                sliceWidth = width / numSlices,
                sliceHeight = height,
                heightScale = (1 - scale) / numSlices,
                widthScale = (scale * scale * scale),
                borderRadius = currentStyle.borderRadius.replace('px', '') * 2,
                borderWidth = currentStyle.borderWidth.replace('px', '') * 1,
                borders = [];

            ctx.clearRect(0, 0, width, height);
            canvas.height = height;

            canvas.width = width * widthScale;

            for (var i = numSlices; i >= 0; i--) {
                // Where is the vertical chunk taken from?
                var sx = sliceWidth * i,
                    sy = 0,
                    koef = i;

                if (deg < 0) {
                    koef = numSlices - i;
                }

                // Where do we put it?
                var dx = sliceWidth * i * widthScale,
                    dy = (sliceHeight * heightScale * koef) / 2,
                    dHeight = sliceHeight * (1 - (heightScale * koef)),
                    dWidth = sliceWidth * scale;

                ctx.drawImage(img, sx, sy, sliceWidth, sliceHeight, dx, dy, dWidth, dHeight);

                // save border points
                if (borderWidth) {
                    if (i == 0) {
                        borders.push({ x: borderWidth / 2, y: dy + borderRadius + borderWidth });
                        borders.push({ x: borderWidth / 2, y: dy + dHeight - borderRadius - borderWidth });
                    }
                    else if (i == borderRadius) {
                        borders.push({ x: dx, y: dy + borderWidth / 2 });
                        borders.push({ x: dx, y: dy + dHeight - borderWidth / 2 });
                    }
                    else if (i == (numSlices - 1 - borderRadius)) {
                        borders.push({ x: dx, y: dy + borderWidth / 2 });
                        borders.push({ x: dx, y: dy + dHeight - borderWidth / 2 });
                    }
                    else if (i == (numSlices - 1)) {
                        borders.push({ x: dx, y: dy + borderRadius });
                        borders.push({ x: dx, y: dy + dHeight - borderRadius });
                    }
                }
            }

            // draw border
            if (borderWidth) {
                ctx.beginPath();
                ctx.strokeStyle = currentStyle.borderColor;
                ctx.lineWidth = borderWidth;
                ctx.moveTo(borders[2].x, borders[2].y);
                ctx.lineTo(borders[4].x, borders[4].y);
                ctx.quadraticCurveTo(borders[6].x, borders[4].y, borders[6].x, borders[6].y);
                ctx.lineTo(borders[7].x, borders[7].y);
                ctx.quadraticCurveTo(borders[7].x, borders[5].y, borders[5].x, borders[5].y);
                ctx.lineTo(borders[3].x, borders[3].y);
                ctx.quadraticCurveTo(borders[1].x, borders[3].y, borders[1].x, borders[1].y);
                ctx.lineTo(borders[0].x, borders[0].y);
                ctx.quadraticCurveTo(borders[0].x, borders[2].y, borders[2].x, borders[2].y);
                ctx.stroke();
            }

        }
    },

    parsePopups: function() {
        var params = this.model.dataJSON,
            viewwidth = params.viewwidth,
            viewheight = params.viewheight;

        if (viewwidth && viewheight) this.popupCollection = new modelNS.PopupCollection([{
            autoWidth: false,
            closableOnOverlayClick: true,
            id: 'popup',
            height: viewheight,
            width: viewwidth,
            content: "<div class='title'/><div class='pic'/><div class='nav'/>"
        }]);

        // $popup = new modelNS.PopupView({model: this.popupCollection.get('popup')});
        // this.$el.append($popup.render().el);
        // $popup.$el.hide();
    },

    openPopup: function($img) {
        var params = this.model.dataJSON,
            popup = this.popupCollection && this.popupCollection.get('popup'),
            titles = params.titles,
            titleHeight = params.titleHeight,
            heightOutset = (titles && titleHeight || 0) + 60,
            self = this;

        if (popup) {
            $popup = new modelNS.PopupView({ model: popup });
            this.$el.append($popup.render().el);
            $popup.on("PopupShowed", function() {

                self.$el.find('.nav').append(self.$nav.find('.point').clone());
                setImgInPopup($img);
                if (!titles) this.$el.find('.title').hide();

                function setImgInPopup($img) {
                    var $clone = $img.clone();
                    self.$el.find('.pic').html('').append($clone);
                    $clone.height(params.height - heightOutset); // TODO: in settings
                    $clone.width((params.height - heightOutset) * $clone.data('sizek'));
                    self.$el.find('.title').html($clone.attr('title'));
                }

                self.$el.find('.nav .point').click(function() {
                    self.$el.find('.nav .active').removeClass('active');
                    $(this).addClass('active');
                    self.selectedIndex = $(this).attr('index');
                    setImgInPopup(self.$figure.find('img[index=' + self.selectedIndex + ']').first());
                });
            });
            $popup.on("PopupClosedOnCloseBtn", function() {
                self.setCenterByIndex(self.selectedIndex);
            });
        }
    },

    setCenter: function($img) {
        var params = this.model.dataJSON,
            $prev = this.loopPrev($img),
            $next = this.loopNext($img),
            $images = this.$figure.find('img'),
            $center = this.$figure.find('.center'),
            objects = params.objects,
            curIndex = $center.attr('index')
        self = this;

        // this.$center = $img;

        if ($img.hasClass('center')) {
            return this.centerClick($img);
        }

        // slide effect by order (corusel)
        if (!this.gotoID && $center.length && ($img[0] != this.loopPrev($center)[0] && $img[0] != this.loopNext($center)[0])) {
            var direction,
                $searchLeft = $center,
                $searchRight = $center;
            while (!direction) {
                $searchLeft = this.loopPrev($searchLeft);
                $searchRight = this.loopNext($searchRight);
                if ($img[0] == $searchLeft[0]) direction = 'loopPrev';
                if ($img[0] == $searchRight[0]) direction = 'loopNext';
            }

            // this.$figure.addClass('fast');
            function goto() {
                var $goto = self[direction](self.$figure.find('.center'));
                if ($img[0] == $goto[0]) {
                    self.gotoID = clearInterval(self.gotoID);
                    // self.$figure.removeClass('fast');
                }
                self.setCenter($goto);
            }
            goto();
            this.gotoID = setInterval(goto, 100);

            return;
        }

        $images
            .removeClass('center')
            .removeClass('lleft')
            .removeClass('left')
            .removeClass('rright')
            .removeClass('right')
            .removeClass('leftback')
            .removeClass('rightback')

        var figureWidth = this.$figure.width(),
            maxHeight = params.height - params.navHeight,
            centerWidth = figureWidth / 2,
            centerHeight = centerWidth / $img.data('sizek'),
            sideWidth = figureWidth * 0.25;

        if (centerHeight > maxHeight) {
            centerHeight = maxHeight;
            centerWidth = maxHeight * $img.data('sizek');
        }

        var centerTop = (maxHeight - centerHeight) / 2;

        this.animateImg($img, 'center', this.centerParams = {
            width: centerWidth,
            height: centerHeight,
            left: figureWidth / 2 - centerWidth / 2,
            top: centerTop,
            rotate: 0,
            zIndex: 4
        });

        this.animateImg($prev, 'left', {
            width: figureWidth / 4,
            height: centerHeight * 0.7,
            left: figureWidth / 4 - sideWidth + figureWidth * 0.03,
            top: centerTop + centerHeight * 0.3 / 2,
            rotate: -30,
            zIndex: 3
        });

        var $first = this.loopPrev($prev);
        this.animateImg($first, 'lleft', {
            width: figureWidth * 0.1,
            height: centerHeight * 0.5,
            left: 0,
            top: centerTop + centerHeight * 0.5 / 2,
            rotate: -40,
            zIndex: 2
        });

        this.animateImg($next, 'right', {
            width: figureWidth / 4,
            height: centerHeight * 0.7,
            left: figureWidth / 4 * 3 - figureWidth * 0.03,
            top: centerTop + centerHeight * 0.3 / 2,
            rotate: 30,
            zIndex: 3
        });

        this.animateImg(this.loopNext($next), 'rright', {
            width: params.width * 0.1,
            height: centerHeight * 0.5,
            left: figureWidth / 4 * 3 + figureWidth * 0.14,
            top: centerTop + centerHeight * 0.5 / 2,
            rotate: 40,
            zIndex: 2
        });

        var length = $images.length - 5;
        for (var i = 0; i < length; i++) {

            var className = i < Math.floor(length / 2) && 'leftback' || i > length / 2 && 'rightback' || '';

            this.animateImg($first = this.loopPrev($first), className, {
                width: 200,
                height: centerHeight * 0.3,
                left: (figureWidth - figureWidth * 0.2) / length * (i + 0.5) - 100 + figureWidth * 0.1,
                top: centerTop + centerHeight * 0.5 - centerHeight * 0.3 / 2,
                rotate: className == 'leftback' && -100 || className == 'rightback' && 100 || false,
                zIndex: 0
            });

        }

        // nav points
        this.$nav.find('.active').removeClass('active');
        this.$nav.find('div[index=' + $img.attr('index') + ']').addClass('active');

        this.selectedIndex = $img.attr("index");

        this.onSetCenter();
    },

    animateImg: function($img, className, params) {
        $img.addClass(className);

        if (isIE() == 9) { // using jQuery js animations

            var $canvas = $img.data('canvas');

            // perspective outsets and size changes
            var figureWidth = this.$figure.width() / 2,
                widthK = 1 - (figureWidth - Math.abs(figureWidth - (params.left + params.width / 2))) / figureWidth,
                perspectiveWidth = 1 / 90 * Math.abs(params.rotate) * params.width * widthK * 2;
            // console.log(className, perspectiveWidth, widthK)
            params.width = params.width - perspectiveWidth;
            params.left += perspectiveWidth / 2;
            var perspectiveHeight = 1 / 90 * Math.abs(params.rotate) * params.width;
            params.height += perspectiveHeight;
            params.top -= perspectiveHeight / 2;
            // console.log(className, perspectiveHeight)


            $canvas.stop().animate(params, 300);

            this.drawCanvas($img, params);

        }	else { // using css animations

            $img
            // .width(params.width)			// #8870
                .css('width', params.width)	// #8870
                .height(params.height)
                .css('left', params.left)
                .css('top', params.top)

        }
    },

    setCenterByIndex: function(index) {
        var $center = this.$figure.find('.center'),
            curIndex = $center.attr('index');

        if (curIndex === undefined) {
            return this.setCenter(this.$figure.find('img:first-child'));
        }

        if ($center.length && curIndex == index) return;

        if (index > curIndex) {
            while (index != curIndex) {
                $center = this.loopNext($center);
                curIndex = $center.attr('index');
            }
        }
        else {
            while (index != curIndex) {
                $center = this.loopPrev($center);
                curIndex = $center.attr('index');
            }
        }

        this.setCenter($center);
    },

    loopPrev: function($el) {
        var $prev = $el.prev();
        return $prev.length ? $prev : $el.parent().children().last();
    },

    loopNext: function($el) {
        var $next = $el.next();
        return $next.length ? $next : $el.parent().children().first();
    }

});