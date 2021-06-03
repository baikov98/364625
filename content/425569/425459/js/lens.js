
var line = d3.line()
        .x(function(d){return d.x})
        .y(function(d){return d.y});

var strWidth = 2
var focusLineW = 2

var lensLineW = 3
var lensLineColor = '#006599'
var lensLineArrW = 8
var lensLineArrH = 17

var objColor = '#009900'

var objLineW = 2
var objArrL = 15
var objArrW = 4


function drawFocus(svg, x, y, F, id) {
    var x1 = x - F
    var x2 = x + F

    if (d3.select('#'+id+'1')._groups[0][0]) {
        d3.select('#' + id + '1').attr("cx", x1)
        d3.select('#' + id + '2').attr("cx", x2)
    } else {
        var lensId = id.length === 14 ? '#firstLens' : '#secondLens'
        var lens = d3.select(lensId)
        var leftFoc = lens.append("circle")
                            .attr("id", id + '1')
                            .style("fill", "black")
                            .attr("r", 4)
                            .attr("cx", x1)
                            .attr("cy", y)
        var rightFoc = lens.append("circle")
                            .attr("id", id + '2')
                            .style("fill", "black")
                            .attr("r", 4)
                            .attr("cx", x2)
                            .attr("cy", y)
    }
}

// создание линзы
function createLens(svg, lensx, D, F, y, id, mode, tooltip) {
    tooltip = tooltip ? tooltip : ''
    var yUp = y+(D/2)
    var yDown = y-(D/2)
    var data = [{x: lensx, y: yUp}, {x: lensx, y: yDown}]
    var dataArrDown = [{x: lensx-lensLineArrW, y: yUp-lensLineArrH}, {x: lensx, y: yUp}, 
                        {x: lensx+lensLineArrW, y: yUp-lensLineArrH}, {x: lensx, y: yUp-(lensLineArrH/2)},
                        {x: lensx-lensLineArrW, y: yUp-lensLineArrH}]
    var dataArrUp = [{x: lensx-lensLineArrW, y: yDown+lensLineArrH}, {x: lensx, y: yDown}, 
                        {x: lensx+lensLineArrW, y: yDown+lensLineArrH}, {x: lensx, y: yDown+(lensLineArrH/2)},
                        {x: lensx-lensLineArrW, y: yDown+lensLineArrH}]
    var elem = svg.select('#' + id)
    if (elem._groups[0][0]) {
        elem.select('#' + id + 'main')
            .attr("d", line(data))
        elem.select('#' + id + 'mainUp')
            .attr("d", line(dataArrDown))
        elem.select('#' + id + 'mainDown')
            .attr("d", line(dataArrUp))
    } else {
        elem = svg.append("g")
            .attr('id', id)
        elem.append('title').text(tooltip)
        elem.append("path")
            .attr('id', id + 'main')
            .attr("d", line(data))
            .style("stroke-width", lensLineW)
            .style("stroke", lensLineColor)
        elem.append("path")
            .attr('id', id + 'mainUp')
            .attr("d", line(dataArrUp))
            .style("stroke-width", lensLineW-2)
            .style("stroke", lensLineColor).style("fill", lensLineColor)
        elem.append("path")
            .attr('id', id + 'mainDown')
            .attr("d", line(dataArrDown))
            .style("stroke-width", lensLineW-2)
            .style("stroke", lensLineColor).style("fill", lensLineColor)
    }
    return elem
}

