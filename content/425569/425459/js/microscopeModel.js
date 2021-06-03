function MicroscopeModel(xmlData, wrapper, basePath, params) {
    var model;
    this.init = function () {
        model = new modelNS.MicroscopeModel({
            xmlData: xmlData,
            wrapper: wrapper,
            basePath: basePath,
            restyling: "title",
            // scalable: false,
            // defaults: {},
            width: wrapper.data('width'),
            height: wrapper.data('height'),
            params: params
        });
        return new modelNS.MicroscopeModelView({ model: model }).renderOnShow();
    };
}

modelNS.CommonModel.models.microscopeModel = MicroscopeModel;

modelNS.addLangs({
    ru: {
        // Layout titles
        microscope: 'Микроскоп',
        tuningAccuracy: 'Точность',
        animationMode: 'Режим',
        microscopeParameters: 'Параметры микроскопа',
        magnificationAndResolution: 'Увеличение и разрешение',
        // Input tooltips
        waveLenInput: 'Длина волны',
        tubulusInput: 'Длина тубуса',
        lensDiameter: 'Диаметр объектива',
        F1Input: 'Фокусное расстояние объектива',
        F2Input: 'Фокусное расстояние окуляра',
        nInput: 'Показатель преломления среды между предметом и объективом',
        lensIncrease: 'Линейное увеличение объектива',
        ocularIncrease: 'Линейное увеличение окуляра',
        microscopeIncrease: 'Линейное увеличение микроскопа',
        NAlabel: 'Числовая апертура',
        Rlabel: 'Разрешающая способность микроскопа',
        // Svg tooltips
        firstImage: 'Промежуточное изображение',
        lastImage: 'Конечное изобажение',
        lens: 'Объектив',
        ocular: 'Окуляр',

    }
});

modelNS.MicroscopeModel = modelNS.BaseModel.extend({
    initialize: function (options) {
        modelNS.BaseModel.prototype.initialize.apply(this, arguments);
    },
});

