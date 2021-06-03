/*
 * НАСТРОЙКИ СХЕМЫ:
 *
 * data - объект с данными
 * smallBlockWidth - ширина маленького блока (100)
 * smallBlockHeight - высота маленького блока (60)
 * smallBlockRenderer - рендерер маленького блока
 * smallBlockColors
 * smallBlockHorizontalGap
 * smallBlockVerticalGap
 * smallBlockVerticalGap2
 * smallBlockVerticalGap3
 * openedBlocks
 *
 * */

/*
 * СОБЫТИЯ:
 *
 * datachange
 *
 * */

/*
 * Возможные свойства для маленького блока (smallBlock):
 * width - ширина блока в пикселях, необязательое
 * height - высота блока в пикселях, необязательое
 * title - заголовок блока, необязательое
 * img - картинка для блока, необязательое
 * color - цвет фона блока, необязательое
 * customData - кастомные данные для блока, необязательое
 *
 * Возможные свойства для большого блока (bigBlock):
 * width - ширина блока в пикселях, необязательое
 * height - высота блока в пикселях или 'auto', необязательое
 * title - заголовок блока, необязательое
 * content - содержимое блока, необязательое
 * img - картинка для блока, необязательое
 * color - цвет фона блока, необязательое
 * customData - кастомные данные для блока, необязательое
 *
 * Возможные свойства для попапов:
 * width - ширина окна в пикселях, необязательое
 * height - высота окна в пикселях или 'auto', необязательое
 * title - заголовок блока, необязательое
 * content - содержимое блока, необязательое
 *
 * */