// создание/обновление объекта-изображения
function updateMicObject(svg, x, height, baseY, id, color, tooltip) {
    tooltip = tooltip ? tooltip : ''
    color = color ? color : 'red'
    var endPoint = height > 0 ? baseY+height-2 : baseY+height+2
    var ribLen = objArrL
    if ((ribLen+2) > height) ribLen = Math.abs(height)-2//Math.abs(height)/2
    var ribPoint = height > 0 ? endPoint-ribLen : endPoint+ribLen
    var ribFillPoint = height > 0 ? endPoint-(ribLen/1.3) : endPoint+(ribLen/1.3)
    var data = [{x: x, y: baseY}, {x: x, y: endPoint}]
    var dataRib = [{x: x+objArrW, y: ribPoint}, 
                    {x: x, y: endPoint}, 
                    {x: x-objArrW, y: ribPoint}]

    var elem = svg.select('#' + id)
    var circle = svg.select('#' + 'circle' + id)
    if (!height) {
        /* var dataDot = [{x: x, y: baseY}, {x: x, y: baseY+4}, {x: x+4, y: baseY+4},
                        {x: x+4, y: baseY}, {x: x+4, y: baseY-4}, {x: x-4, y: baseY-4},
                        {x: x-4, y: baseY}, {x: x-4, y: baseY+4}, {x: x, y: baseY+4}] */
        elem.select('#' + id + '1').attr("d", '')//.attr("d", line(dataDot)).style('fill', color)
        elem.select('#' + id + '2').attr("d", '')
        elem.select('#' + id + '3').attr("d", '')
        circle.style("opacity", "1")
        return;
    }
    if (elem._groups[0][0]) {
        circle.style("opacity", "0")
        elem.select('#' + id + '1').attr("d", line(data))
        elem.select('#' + id + '2').attr("d", line(dataRib))
    } else {
        var obj = svg.append("g").attr("id", id)
        obj.append('title').text(tooltip)
        obj.append("path")
            .attr("d", line(data)).attr("id", id + '1')
            .style("stroke", color).style("fill", color)
            .style("stroke-width", objLineW);
        obj.append("path")
            .attr("d", line(dataRib)).attr("id", id + '2')
            .style("stroke", color).style("fill", color)
            .style("stroke-width", objLineW);
        obj.append("circle")
                .attr("id", 'circle'+id)
                .style("fill", color)
                .style("stroke", "black")
                .style("stroke-width", "1")
                .attr("r", 6)
                .attr("cx", x)
                .attr("cy", baseY).style("opacity", "0")
        
    }
}

// создание/обновление линии
function updateLine(svg, x1, y1, x2, y2, id, color) {
    color = color ? color : 'black'
    var mid = [(x1+x2)/2, (y1+y2)/2]
    var arrow = d3.select('#arrow')
    if (svg) {
        var lightLine = svg.append('g').attr('id', id)
        arrow.style('fill', color)
        lightLine
            .append('path').attr('id', id + '1')
            .attr('d', d3.line()([[x1, y1], mid]))
            .style('stroke', color)
            .attr('marker-end', 'url(#arrow)')
            .style("stroke-width", strWidth).style('opacity', '1');
        lightLine
            .append('path').attr('id', id + '2')
            .attr('d', d3.line()([mid, [x2, y2]]))
            .style('stroke', color)
            .style("stroke-width", strWidth).style('opacity', '1');
    } else {
        arrow.style('fill', color)
        d3.select('#' + id + '1').attr('d', d3.line()([[x1, y1], mid])).style('stroke', color).attr('marker-end', 'url(#arrow)')
        d3.select('#' + id + '2').attr('d', d3.line()([mid, [x2, y2]])).style('stroke', color)
    }    
}

var markerBoxWidth = 8
var markerBoxHeight = 4
var refX = markerBoxWidth / 2
var refY = markerBoxHeight / 2
var arrowPoints = [ [0, markerBoxHeight], 
                    [markerBoxWidth, markerBoxHeight/2], 
                    [0, 0], [0, markerBoxHeight]];

function updateLineColor(svg, color) {
    color = color ? color : 'black'
    svg.select('defs').remove()
    svg.append('defs')
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
        .style('stroke', color)
        .style('fill', color)
    
}