modelNS.MicroscopeModelView = modelNS.BaseModelView.extend({
    initialize: function () {
        modelNS.BaseModelView.prototype.initialize.apply(this, arguments);
    },
    render: function () {
        modelNS.BaseModelView.prototype.render.apply(this);
        this.$el.addClass('microscopeModel');
        this.renderParams();
        this.renderLayout();
        this.renderControls();
        this.renderLabels();
        
        this.renderFunc()
        this.renderUpdateParams()
        this.renderSvg();
        this.renderUpdateLens()
        this.renderListener();
       /* 
        this.renderDefaults();
         */
    },

    renderLayout: function () {
        this.layout = {};

        this.layout.level1 = new modelNS.DualHorizontalLayout({
            topPaneHeight: 320, // 400
            parent: this.$el,
        }).render();

        this.layout.animationPane = new modelNS.SingleLayout({
            title: modelNS.lang('microscope'),
            parent: this.layout.level1.$topPane,
            hasContent: true,
            hasPadding: false,
            nopadding: true,
            columns: 1,
            cls: 'animation',
        }).render();

        this.layout.level2 = new modelNS.DualVerticalLayout({
            parent: this.layout.level1.$bottomPane,
            firstPaneWidth: 660,  //660
        }).render();

        this.layout.level3 = new modelNS.DualVerticalLayout({
            parent: this.layout.level2.$firstPane,
            firstPaneWidth: 236, //255
        }).render();

        this.layout.level4 = new modelNS.DualHorizontalLayout({
            parent: this.layout.level3.$firstPane,
            topPaneHeight: 100, //100
        }).render();

        this.layout.tuningAccuracy = new modelNS.SingleLayout({
            title: modelNS.lang('tuningAccuracy'),
            parent: this.layout.level4.$bottomPane,
            hasContent: true,
            columns: 1,
            cls: 'tuningAccuracy',
        }).render();

        this.layout.animationMode = new modelNS.SingleLayout({
            title: modelNS.lang('animationMode'),
            parent: this.layout.level4.$topPane,
            hasContent: true,
            columns: 1,
            cls: 'animationMode',
        }).render(); 

        this.layout.microscopeParameters = new modelNS.SingleLayout({
            title: modelNS.lang('microscopeParameters'),
            parent: this.layout.level3.$secondPane,
            hasContent: true,
            columns: 2,
            cls: 'microscopeParameters',
        }).render(); 

        this.layout.magnificationAndResolution = new modelNS.SingleLayout({
            title: modelNS.lang('magnificationAndResolution'),
            parent: this.layout.level2.$secondPane,
            hasContent: true,
            columns: 2,
            cls: 'magnificationAndResolution',
        }).render(); 

    },
    renderControls: function () {
        var self = this;
        self.control.tubulusInput = new modelNS.Input({
            parent: self.layout.microscopeParameters.$content,
            value: self.kit.tubulusInput.default,
            step: self.kit.tubulusInput.step,
            min: self.kit.tubulusInput.min, 
            max: self.kit.tubulusInput.max,
            inputType: 'number',
            width: 190,
            label: '<span class="italicText">T</span> = ',
            labelAfter: '<span> мм</span>',
            row: true,
            title: modelNS.lang('tubulusInput'),
        }).render();

        self.control.F1Input = new modelNS.Input({
            parent: self.layout.microscopeParameters.$content,
            value: self.kit.F1Input.default,
            step: self.kit.F1Input.step,
            min: self.kit.F1Input.min, 
            max: self.kit.F1Input.max,
            inputType: 'number',
            width: 190,
            label: '<span class="italicText">F</span><sub>1</sub> = ',
            labelAfter: '<span> мм</span>',
            row: true,
            title: modelNS.lang('F1Input'),
        }).render();

        self.control.waveLenInput = new modelNS.Input({
            parent: self.layout.microscopeParameters.$content,
            value: self.kit.waveLenInput.default,
            step: self.kit.waveLenInput.step,
            min: self.kit.waveLenInput.min, 
            max: self.kit.waveLenInput.max,
            inputType: 'number',
            width: 190,
            label: '<span class="greekText lambda">&lambda;</span> = ',
            labelAfter: '<span> нм</span>',
            row: true,
            title: modelNS.lang('waveLenInput'),
        }).render();

        self.control.F2Input = new modelNS.Input({
            parent: self.layout.microscopeParameters.$content,
            value: self.kit.F2Input.default,
            step: self.kit.F2Input.step,
            min: self.kit.F2Input.min, 
            max: self.kit.F2Input.max,
            inputType: 'number',
            width: 190,
            label: '<span class="italicText">F</span><sub>2</sub> = ',
            labelAfter: '<span> мм</span>',
            row: true,
            title: modelNS.lang('F2Input'),
        }).render();

        self.control.lensDiameterInput = new modelNS.Input({
            parent: self.layout.microscopeParameters.$content,
            value: self.kit.lensDiameter.default,
            step: self.kit.lensDiameter.step,
            min: self.kit.lensDiameter.min, 
            max: self.kit.lensDiameter.max,
            inputType: 'number',
            width: 190,
            label: '<span class="italicText">D</span> = ',
            labelAfter: '<span> мм</span>',
            row: true,
            title: modelNS.lang('lensDiameter'),
        }).render();

        self.control.nInput = new modelNS.Input({
            parent: self.layout.microscopeParameters.$content,
            value: self.kit.nInput.default,
            step: self.kit.nInput.step,
            min: self.kit.nInput.min, 
            max: self.kit.nInput.max,
            disabled: true,
            inputType: 'number',
            width: 190,
            label: '<span class="italicText nLabel">n</span> = ',
            cls: 'nInput',
            row: true,
            title: modelNS.lang('nInput'),
        }).render();
    },
    renderLabels: function () {
        var self = this;
        self.label.lensIncrease = new modelNS.LabelView({
            title: modelNS.lang('lensIncrease'),
            cls: 'lensIncrease',
            text: '<span>|<span class="greekText">&Gamma;</span><sub>1</sub>|<span> = {%d}',
            parent: self.layout.magnificationAndResolution.$content,
        }).render();

        self.label.NAlabel = new modelNS.LabelView({
            title: modelNS.lang('NAlabel'),
            cls: 'NAlabel',
            text: '<span class="italicText">NA</span> = {%d}',
            parent: self.layout.magnificationAndResolution.$content,
        }).render();

        self.label.ocularIncrease = new modelNS.LabelView({
            title: modelNS.lang('ocularIncrease'),
            cls: 'ocularIncrease',
            text: '<span>|<span class="greekText">&Gamma;</span><sub>2</sub>|<span> = {%d}',
            parent: self.layout.magnificationAndResolution.$content,
        }).render();

        self.label.Rlabel = new modelNS.LabelView({
            title: modelNS.lang('Rlabel'),
            cls: 'Rlabel',
            text: '<span class="italicText">R</span> = {%d} мкм',
            parent: self.layout.magnificationAndResolution.$content,
        }).render();

        self.label.microscopeIncrease = new modelNS.LabelView({
            title: modelNS.lang('microscopeIncrease'),
            cls: 'microscopeIncrease',
            text: '<span>|<span class="greekText">&Gamma;</span>|<span> = {%d}',
            parent: self.layout.magnificationAndResolution.$content,
        }).render();
    },

    renderParams: function () {
        var self = this;
        window.RRL = self; // для доступа из глобального объекта window
        self.func = { help: 'functions' };
        self.updateFunc = { help: 'functions for updating values' };
        self.defaults = {}; // стартовые значения
        self.help = {}; // подсказки
        self.control = {}; // элементы управления
        self.label = {};
        self.img = {}

        self.svg = {};

        self.constants = {L: 250,
                          height: 360,
                          width: 998,
                          svgMargin: 15,
                          xAxisLength: 900, //968
                          yAxisLength: 320, //330
                          objHdefault: 3,
                          objHeight: 3,
                          baseY: 50,
                          objY: 30 + 10 }
        self.scales = {
            scaleX: d3.scaleLinear()
                        .domain([0, 420])
                        .range([0, self.constants.xAxisLength]),
            scaleY: d3.scaleLinear()
                        .domain([70, 0])
                        .range([0, self.constants.yAxisLength]),
            unScaleX: d3.scaleLinear()
                        .domain([0, self.constants.xAxisLength])
                        .range([0, 420]),
            scaleYLinear: d3.scaleLinear()
                            .domain([0, 70])
                            .range([0, self.constants.yAxisLength])
        } 
        self.params = { lens1x: self.scales.scaleX(110),
                        start1x: 130,
                        lens2x: self.scales.scaleX(270),
                        D2: 38 }  // параметры для формул
        
        self.coords = {} // координаты объектов, точек
        self.mode = { rendered: false,
                      schema: true,
                      roughState: true }
        self.kit = { help: 'kit of values' };
        self.kit.lineWidth = 2;
        self.kit.tubulusInput = { help: 'инпут тубулуса',
                                  max: 200,
                                  min: 150,
                                  step: 5,
                                  default: 160 };
        self.kit.waveLenInput = { help: 'инпут длины волны',
                                  max: 700,
                                  min: 400,
                                  step: 50,
                                  default: 500  };
        self.kit.lensDiameter = { help: 'инпут диаметра объектива',
                                  max: 30,
                                  min: 10,
                                  step: 1,
                                  default: 20  };
        self.kit.F1Input = { help: 'инпут фокусного расстояния объектива',
                                  max: 70,
                                  min: 35,
                                  step: 5,
                                  default: 40,
                                  maxAccurate: 3,
                                  minAccurate: 2,
                                  stepAccurate: 0.1,
                                  defaultAccurate: 2.5,
                                    };
        self.kit.F2Input = { help: 'инпут фокусного расстояния окуляра',
                                  max: 60,
                                  min: 40,
                                  step: 5,
                                  default: 50,
                                  maxAccurate: 30,
                                  minAccurate: 20,
                                  stepAccurate: 1,
                                  defaultAccurate: 25,
                                    };
        self.kit.F1InputAccurate = { help: 'инпут фокусного расстояния объектива',
                                max: 3,
                                min: 2,
                                step: 0.1,
                                default: 2.5,
                                      };
        self.kit.F2InputAccurate = { help: 'инпут фокусного расстояния окуляра',
                                    max: 30,
                                    min: 20,
                                    step: 1,
                                    default: 25,
                                      };
        self.kit.nInput = { help: 'инпут показателя преломления',
                                  max: 2,
                                  min: 1,
                                  step: 0.1,
                                  default: '1,0'  };

        self.defaults = {

        };
    },

    renderFunc: function () {
        var self = this;
        var PI = Math.PI
        var L = self.constants.L
        
        self.func.f1Calc = function (T, F2) {
            return ((L*T + F2*T - F2*L) / (L + F2))
        };
        self.func.d1Calc = function (T, F2, F1) {
            return (F1*(T*(L+F2) - F2*L)) / (T*(L+F2) - F2*L - F1*(F2+L))
        };
        self.func.sinAlphaCalc = function (D, d) {
            return D / (2*Math.sqrt(d*d + (D*D/4)))
        };
        self.func.alphaAngleCalc = function (sinA) {
            return Math.asin(sinA) / PI * 180
        };
        self.func.NACalc = function (D, d, n) {
            return (D / (2*Math.sqrt(d*d + (D*D/4))))*n
        };
        self.func.RCalc = function (waveLen, NA) {
            return (waveLen / 1000) / (2*NA)
        };
        self.func.setLens = function (lens, x) {
            if (lens._groups[0][0].id === 'firstLens') {
                self.params.lens1x = x
            } else {
                self.params.lens2x = x
            }
            lens.attr("transform", "translate(" + x + "," + '0' + ")");
        };
        self.func.moveObj = function (obj, x) {
            obj.attr("transform", "translate(" + x + "," + '0' + ")")
        }
    },

    renderSvg: function () { 
        var self = this;
        //var width = self.kit.width;

        var height = self.constants.height, 
            width = self.constants.width, 
            margin = self.constants.svgMargin,
            data=[];
        // создание объекта svg
        var svg = d3.select(self.layout.animationPane.$content[0]).append("svg")
                .attr("class", "axis")
                .attr("width", width)
                .attr("height", height)
                .attr("overflow", 'hidden');
        var layer1 = svg.append('g').attr("id", "layer1")
        var layer2 = svg.append('g').attr("id", "layer2")
        var layer3 = svg.append('g').attr("id", "layer3")
        // создаем элементы для изображений в микроскопе
        var animation = $('svg').parent().css('overflow', 'hidden')
                                        .append('<div class="animationBackground"></div>')
                                        
        $('.animationBackground').append('<div class="animationImage"></div>')
                                    .append('<div class="animationFilter"></div>')
        // создаем иллюстрацию объекта
        var illustrationEl = $('svg').parent().append('<div id="objectIllustration"></div>')
        d3.select('#objectIllustration').append('svg')
                                        .attr("id", "objectIllustrationSvg")
                                        .attr("width", 260)
                                        .attr("height", 150)
        // создаем маркер для линий света
        var markerBoxWidth = 15
        var markerBoxHeight = 6
        var refX = markerBoxWidth / 2
        var refY = markerBoxHeight / 2
        var arrowPoints = [ [0, 6], [15, 3], [0, 0]];

        d3.select('svg')
            .append('defs')
            .append('marker')
            .attr('id', 'arrow')
            .attr('viewBox', [0, 0, markerBoxWidth, markerBoxHeight])
            .attr('refX', refX)
            .attr('refY', refY)
            .attr('markerWidth', markerBoxWidth)
            .attr('markerHeight', markerBoxHeight)
            .attr('orient', 'auto-start-reverse')
            .append('path')
            .attr('d', d3.line()(arrowPoints))
        
        // длина оси X= ширина контейнера svg - отступ слева и справа
        var xAxisLength = self.constants.xAxisLength;     
        // длина оси Y = высота контейнера svg - отступ сверху и снизу
        var yAxisLength = self.constants.yAxisLength;
        // функции интерполяции значений
        var scaleX = self.scales.scaleX
        var unScaleX = self.scales.unScaleX 
        var scaleY = self.scales.scaleY
        var scaleYLinear = self.scales.scaleYLinear
              
        // создаем ось X   
        var xAxis = d3.axisBottom()
                    .scale(scaleX)
                    
        // создаем ось Y             
        var yAxis = d3.axisLeft()
                    .scale(scaleY)
        xAxis.ticks(40)
        yAxis.ticks(16)          
                    
        // отрисовка оси Х             
        var xAxis = layer1.append("g")       
            .attr("class", "x-axis")
            .attr("transform",  // сдвиг оси вниз и вправо
                "translate(" + margin + "," + (height - margin) + ")")
            .call(xAxis);
        
        // отрисовка оси Y 
        var yAxis = layer1.append("g")       
            .attr("class", "y-axis")
            .attr("transform", // сдвиг оси вниз и вправо на margin
                    "translate(" + margin + "," + margin + ")")
            .call(yAxis);
        
        // создаем набор вертикальных линий для сетки   
        d3.selectAll("g.x-axis g.tick")
            .append("line").style("stroke", "black")
            .classed("grid-line", true)
            .attr("x1", 0)
            .attr("y1", 50)
            .attr("x2", 0)
            .attr("y2", - (yAxisLength+50));
            
        // рисуем горизонтальные линии координатной сетки
        d3.selectAll("g.y-axis g.tick")
            .append("line").style("stroke", "black")
            .classed("grid-line", true)
            .attr("x1", -50)
            .attr("y1", 0)
            .attr("x2", xAxisLength+50)
            .attr("y2", 0);
        var dashStyle = [self.kit.lineWidth*15, self.kit.lineWidth*6, self.kit.lineWidth*1.5, self.kit.lineWidth*6 ]
                        .join(' ')
        //[3 * self.kit.lineWidth, 1.5 * self.kit.lineWidth, self.kit.lineWidth, 1.5 * self.kit.lineWidth]
        // главная линия
        data = [{x: -50, y: self.constants.baseY}, {x: xAxisLength, y: self.constants.baseY},]
        var line = d3.line()
                    .x(function(d){return scaleX(d.x)+margin;})
                    .y(function(d){return scaleY(d.y)+margin;});
        // добавляем путь
        layer1.append("g").append("path")
                        .attr("d", line(data))
                        .style("stroke", "black").attr('stroke-dasharray', dashStyle)
                        .style("stroke-width", self.kit.lineWidth / 2);
        // создаем объекты
        var baseY = scaleY(self.constants.baseY)+margin
        updateMicObject(layer3, margin, 
                            -scaleYLinear(self.constants.objHeight), baseY, 'realObj', '#009900')
        updateMicObject(layer3, margin, 
                            scaleYLinear(self.constants.objHeight*self.params.lensIncrease), 
                            baseY, 'firstImg', '#66CC00', modelNS.lang('firstImage'))
        updateMicObject(layer3, margin, 
                            scaleYLinear(self.constants.objHeight*self.params.microscopeIncrease), 
                            baseY, 'secondImg', '#66CC00', modelNS.lang('lastImage'))
        
    },
    renderUpdateLens: function() {
        var layer2 = d3.select('#layer2')
        var self = this;
        var margin = self.constants.svgMargin
        var prms = self.params
        var scaleY = self.scales.scaleY
        var scaleYLinear = self.scales.scaleYLinear
        var scaleX = self.scales.scaleX
        var baseY = scaleY(self.constants.baseY) + margin

        var svg = d3.select("svg")

        var T = scaleX(prms.T)
        var F1 = scaleX(prms.F1)
        var F2 = scaleX(prms.F2)
        var D1 = scaleYLinear(prms.D1)
        var D2 = scaleYLinear(prms.D2)
        var lens1x = 0 + margin
        var lens2x = lens1x //lens1x + T
        
        // создаем линзы
        var firstLens = createLens(layer2, lens1x, D1, F1, baseY, 'firstLens', self.mode.roughState, modelNS.lang('lens'))
        var secondLens = createLens(layer2, lens2x, D2, F2, baseY,'secondLens', self.mode.roughState, modelNS.lang('ocular'))
        // создаем фокусы линз
        drawFocus(layer2, lens1x, baseY, F1, 'firstLensFocus')
        drawFocus(layer2, lens2x, baseY, F2, 'secondLensFocus')
        // ставим линзы в их дефолтные значения
        if (!self.mode.rendered) {
            var scaledX = scaleX(prms.start1x)
            self.func.setLens(firstLens, scaledX )
            self.func.setLens(secondLens, scaledX  + T)
            // обновляем координаты 
            //var len1x = self.params.lens1x = scaleX(self.params.lens1x)
            //var len2x = self.params.lens2x = len1x + T
            self.mode.rendered = true
        }

        self.func.moveObj(d3.select('#realObj'), scaleX(prms.start1x - prms.d1))
        self.func.moveObj(d3.select('#firstImg'), scaleX(prms.start1x + prms.f1))
        self.func.moveObj(d3.select('#secondImg'), scaleX(prms.start2x + prms.f2))
        
    },

    renderUpdateParams: function () {
        var self = this;
        var svg = d3.select('svg')
        var scaleX = self.scales.scaleX
        var scaleY = self.scales.scaleY
        var scaleYLinear = self.scales.scaleYLinear
        var prms = self.params
        var coords = self.coords
        var margin = self.constants.svgMargin
        // получаем данные с инпутов
        var T = prms.T = +self.control.tubulusInput.getText()
        var F1 = prms.F1 = +self.control.F1Input.getText()
        var F2 = prms.F2 = +self.control.F2Input.getText()
        var waveLen = prms.waveLen = +self.control.waveLenInput.getText()
        var D = prms.D1 = +self.control.lensDiameterInput.getText()*1.4
        var n = prms.n = +self.control.nInput.getText()
        // вычисления
        var f1 = prms.f1 = self.func.f1Calc(T, F2)
        var d1 = prms.d1 = (f1*F1)/(f1-F1)
        var d2 = prms.d2 = T - f1
        var f2 = prms.f2 = (F2*d2) / (d2 - F2)
        var startx2 = prms.start2x = prms.start1x + T
        var lensIncrease = prms.lensIncrease = Math.abs(f1 / d1)
        var ocularIncrease = prms.ocularIncrease = Math.abs(f2 / d2)

        var microscopeIncrease = prms.microscopeIncrease = prms.lensIncrease * prms.ocularIncrease
        var sinAlpha = self.params.sinAlpha = self.func.sinAlphaCalc(D, d1)
        self.params.alphaAngle = self.func.alphaAngleCalc(sinAlpha)
        var NA = prms.NA = self.func.NACalc(D, d1, n)
        var R = prms.R = self.func.RCalc(waveLen, NA)
        // обновляем вывод вычислений
        self.label.lensIncrease.set({d: lensIncrease.toFixed(2).toString().replace(/\./, ',') })
        self.label.NAlabel.set({d: NA.toFixed(2).replace(/\./, ',') })
        self.label.ocularIncrease.set({d: ocularIncrease.toFixed(2).replace(/\./, ',') })
        self.label.Rlabel.set({d: R.toFixed(2).replace(/\./, ',') })
        self.label.microscopeIncrease.set({d: microscopeIncrease.toFixed(2).replace(/\./, ',') })
        // обновляем координаты точек лучей
        var baseY = scaleY(self.constants.baseY)+margin
        coords.startPoint = [prms.lens1x-scaleX(prms.d1)+margin, baseY + 
                                                -scaleYLinear(self.constants.objHeight)]
        coords.img2Point = [prms.lens1x+scaleX(prms.f1)+margin, baseY + 
            scaleYLinear(self.constants.objHeight*prms.lensIncrease)]
        
        coords.img3Point = [prms.lens2x+scaleX(prms.f2)+margin, baseY + 
            scaleYLinear(self.constants.objHeight*prms.microscopeIncrease)]
        coords.lens1upPoint = [prms.lens1x+margin, baseY + 
            scaleYLinear(D/2)]
        coords.lens1downPoint = [prms.lens1x+margin, baseY - 
            scaleYLinear(D/2)]
        //updateLineColor(svg, waveLengthToRgb(prms.waveLen))
    }, 

    renderListener: function () {
        var self = this;
        var svg = d3.select('svg')
        var layer2 = d3.select('#layer2')
        var svgIllustration = d3.select('#objectIllustrationSvg')
        var divIllustration = $('#objectIllustration')
        divIllustration.hide()
        var margin = self.constants.svgMargin
        var tubulusInput = self.control.tubulusInput
        var unScaleX = self.scales.unScaleX
        var scaleX = self.scales.scaleX
        var scaleY = self.scales.scaleY
        var scaleYLinear = self.scales.scaleYLinear
        var Tmin = self.kit.tubulusInput.min
        var Tmax = self.kit.tubulusInput.max
        var TminScaled = scaleX(Tmin)
        var TmaxScaled = scaleX(Tmax)
        var drag = { lens1x: 0, lens2x: 0}
        var prms = self.params
        var coords = self.coords
        var isFirstLens,
            currentLens,
            lensDistance;
        var realObj = d3.select('#realObj')
        var firstImgObj = d3.select('#firstImg')
        var secondImgObj = d3.select('#secondImg')
        //начальный запуск
        updateLines(layer2)
        updateLineColor(svg, waveLengthToRgb(prms.waveLen))

        function updateLines(svgEl) {
            var lens1downPoint = coords.lens1downPoint
            var lens1upPoint = coords.lens1upPoint
            var img2Point = coords.img2Point
            var img3Point = coords.img3Point
            var startPoint = coords.startPoint
            var xEnd = self.constants.width + 50
            var lens2x = prms.lens2x+margin
            var color = waveLengthToRgb(prms.waveLen)
            
            var yMidArr = yCoordFrom2Points(startPoint[0], startPoint[1], 
                                            img2Point[0], img2Point[1], lens2x)
            var ySecondDownArr = yCoordFrom2Points(lens1downPoint[0], lens1downPoint[1], 
                                    img2Point[0], img2Point[1], lens2x)
            var ySecondUpArr = yCoordFrom2Points(lens1upPoint[0], lens1upPoint[1], 
                                    img2Point[0], img2Point[1], lens2x)
            var yEndUpArr = yCoordFrom2Points(img3Point[0], img3Point[1], 
                                    lens2x, ySecondDownArr, xEnd)
            var yEndDownArr = yCoordFrom2Points(img3Point[0], img3Point[1], 
                                    lens2x, ySecondUpArr, xEnd)
            var yEndMidArr = yCoordFrom2Points(img3Point[0], img3Point[1], 
                                    lens2x, yMidArr, xEnd)

            updateLine(svgEl, startPoint[0], startPoint[1], lens1upPoint[0], lens1upPoint[1], 'down', color)
            updateLine(svgEl, startPoint[0], startPoint[1], lens1downPoint[0], lens1downPoint[1], 'up', color)
            updateLine(svgEl, startPoint[0], startPoint[1], lens2x, yMidArr, 'mid', color)
            updateLine(svgEl, lens1downPoint[0], lens1downPoint[1], lens2x, ySecondDownArr, 'secondDown', color)
            updateLine(svgEl, lens1upPoint[0], lens1upPoint[1], lens2x, ySecondUpArr, 'secondUp', color)
            updateLine(svgEl, lens2x, ySecondDownArr, xEnd, yEndUpArr, 'afterUp', color)
            updateLine(svgEl, lens2x, ySecondUpArr, xEnd, yEndDownArr, 'afterDown', color)
            updateLine(svgEl, lens2x, yMidArr, xEnd, yEndMidArr, 'afterMid', color)
            //dash линии от последнего изображения
            updateDashLine(svgEl, img3Point[0], img3Point[1], lens2x, ySecondUpArr, 'dashUp', color)
            updateDashLine(svgEl, img3Point[0], img3Point[1], lens2x, yMidArr, 'dashMid', color)
            updateDashLine(svgEl, img3Point[0], img3Point[1], lens2x, ySecondDownArr, 'dashDown', color)
        }
        
        self.func.moveLens = function (lens, x) {
            isFirstLens = lens._groups[0][0].id === 'firstLens'
            currentLens = isFirstLens ? 'lens1x' : 'lens2x'
            drag[currentLens] = x 
            lensDistance = Math.abs(unScaleX(drag.lens1x) - unScaleX(drag.lens2x))
            if (lensDistance >= Tmin && x > 80 && x < 950 && lensDistance <= Tmax) {
                tubulusInput.setText(lensDistance.toFixed())
                lens.attr("transform", "translate(" + x + "," + '0' + ")");
                prms[currentLens] = x
            } else {
                if (lensDistance < Tmin) {
                    var edgePoint = isFirstLens ? prms.lens2x - TminScaled : prms.lens1x + TminScaled
                    tubulusInput.setText(Tmin)
                    lens.attr("transform", "translate(" + edgePoint + "," + '0' + ")");
                    prms[currentLens] = edgePoint
                };
                if (lensDistance > Tmax) {
                    var edgePoint = isFirstLens ? prms.lens2x - TmaxScaled : prms.lens1x + TmaxScaled
                    tubulusInput.setText(Tmax)
                    lens.attr("transform", "translate(" + edgePoint + "," + '0' + ")");
                    prms[currentLens] = edgePoint
                };
            }
        };

        var dragHandler = d3.drag()
                            .on('start', function () {
                                drag.lens1x = prms.lens1x
                                drag.lens2x = prms.lens2x
                            })
                            .on("drag", function (d) {
                                // Current position:
                                this.x = this.id === 'firstLens' ? drag.lens1x : drag.lens2x
                                // Update thee position with the delta x and y applied by the drag:
                                this.x += d3.event.dx;
                                self.func.moveLens(d3.select(this), this.x)
                                self.renderUpdateParams()
                                moveObjects()
                                updateObjects()
                            }).on('end', function () {
                    
                            })

        dragHandler(svg.select("#firstLens"));
        dragHandler(svg.select("#secondLens"));

        var moveObjects = function() {
            self.func.moveObj(realObj, prms.lens1x-scaleX(self.params.d1))
            self.func.moveObj(firstImgObj, prms.lens1x+scaleX(self.params.f1))
            self.func.moveObj(secondImgObj, prms.lens2x+scaleX(self.params.f2))
            updateLines(false)
        }
        var updateObjects = function() {
            var baseY = scaleY(self.constants.baseY)+margin
            updateMicObject(svg, margin, 
                -scaleYLinear(self.constants.objHeight), baseY, 'realObj', '#009900')
            updateMicObject(svg, margin, 
                scaleYLinear(self.constants.objHeight*self.params.lensIncrease), 
                baseY, 'firstImg', '#66CC00')
            updateMicObject(svg, margin, 
                scaleYLinear(self.constants.objHeight*self.params.microscopeIncrease), 
                baseY, 'secondImg', '#66CC00')
        }
        self.func.moveObj(realObj, scaleX(self.params.start1x - self.params.d1))
        self.func.tubulusUpdate = function (value) {
            var diff = value - self.params.T
            prms.lens2x += scaleX(diff)
            drag.lens1x = prms.lens1x
            drag.lens2x = prms.lens2x
            self.func.moveLens(svg.select("#secondLens"), prms.lens2x)
            self.renderUpdateParams()
            moveObjects()
            updateObjects()
        }

        self.func.switсhRoughState = function(bool) {
            if (bool) {
                self.constants.objHeight = self.constants.objHdefault
                self.control.F1Input.min = self.kit.F1Input.min
                self.control.F1Input.max = self.kit.F1Input.max
                self.control.F1Input.step = self.kit.F1Input.step
                self.control.F1Input.setText(self.kit.F1Input.default)
                self.control.F2Input.setText(self.kit.F2Input.default)
                self.control.F2Input.min = self.kit.F2Input.min
                self.control.F2Input.max = self.kit.F2Input.max
                self.control.F2Input.step = self.kit.F2Input.step
            } else {
                self.constants.objHeight = 0
                self.control.F1Input.min = self.kit.F1InputAccurate.min
                self.control.F1Input.max = self.kit.F1InputAccurate.max
                self.control.F1Input.step = self.kit.F1InputAccurate.step
                self.control.F1Input.setText(self.kit.F1InputAccurate.default)
                self.control.F2Input.setText(self.kit.F2InputAccurate.default)
                self.control.F2Input.min = self.kit.F2InputAccurate.min
                self.control.F2Input.max = self.kit.F2InputAccurate.max
                self.control.F2Input.step = self.kit.F2InputAccurate.step
            }
            self.renderUpdateParams()
            self.renderUpdateLens()
            moveObjects()
            updateObjects()
        }

        self.func.swithAnimationMode = function(bool) {
            if (bool) {
                $('svg').show()
                $('.animationBackground').hide()
                $('.animationFilter').hide() 
            } else {
                $('svg').hide()
                $('.animationBackground').show()
                $('.animationFilter').show() 
            }
        }
        var imgEl = $('.animationImage')
        var filterEl = $('.animationFilter')
        // цветовой фильтр в зависимости от длины волны
        self.func.updateImageColor = function() {
            var waveLen = +self.control.waveLenInput.getText()
            filterEl.css('background', waveLengthToRgb(waveLen))
        }
        self.func.updateImageColor()
        self.func.scaleImg = function() {
            if (!self.mode.schema) {
                var scale = prms.microscopeIncrease
                if (self.mode.roughState) {
                    scale = (scale - 2.3) / 24.7
                    var percent = 500 * scale + 100
                    var num = 1
                    var prnt = 100
                    if (percent > 100) {
                        num = 1
                        prnt = percent
                    } 
                    if (percent > 350) {
                        num = 2
                        prnt = percent - 250
                    } 
                    if (percent > 450) {
                        num = 3
                        prnt = percent - 350
                    }
                    
                    imgEl.css('background-image', "url('"+ self.model.basePath + "img/" + num + "leaf.png')")

                    imgEl.css('background-size', ''+prnt+'%'+' '+prnt+'%')
                } else {
                    scale = (scale - 374) / 837.5
                    var percent = 730 * scale + 100
                    var num = 1
                    var prnt = 100
                    if (percent > 100) {
                        num = 1
                        prnt = percent
                    } 
                    if (percent > 200) {
                        num = 2
                        prnt = percent - 100
                    } 
                    if (percent > 300) {
                        num = 3
                        prnt = percent - 200
                    }
                    if (percent > 380) {
                        num = 4
                        prnt = percent - 280
                    }
                    if (percent > 580) {
                        num = 5
                        prnt = percent - 480
                    }
    
                    imgEl.css('background-image', "url('"+ self.model.basePath + "img/" + num + "cell.png')")
                    imgEl.css('background-size', ''+prnt+'%'+' '+prnt+'%')
                }
            }
        }
        
        self.control.animationMode = new modelNS.RadioButtonGroup({
            collection: new modelNS.RadioButtonCollection([
                {
                    label: modelNS.lang('Схема'), value: 0,
                    checked: true,
                    height: '20px',
                    onCheck: function () {
                        self.mode.schema = true
                        self.func.swithAnimationMode(true)
                        self.func.scaleImg()
                    }
                },
                {
                    label: modelNS.lang('Установка'), value: 1,
                    onCheck: function () {
                        self.mode.schema = false
                        self.func.swithAnimationMode(false)
                        self.func.scaleImg()
                        
                    }
                }
            ]),
            parent: self.layout.animationMode.$content,
            columns: 1,
            verticalAlign: 'middle'
        }).render();

        self.control.tuningAccuracy = new modelNS.RadioButtonGroup({
            collection: new modelNS.RadioButtonCollection([
                {
                    label: modelNS.lang('Грубая установка'), value: 0,
                    checked: true,
                    height: '20px',
                    onCheck: function () {
                        self.control.nInput.disabled = true
                        self.control.nInput.disable()
                        self.mode.roughState = true
                        self.func.switсhRoughState(true)
                        self.func.scaleImg()
                    }
                },
                {
                    label: modelNS.lang('Точная установка'), value: 1,
                    onCheck: function () {
                        self.control.nInput.disabled = false
                        self.control.nInput.enable()
                        self.mode.roughState = false
                        self.func.switсhRoughState(false)
                        self.func.scaleImg()
                    }
                }
            ]),
            parent: self.layout.tuningAccuracy.$content,
            columns: 1,
            verticalAlign: 'middle'
        }).render();

        
        self.listenTo(self.control.tubulusInput, 'Change', function (value) {
            self.func.tubulusUpdate(value)
            self.renderUpdateParams()
            self.func.scaleImg()
        });
        self.listenTo(self.control.F1Input, 'Change', function (value) {
            self.renderUpdateParams()
            self.renderUpdateLens()
            moveObjects()
            updateObjects()
            self.func.scaleImg()
        });
        self.listenTo(self.control.F2Input, 'Change', function (value) {
            self.renderUpdateParams()
            self.renderUpdateLens()
            moveObjects()
            updateObjects()
            self.func.scaleImg()
        });
        self.listenTo(self.control.lensDiameterInput, 'Change', function (value) {
            self.renderUpdateParams()
            self.renderUpdateLens()
            moveObjects()
            updateObjects()
        });
        self.listenTo(self.control.nInput, 'Change', function (value) {
            value = +value
            self.control.nInput.setText(value.toFixed(1))
            self.renderUpdateParams()
        });
        self.listenTo(self.control.waveLenInput, 'Change', function (value) {
            self.renderUpdateParams()
            self.func.updateImageColor()
            updateLines()
            updateLineColor(svg, waveLengthToRgb(value))
        });
        self.listenTo($('#realObj'), 'Click', function (value) {
        });
        // показать/скрыть иллюстрацию объекта при наведении
        d3.select('#realObj').on("mouseover", function(){
            divIllustration.css('left', prms.lens1x-scaleX(prms.d1)+margin)
            divIllustration.show()
            updateIllustration(svgIllustration, self.constants.objHeight,
                self.params.alphaAngle,
                self.params.d1,
                self.params.D1)
        })
        .on("mouseout", function(){
            divIllustration.hide()
        });
    }
});