(function($, undefined) {

    $.widget('physicon.scheme', {
        version: '1.0.0',
        options: {
            data: null,
            smallBlockWidth: 160, // Ширина маленького блока по дефолту
            smallBlockHeight: 80, // Высота маленького блока по дефолту
            linkHandler: null,
            smallBlockHorizontalGap: 20,
            smallBlockVerticalGap: 30,
            openedBlocks: []
        },

        _create: function() {
            this.element.addClass('physicon-scheme');
            this._createScheme();
        },

        _destroy: function() {
            this.element.removeClass('physicon-scheme').empty();
        },

        _setOptions: function(options) {
            this._super(options);
            this._createScheme();
        },

        _createScheme: function() {
            this.element.empty();

            ///////////////////////////////////////////////////////////
            // Функция, возвращающая html код тэга
            ///////////////////////////////////////////////////////////
            var createTag = function(tagName, classNames, style, unselectable, innerHTML, params) {
                var p = '';
                for (var k in params) {
                    p += ' ' + k + '="' + params[k] + '"';
                }
                return '<' + tagName +
                    (classNames ? ' class="' + classNames + '"' : '') +
                    (style ? ' style="' + style + '"' : '') +
                    (unselectable ? ' unselectable="on"' : '') +
                    p +
                    (innerHTML ? '>' + innerHTML + '</' + tagName + '>' : '/>');
            };

            ///////////////////////////////////////////////////////////
            // Функция, возвращающая html код тэга div
            ///////////////////////////////////////////////////////////
            var createDiv = function(classNames, style, unselectable, innerHTML, params) {
                return createTag('div', classNames, style, unselectable, innerHTML, params);
            };
            var that = this,
                schemeDataObj = {},
                scheme$ = this.element,
                blocker$ = $(createDiv('scheme-blocker', '', 1)),
                $schemeContainer = $(createDiv('scheme-main-container', '', 1)),
                opts = this.options,
                blocksSruct = {},
                specBlocksHGap = 10,
                schemeW = scheme$.width(),
                schemeH = scheme$.height(),
                mainContHeight = 0,
                defaultSmallBlockWidth = 180,
                defaultSmallBlockHeight = 80,
                defaultSmallBlockColors = ['#97bde2', '#ECB888', '#EEEB8A', '#A8DBA0', '#A1CADC', '#E2DED3'],
                SHOW_BLOCK_CONTENT_TITLE = 'Показать содержимое блока',
                SHOW_CHILD_BLOCKS_TITLE = 'Показать дочерние элементы',
                HIDE_CHILD_BLOCKS_TITLE = 'Скрыть дочерние элементы',
                defaultSmallBlockRenderer = function(data) {
                    return createDiv('block-text-wrapper', '', 0, createTag('span', 'block-text-span', '', 1, 'test'));
                };

            if (that.options.typeline == 'none') this.element.addClass('noline');
            if (that.options.main) {
              this.element.addClass('main');
              defaultSmallBlockColors[0] = '#0E6DAD';
            }

            $.extend(true, schemeDataObj, this.options.data);

            this.resize = function() {
                updateMainContainerPosition();
            };

            // Костыль
            if (!opts.smallBlockRenderer) {
                opts.smallBlockRenderer = defaultSmallBlockRenderer;
            }

            ///////////////////////////////////////////////////////////
            // Создание элементов схемы (блоки, линии)
            ///////////////////////////////////////////////////////////
            var createBlock = function(blockObj, parent, lvl, sObj) {
                if (!lvl) {
                    lvl = 0;
                }
                var numChildren = (blockObj.childs && blockObj.childs.length > 0) ? blockObj.childs.length : 0,
                    $childsBlock,
                    $block = createSmallBlock(blockObj, lvl, sObj),
                    childs = [];

                sObj.$block = $block;
                sObj.opened = false;
                sObj.id = blockObj.id;

                if (blockObj.bigBlock) {
                    blockObj.bigBlock.color = blockObj.smallBlock.color || defaultSmallBlockColors[lvl];
                }

                if (numChildren) {
                    $childsBlock = $(createDiv('scheme-block-childs'));

                    sObj.$childs = $childsBlock;
                    sObj.maxh = 0;
                    sObj.curh = 0;
                    sObj.lvl = lvl;

                    if (numChildren > 1) {
                        $childsBlock.append(createDiv('hline'));
                    }
                    $childsBlock.append(createDiv('vline'));

                    for (var i = 0; i < numChildren; i++) {
                        $childsBlock.append(createDiv('vline'));
                        var o = {};
                        childs.push(o);
                        createBlock(blockObj.childs[i], $childsBlock, lvl + 1, o);
                    }
                    sObj.childs = childs;
                    $schemeContainer.append($childsBlock);
                }

                parent.append($block);
            };



            ///////////////////////////////////////////////////////////
            // Создание маленького блока
            ///////////////////////////////////////////////////////////
            var createSmallBlock = function(blockObj, lvl, sObj) {
                var blockDataObj = blockObj.smallBlock,
                    id = blockObj.id,
                    w = blockDataObj.width || opts.smallBlockWidth,
                    h = blockDataObj.height || opts.smallBlockHeight,
                    title = blockDataObj.title || '',
                    valign = blockObj.smallBlock.valign,
                    img = blockDataObj.img || undefined,
                    color = blockObj.color || defaultSmallBlockColors[lvl],
                    customData = blockDataObj.customData || {},
                    hasContent = (blockObj.bigBlock) ? true : false,
                    hasChildren = (blockObj.childs && blockObj.childs.length > 0) ? true : false,
                    defaultSmallBlockImageRenderer = function(data) {
                        return createTag('img', '', 'width: 100%; height: 100%;', 0, '', { src: data.img, title: data.title });
                    },
                    renderer = blockDataObj.renderer || (img ? defaultSmallBlockImageRenderer : opts.smallBlockRenderer),

                    $block = $(createDiv('block-small bb' + id + ' ' + (blockDataObj.customClass ? blockDataObj.customClass : ''), 'width:' + w + 'px; height:' + h + 'px;', 0,
                        createDiv('block-container') +
                        createDiv('btn-show-content', '', 1, '', { title: SHOW_BLOCK_CONTENT_TITLE }) +
                        createDiv('btn-expand-childs', '', 1, '', { title: SHOW_CHILD_BLOCKS_TITLE })
                    )),

                    dataObj = {
                        width: w,
                        height: h,
                        title: title,
                        valign: valign,
                        img: img,
                        color: color,
                        customData: customData
                    },
                    open_btn$ = $('.btn-expand-childs', $block),
                    show_content_btn$ = $('.btn-show-content', $block),
                    blockContainer$ = $('.block-container', $block),
                    blockClickHandler = function(e) {
                        if (sObj.opened) {
                            closeSomeBlocks(getOpenedBlocksArray(sObj));
                        }
                        else {
                            openBlock(sObj);
                        }
                    };

                $block.attr({
                  'color': color,
                  'blockid': id
                });

                var contData = $(renderer(dataObj));
                blockContainer$.append(contData);
                // if (lvl == 0) {
                    // blockContainer$.find('.block-text-wrapper .block-text-span').first().css('color', 'white');
                // }
                // слушаем клики по ссылкам в маленьких блоках
                $('a', blockContainer$).click(function(e) {
                    e.stopImmediatePropagation();
                    var link_id = $(this).data('link-id');
                    if (link_id !== undefined) {
                        opts.linkHandler(link_id);
                    }
                });

                if (hasContent) {
                    blockContainer$.addClass('has-popup');
                    if (!hasChildren) {
                        blockContainer$.click(function(e) {
                            if (typeof opts.showblockcontent == 'function') {
                                that._trigger("showblockcontent", e, blockObj.bigBlock);
                            }
                            else {}
                        });
                    }
                    show_content_btn$.click(function(e) {
                        // Показать окно с контентом
                        // Нужно передать в функцию объект с параметрами большого блока!!!
                        //schemeOptions.smallBlockClickCallback(blockObj.bigBlock);
                        if (typeof opts.showblockcontent == 'function') {
                            that._trigger("showblockcontent", e, blockObj.bigBlock);
                        }
                        else {}
                    });
                }
                else {
                    show_content_btn$.remove();
                }

                if (hasChildren) {
                    if (!hasContent) {
                        blockContainer$.click(blockClickHandler);
                    }
                    open_btn$.click(blockClickHandler);

                    blockContainer$.hover(
                        function(e) {
                            blockContainer$.addClass('state-hover');
                        },
                        function(e) {
                            blockContainer$.removeClass('state-hover');
                        }
                    );
                }
                else {
                    open_btn$.remove();
                }

                return $block;
            };


            var normalScale = function() {
                $(document.body).addClass('normal-scale');
            }

            var restoreScale = function() {
                $(document.body).removeClass('normal-scale');
            }

            ///////////////////////////////////////////////////////////
            // Рендеринг схемы
            ///////////////////////////////////////////////////////////
            var schemeRenderer = function(blockObj, parent$) {
                // for correct calculating work need scale=1
                normalScale();

                var $block = blockObj.$block,
                    $childs = blockObj.$childs,
                    childsArray = blockObj.childs,
                    childsArrayLen = (blockObj.childs ? blockObj.childs.length : 0),
                    blockW = $block.width(),
                    blockH = $block.height();

                if (!parent$) {
                    $block.css({ top: 0, left: schemeW / 2 - blockW / 2 })
                        .addClass('block-root');
                }

                if ($childs) {
                    var blockPos = $block.position(),
                        parentPos = (parent$ ? parent$.position() : { left: 0, top: 0 }),
                        blockX = blockPos.left + parentPos.left,
                        blockY = blockPos.top + parentPos.top,
                        childsPos,
                        childsX,
                        childsY,
                        childsW,
                        i;

                    var maxBW = 0,
                        maxBH = [0, 0],
                        hgap = opts.smallBlockHorizontalGap,
                        vgap = opts.smallBlockVerticalGap,
                        paddingRight = 10,
                        paddingLeft = 10,
                        blocks$ = $('>.block-small', $childs),
                        $hline = $('>.hline', $childs),
                        vlines$ = $('>.vline', $childs),
                        blocksNum = blocks$.length,
                        allW,
                        onFirstLayer,
                        twoLayers = false;

                    blocks$.each(function() {
                        maxBW = Math.max(maxBW, $(this).width());
                        maxBH[0] = Math.max(maxBH[0], $(this).height());
                    });

                    allW = maxBW * blocks$.length + hgap * (blocks$.length - 1) + specBlocksHGap;

                    onFirstLayer = blocks$.length;
                    twoLayers = false;

                    if (allW > schemeW) {
                        maxBH = [0, 0];
                        twoLayers = true;
                        onFirstLayer = Math.round(blocks$.length / 2);

                        // evry layer theys maxH
                        blocks$.each(function(i) {
                            if (i > onFirstLayer - 1) {
                                maxBH[1] = Math.max(maxBH[1], $(this).height());
                            }
                            else {
                                maxBH[0] = Math.max(maxBH[0], $(this).height());
                            }
                        });
                    }

                    // blockObj.stage - если родитель twoLayers и из 2го ряда
                    var vlineH = (blockObj.stage) ? vgap + blockObj.stage - blockObj.maxBH[0] : 0; // - maxBH[0] : 0; // ???
                    if (blockObj.stage) {
                        blockObj.offset = vgap / 2 + vlineH; // ??
                    }

                    // prepare data and calculate bbw (width of childs block, its need for correct align - center of parent block)
                    var bbw = 0;
                    for (var i = 0; i < childsArrayLen; i++) {
                        // var bx = maxBW*i + hgap*i + (maxBW - childsArray[i].$block.width())/2 + specBlocksHGap,
                        var width = childsArray[i].$block.width(),
                            bx = (childsArray[i - 1] ? childsArray[i - 1].right + hgap : specBlocksHGap), //width*i + hgap*i + specBlocksHGap,
                            by = vlineH,
                            outsetx = 0;

                        childsArray[i].stage = 0;
                        childsArray[i].maxBH = maxBH;

                        if (twoLayers && i > onFirstLayer - 1) {
                            bx = childsArray[i - onFirstLayer].right - width / 2 + hgap / 2 - 1; // 1 width of line
                            by += maxBH[0] + vgap;

                            // check for blocks not coming on each other in 2nd line
                            if (i - onFirstLayer > 0) {
                                var minLeft = childsArray[i - 1].right + hgap - 1;
                                if (minLeft > bx) outsetx = minLeft - bx;
                            }
                        }

                        childsArray[i].stage = twoLayers && i < onFirstLayer ? maxBH[0] + maxBH[1] : 0;

                        childsArray[i].$block.css({ top: by + vgap, left: bx + outsetx });
                        $(vlines$[i + 1]).css({ height: vgap / 2 + by - vlineH, left: bx + width / 2, top: vgap / 2 + vlineH });

                        childsArray[i].right = bx + width + outsetx;

                        bbw = Math.max(bbw, childsArray[i].right - specBlocksHGap);
                    }

                    // Определить размер всех блоков
                    var bbh = vgap + (twoLayers ? maxBH[0] + maxBH[1] + vgap : maxBH[0]);

                    $childs.width(bbw + specBlocksHGap * 2);
                    $childs.height(bbh + vlineH);

                    blockObj.maxh = bbh + vlineH;

                    blockX = $block.position().left + (parent$ ? parent$.position().left : 0);

                    childsW = $childs.width();
                    childsY = blockY + blockH;
                    childsX = blockX + blockW / 2 - childsW / 2;

                    if (childsX < 0) {
                        childsX = paddingLeft;
                    }
                    else if (childsX + childsW > schemeW) {
                        childsX = schemeW - childsW - paddingRight;
                    }

                    $childs.css({ top: childsY, left: childsX });
                    childsPos = $childs.position();

                    var vlineLeft = blockX - childsX + blockW / 2;
                    $('>.vline:first', $childs).css({ height: vgap / 2 + vlineH, left: vlineLeft });

                    // render childs and calculate some lines
                    var parentCenter = vlineLeft,
                        hlineLeft = vlineLeft,
                        hlineWidth = 0;
                    for (var i = 0; i < childsArrayLen; i++) {
                        var width = childsArray[i].$block.width(),
                            bx = (childsArray[i - 1] ? childsArray[i - 1].right + hgap : specBlocksHGap);
                        if (twoLayers && i > onFirstLayer - 1) {
                            bx = childsArray[i - onFirstLayer].right - width / 2 + hgap / 2 - 1; // 1 width of line
                        }
                        if (i == 0) {
                            hlineLeft = Math.min(parentCenter || Infinity, bx + width / 2);
                            hlineWidth = vlineLeft - hlineLeft + 3;
                        }
                        var childHlineWidth = bx + width / 2 - hlineLeft;
                        hlineWidth = Math.max(childHlineWidth, hlineWidth);

                        schemeRenderer(childsArray[i], $childs);
                    }


                    // horizontal line
                    $hline.css({
                        left: hlineLeft, // maxBW / 2 + specBlocksHGap,
                        width: hlineWidth, //maxBW * (onFirstLayer - 1) + hgap * (onFirstLayer - 1)  + (twoLayers && blocksNum % 2 == 0 ? maxBW / 2 + hgap / 2 : 0 ),
                        top: vgap / 2 + vlineH
                    });

                    //ARCH #8355 firsov
                    if (that.options.typeline == 'arrow') {
                        for (var i = 0; i < vlines$.length; i++) {
                          if (i == 0) continue;  // #8842
                            var d = $('<div>').appendTo($(vlines$[i]));
                            d.css('width', '3px');
                            d.css('height', 0);
                            d.css('border', '10px solid transparent');
                            d.css('border-top-color', '#1A6DA3');
                            d.css('border-top', '10');
                            d.css('margin-left', '-10px');
                            d.css('margin-top', ($(vlines$[i]).height() - 10) + 'px');
                        }
                    }


                }

                restoreScale();
            };

            ///////////////////////////////////////////////////////////
            // Функция возвращает массив объектов открытых блоков
            ///////////////////////////////////////////////////////////
            var getOpenedBlocksArray = function(blockObj, res) {
                var i,
                    childsNum = blockObj.childs ? blockObj.childs.length : 0;
                if (!res) res = [];
                if (blockObj.opened) {
                    res.push(blockObj);
                }
                if (childsNum) {
                    for (i = 0; i < childsNum; i++) {
                        getOpenedBlocksArray(blockObj.childs[i], res);
                    }
                }
                return res;
            };

            ///////////////////////////////////////////////////////////
            //Разворачивание блока
            ///////////////////////////////////////////////////////////
            var openBlock = function(sObj) {
                blocker$.show();
                var open = function() {
                    sObj.opened = true;
                    $schemeContainer.prepend(sObj.$childs);

                    var ob$ = $('.btn-expand-childs', sObj.$block);
                    ob$.addClass('expanded');
                    ob$.attr('title', HIDE_CHILD_BLOCKS_TITLE);

                    // blocker$.hide();
                    // sObj.$childs.show();
                    // return;;

                    var top = $schemeContainer.css('top').replace('px', '') * 1;

                    $(sObj.$childs).slideDown({
                        duration: 500,
                        complete: function() {
                            blocker$.hide();
                            opts.onblockopened(sObj);
                        },
                        step: function(now, fx) {
                            if (fx.prop == 'height') {
                                var shemeTop = top - now / 2;
                                if (shemeTop < 12) shemeTop = 12;

                                $schemeContainer[0].style.top = shemeTop + 'px';

                                // sObj.curh = now;
                                // mainContHeight = 0;
                                // normalScale();
                                // resizeMainCont(blocksSruct);
                                // restoreScale();
                                // $schemeContainer.height(mainContHeight + 24);
                                //
                                // // centering at vertical:
                                // var top = schemeH/2 - (mainContHeight + 24)/2;
                                // top = top < 12 ? 12 : top;
                                // $schemeContainer.css({top: top});
                            }
                        }
                    });
                };

                normalScale();

                var $curChilds = sObj.$childs;
                $curChilds.show();

                var openedBlocksArray = getOpenedBlocksArray(blocksSruct);
                var $curChilds = sObj.$childs,
                    position = $curChilds.position(),
                    curX = position.left,
                    curY = $curChilds.data('curY') * 1,
                    curW = $curChilds.width(),
                    curH = $curChilds.height();

                // fix IE in zoom mode
                if (!curY) {
                    $curChilds.data('curY', curY = position.top);
                }
                else {
                    $curChilds.css('top', curY)
                }

                $curChilds.hide();
                if (sObj.offset != undefined) {
                    curY = curY + sObj.offset;
                    curH = curH - sObj.offset;
                }

                // console.log(openedBlocksArray, sObj)

                var crossedArr = [];
                // var crossedArr = openedBlocksArray;

                for (var j = 0; j < openedBlocksArray.length; j++) {
                    // var $ch = openedBlocksArray[j].$childs,
                    //     position = $ch.position(),
                    //     chY = $ch.data('chY'),
                    //     chX = position.left,
                    //     chW = $ch.width(),
                    //     chH = $ch.height();
                    //
                    // // fix IE in zoom mode
                    // if (!chY) {
                    //   chY = position.top;
                    //   $ch.data('chY', position.top);
                    // }
                    //
                    // // openedBlocksArray[j].$childs.css('border', '1px solid red')
                    //
                    // if(openedBlocksArray[j].offset!=undefined){
                    //     chY= chY + openedBlocksArray[j].offset;
                    //     chH= chH - openedBlocksArray[j].offset;
                    // }
                    // // console.log(chY, chH)
                    //
                    // var childs = []
                    // if(   ( (curX<chX&&curX+curW>chX)||(curX>=chX&&curX<chX+chW) )  &&  ( (curY<chY&&curY+curH>chY)||(curY>=chY&&curY<chY+chH) )   ){
                    //     crossedArr.push(openedBlocksArray[j]);
                    // }
                    if (sObj.lvl == openedBlocksArray[j].lvl) crossedArr.push(openedBlocksArray[j]);
                }
                restoreScale();

                // if (openedBlocksArray.length > 1) crossedArr = openedBlocksArray;

                var ch = [];
                for (var j = 0; j < crossedArr.length; j++) {
                    var childs = getOpenedBlocksArray(crossedArr[j]);
                    ch = ch.concat(childs);
                }

                for (var jj = 0; jj < ch.length; jj++) {
                    var no = false;
                    for (var j = 0; j < crossedArr.length; j++) {
                        if (crossedArr[j] == ch[jj]) no = true;
                    }
                    if (!no) crossedArr.push(ch[jj]);
                }

                ///
                if (crossedArr.length) {
                    closeSomeBlocks(crossedArr, function() {
                        open();
                    });
                }
                else {
                    open();
                }
            };

            ///////////////////////////////////////////////////////////
            // Сворачивание блоков
            ///////////////////////////////////////////////////////////
            var closeSomeBlocks = function(blocksArray, completeHandler) {
                normalScale();
                blocker$.show();

                var hider$ = $(createDiv('', 'width:100%; position: absolute;', 1, '', { id: 'hider' }));
                $schemeContainer.append(hider$);

                var hiderTop = 10000;


                for (var i = 0; i < blocksArray.length; i++) {
                    hiderTop = Math.min(hiderTop, blocksArray[i].$childs.position().top);
                }

                hider$.css({ top: hiderTop });

                var arr = blocksArray;
                var hiderH = 0;
                for (var i = 0; i < arr.length; i++) {
                    arr[i].opened = false;
                    arr[i].curh = 0;
                    hider$.append(arr[i].$childs);
                    hiderH = Math.max(hiderH, arr[i].$childs.position().top + arr[i].maxh);
                    arr[i].$childs.css({ top: arr[i].$childs.position().top - hider$.position().top });
                }

                hider$.height(hiderH - hider$.position().top);

                restoreScale();


                // hider$.remove();
                // blocker$.hide();
                // if(completeHandler) completeHandler();
                // return;;

                var top = $schemeContainer.css('top').replace('px', '') * 1,
                    childsHeight = $(hider$).height();

                $(hider$).slideUp({
                    duration: 500,
                    complete: function() {
                        hider$.show();
                        for (var i = 0; i < arr.length; i++) {
                            var tt = hiderTop + arr[i].$childs.position().top;

                            $schemeContainer.prepend(arr[i].$childs);
                            arr[i].$childs.css({ top: tt });
                            arr[i].$childs.hide();

                            var ob$ = $('.btn-expand-childs', arr[i].$block);
                            ob$.removeClass('expanded');
                            ob$.attr('title', SHOW_CHILD_BLOCKS_TITLE);
                        }
                        hider$.remove();
                        blocker$.hide();
                        if (completeHandler) completeHandler();
                    },
                    step: function(now, fx) {
                        if (fx.prop == 'height') {
                            var shemeTop = top - (now - childsHeight) / 2;
                            if (shemeTop < 12) shemeTop = 12;

                            $schemeContainer[0].style.top = shemeTop + 'px';

                            // mainContHeight = 0;
                            // normalScale();
                            // resizeMainCont(blocksSruct);
                            // mainContHeight = Math.max(0,mainContHeight, hider$.position().top + now);
                            // restoreScale();
                            // var top = schemeH/2 - (mainContHeight + 24)/2;
                            // top = top < 12 ? 12 : top;
                            // $schemeContainer.height(mainContHeight + 24);
                            // $schemeContainer.css({top: top});
                        }
                    }
                });

            };

            ///////////////////////////////////////////////////////////
            // Пересчёт высоты основного контейнера
            ///////////////////////////////////////////////////////////
            var resizeMainCont = function(blockObj, res) {
                if (res == undefined) res = 0;
                if (blockObj.childs) {
                    // var h = (blockObj.opened==false ? 0 : blockObj.curh + blockObj.$childs.css('top').replace('px','')*1);
                    var h = (blockObj.opened == false ? 0 : blockObj.curh + blockObj.$childs.position().top);
                    mainContHeight = Math.max(mainContHeight, h);
                    res = Math.max(res, h);
                    for (var i = 0; i < blockObj.childs.length; i++) {
                        resizeMainCont(blockObj.childs[i], res);
                    }
                }
                return res;
            };

            ///////////////////////////////////////////////////////////
            // Изменение позиционирования основного контейнера
            ///////////////////////////////////////////////////////////
            var updateMainContainerPosition = function() {
                schemeW = scheme$.width();
                schemeH = scheme$.height();
                normalScale();
                resizeMainCont(blocksSruct);
                restoreScale();
                // $schemeContainer.height(mainContHeight + 24);
                var top = schemeH / 2 - (mainContHeight + 24) / 2;
                top = top < 12 ? 12 : top;
                $schemeContainer.css({ top: top });
            };

            ///////////////////////////////////////////////////////////
            // Открытие блоков при старте
            ///////////////////////////////////////////////////////////
            var openBlocks = function(blockObj) {
                var i,
                    childs = blockObj.childs,
                    childsLen = (childs ? childs.length : 0),
                    $childs = blockObj.$childs,
                    openedBlocks = opts.openedBlocks,
                    openedBlocksLen = (openedBlocks ? openedBlocks.length : 0);

                if (childsLen) {
                    if (openedBlocksLen) {
                        for (i = 0; i < openedBlocksLen; i++) {
                            blockObj.curh = blockObj.maxh;
                            if (blockObj.id == openedBlocks[i]) {
                                $childs.show();
                                blockObj.opened = true;
                                var ob$ = $('.btn-expand-childs', blockObj.$block);
                                ob$.addClass('expanded');
                                ob$.attr('title', HIDE_CHILD_BLOCKS_TITLE);
                                break;
                            }
                            else {
                                $childs.hide();
                            }
                        }
                    } else {
                        $childs.hide();
                        blockObj.curh = 0;
                    }

                    for (i = 0; i < childsLen; i++) {
                        openBlocks(childs[i]);
                    }
                }

                // blockObj.$block.hide();
            };

            scheme$.append($schemeContainer).append(blocker$);
            createBlock(schemeDataObj, $schemeContainer, 0, blocksSruct);
            schemeRenderer(blocksSruct);

            window.re = function () {updateMainContainerPosition(); schemeRenderer(blocksSruct)}

            // #9463
            scheme$.addClass('mathjax-calc'); // 9463#note-8 Надо скрыть этап просчета
            AppModels.updateMathJax(function () {scheme$.removeClass('mathjax-calc');});

            openBlocks(blocksSruct);
            if (!opts.openedBlocks || !opts.openedBlocks.length) mainContHeight = blocksSruct.$block.height();
            updateMainContainerPosition();
            this._trigger("datachange");
        }
    });

})(jQuery);