// создание/обновление дэш линии конечного изображения
function updateDashLine(svg, x1, y1, x2, y2, id, color) {
    if (svg) {
        svg
        .append('path').attr('id', id)
        .attr('d', d3.line()([[x1, y1], [x2, y2]]))
        .style('stroke', color)
        .attr('stroke-dasharray', [5 * strWidth, 5 * strWidth].join(' '))
        .style("stroke-width", 2).style('opacity', '1');
    } else {
        d3.select('#' + id).attr('d', d3.line()([[x1, y1], [x2, y2]])).style('stroke', color)
    }    
}

// создание/обновление иллюстрации объекта
function updateIllustration(svg, height, angle, d, D) {
    if (d3.select('#dataD1ValuePointer')._groups[0][0]) {
        d3.select('#lensSizeText').text(D.toFixed() + ' мм')
        d3.select('#d1Text').text(d.toFixed() + ' мм')
        d3.select('#angleText').text(angle.toFixed() + '°')
    } else {
        var y0 = 60
        var x1 = 30
        var y1 = y0-20
        var x2 = 180
        var lensSize = 40
        lensSize = lensSize+2
        var illArrH = 14
        var illArrW = 6
        var dataMainLine = [{x: 0, y: y0}, {x: 260, y: y0}]

        var dataObj = [{x: x1, y: y0}, {x: x1, y: y1}]
        var dataArrows = [{x: x1-5, y: y1+10}, {x: x1, y: y1}, {x: x1+5, y: y1+10}]

        var dataLens = [{x: x2, y: y0-lensSize}, {x: x2, y: y0+lensSize}]
        var dataLensArrowUp = [{x: x2-illArrW, y: y0-lensSize+illArrH}, {x: x2, y: y0-lensSize}, 
                                {x: x2+illArrW, y: y0-lensSize+illArrH}, {x: x2, y: y0-lensSize+(illArrH/2)},
                                {x: x2-illArrW, y: y0-lensSize+illArrH}]
        var dataLensArrowDown = [{x: x2-illArrW, y: y0+lensSize-illArrH}, {x: x2, y: y0+lensSize}, 
                                 {x: x2+illArrW, y: y0+lensSize-illArrH}, {x: x2, y: y0+lensSize-(illArrH/2)},
                                 {x: x2-illArrW, y: y0+lensSize-illArrH} ]
        lensSize = lensSize-2
        var dataAngleArrowDown = [{x: x1, y: y0}, {x: x2, y: y0+lensSize+5}]
        var dataAngleArrowUp = [{x: x1, y: y0}, {x: x2, y: y0-lensSize-5}]

        var dataD1ValuePointer = [{x: x1, y: y0+50}, {x: x1, y: y0+60},
                                {x: x2, y: y0+60}, {x: x2, y: y0+50} ]
        svg.append('text')
            .attr('id', 'lensSizeText')
            .attr('text-anchor', 'middle')
            .attr("x", 220)
            .attr("y", 55)
            .text(D + ' мм')
        svg.append('text')
            .attr('id', 'd1Text')
            .attr('text-anchor', 'middle')
            .attr("x", 100)
            .attr("y", 143)
            .text(d.toFixed() + ' мм')

        svg.append('text')
            .attr('id', 'angleText')
            .attr('text-anchor', 'middle')
            .attr("x", 155)
            .attr("y", 55)
            .text(angle.toFixed() + '°')

        svg.append("path")
            .attr("d", line(dataD1ValuePointer)).attr("id", 'dataD1ValuePointer')
            .style("stroke", 'black').style("fill", 'none')
            .style("stroke-width", 2);

        var arc = d3.arc()
                    .innerRadius(50)
                    .outerRadius(50);
            
        var sector = svg.append("path")
                    .attr("fill", "none")
                    .attr("stroke-width", 3)
                    .attr("stroke", "darkslategray")
                    .attr("d", arc({startAngle:0, endAngle:(Math.PI/6)}))
        sector.attr('transform', 'translate(68, 60) rotate(60)')
        
        svg.append("path")
        .attr("d", line(dataMainLine))
        .style("stroke", 'black')
        .style("stroke-width", 2);

        svg.append("path")
        .attr("d", line(dataObj))
        .style("stroke", objColor)
        .style("stroke-width", 3);
        svg.append("path")
        .attr("d", line(dataArrows))
        .style("stroke", objColor).style('fill', objColor)
        .style("stroke-width", 3);

        svg.append("path")
        .attr("d", line(dataLens)).attr("id", 'IllustrationLens')
        .style("stroke", lensLineColor).style('fill', lensLineColor)
        .style("stroke-width", 3);
        svg.append("path")
        .attr("d", line(dataLensArrowUp)).attr("id", 'IllustrationLensArrowUp')
        .style("stroke", lensLineColor).style('fill', lensLineColor)
        .style("stroke-width", 3);
        svg.append("path")
        .attr("d", line(dataLensArrowDown)).attr("id", 'IllustrationLensArrowDown')
        .style("stroke", lensLineColor).style('fill', lensLineColor)
        .style("stroke-width", 3);

        svg.append("path")
        .attr("d", line(dataAngleArrowDown)).attr("id", 'AngleArrowDown')
        .style("stroke", 'black')
        .style("stroke-width", 3);
        svg.append("path")
        .attr("d", line(dataAngleArrowUp)).attr("id", 'AngleArrowUp')
        .style("stroke", 'black')
        .style("stroke-width", 3);
    }
}

function yCoordFrom2Points(x1, y1, x2, y2, x) {
    return (((x - x1)*(y2-y1))/(x2-x1))+y1
}

// получение цвета по длине волны
function waveLengthToRgb(wavelength) {
    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }
    function rgbToHex(r, g, b) {
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }

    var gamma = 0.5;
    var intensityMax = 255;

    if ((wavelength >= 380) && (wavelength < 440)) {
        red = -(wavelength - 440) / (440 - 380);
        green = 0.0;
        blue = 1.0;
    } else if ((wavelength >= 440) && (wavelength < 490)) {
        red = 0.0;
        green = (wavelength - 440) / (490 - 440);
        blue = 1.0;
    } else if ((wavelength >= 490) && (wavelength < 510)) {
        red = 0.0;
        green = 1.0;
        blue = -(wavelength - 510) / (510 - 490);
    } else if ((wavelength >= 510) && (wavelength < 580)) {
        red = (wavelength - 510) / (580 - 510);
        green = 1.0;
        blue = 0.0;
    } else if ((wavelength >= 580) && (wavelength < 645)) {
        red = 1.0;
        green = -(wavelength - 645) / (645 - 580);
        blue = 0.0;
    } else if ((wavelength >= 645) && (wavelength < 781)) {
        red = 1.0;
        green = 0.0;
        blue = 0.0;
    } else {
        red = 0.0;
        green = 0.0;
        blue = 0.0;
    };

    // Let the intensity fall off near the vision limits
    if ((wavelength >= 380) && (wavelength < 420)) {
        factor = 0.3 + 0.7 * (wavelength - 380) / (420 - 380);
    } else if ((wavelength >= 420) && (wavelength < 701)) {
        factor = 1.0;
    } else if ((wavelength >= 701) && (wavelength < 781)) {
        factor = 0.3 + 0.7 * (780 - wavelength) / (780 - 700);
    } else {
        factor = 0.0;
    };

    // Don't want 0^x = 1 for x <> 0
    red = ((red == 0.0) ? 0 : Math.round(intensityMax * Math.pow(red * factor, gamma)));
    green = (green == 0.0) ? 0 : Math.round(intensityMax * Math.pow(green * factor, gamma));
    blue = (blue == 0.0) ? 0 : Math.round(intensityMax * Math.pow(blue * factor, gamma));
    var color = rgbToHex(red, green, blue);
    return color;
}