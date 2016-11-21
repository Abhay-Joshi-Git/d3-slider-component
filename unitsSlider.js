angular.module('app')
  .directive('unitsSlider', [
    function() {
      return {
        restrict: 'E',
        replace: true,
        template: '<div class="slider-container"></div>',
        scope: {
          value: '=',
          minValue: '=',
          maxValue: '=',
          onValueChange: '&',
          containerStyleOptions: '=',
          verticalLineOptions: '=',
          sliderImageOptions: '=',
          rectStyleOptions: '=',
          maxPixelUnitsRatio: '='
        },
        link: function(scope, element, attr) {
          applyContainerStyle(scope, element);
          var slider = Slider(getSliderConfig());

          slider.draw({
            value: scope.value,
            minValue: scope.minValue,
            maxValue: scope.maxValue
          });

          scope.$watchGroup(['value', 'minValue', 'maxValue'], function(newValue, oldValue) {
            if (!angular.equals(newValue, oldValue)) {
              slider.update({
                value: scope.value,
                minValue: scope.minValue,
                maxValue: scope.maxValue
              });
            }
          });

          scope.$watch('containerStyleOptions', function(newValue, oldValue) {
            if (!angular.equals(newValue, oldValue)) {
              applyContainerStyle(scope, element);
              refreshSlider();
            }
          });

          scope.$watchGroup(['verticalLineOptions', 'sliderImageOptions', 'rectStyleOptions'], function(newVal, oldVal) {
            if (!angular.equals(newVal, oldVal)) {
              refreshSlider();
            }
          });

          function slideHandler (newValue) {
            scope.$evalAsync(function() {
              scope.value = newValue
            });
            if (typeof scope.onValueChange === 'function') {
              scope.onValueChange({value: newValue});
            }
          }

          function refreshSlider() {
            slider.refresh(getSliderConfig(), {
              value: scope.value,
              minValue: scope.minValue,
              maxValue: scope.maxValue
            });
          }

          function getSliderConfig() {
            return {
              container: element[0],
              slideHandler: slideHandler,
              verticalLineOptions: scope.verticalLineOptions,
              sliderImageOptions: scope.sliderImageOptions,
              rectStyleOptions: scope.rectStyleOptions,
              maxPixelUnitsRatio: scope.maxPixelUnitsRatio
            }
          }
        }
      };

      function applyContainerStyle(scope, element) {
        var ele = element[0];
        ele.style.height = element.parent()[0].offsetHeight + 'px';
        ele.style.width = '100%';
        if (scope.containerStyleOptions) {
          if (scope.containerStyleOptions.height) {
            ele.style.height = scope.containerStyleOptions.height;
          }
          if (scope.containerStyleOptions.width) {
            ele.style.width = scope.containerStyleOptions.width;
          }
          if (scope.containerStyleOptions.padding) {
            ele.style.padding = scope.containerStyleOptions.padding;
          }
          if (scope.containerStyleOptions.margin) {
            ele.style.margin = scope.containerStyleOptions.margin;
          }
        }
      }

      //TODO - add group for all things which appear and disappear based on drag or no-drag
      //TODO - put a max height for rect and everything actually

      function Slider(config) {
        var svg, rect, rect_top,
          drag, dragPin,
          maxRect, minRect, minBracket, maxBracket,
          rect_top_svg_height_ratio,
          actualPixelUnitsRatio, pixelUnitsRatio, unitsRange,
          value, minValue, maxValue,
          paddingUnits, maxPixelUnitsRatio, totalWidth, totalHeight,
          minMaxRectVisibleOpacity, minMaxRectDefaultOpacity, rectHeightPercentage,
          rectColor, minMaxRectColor,
          sliderImageHeight, sliderImageWidth, sliderImageRectPercentage, sliderImagePath,
          verticalLinesColor, verticalLinesSeparation,
          container;

        function serRectProps(config) {
          minMaxRectVisibleOpacity = 0.5;
          minMaxRectDefaultOpacity = 0;
          rectHeightPercentage = '60';
          rectColor = 'pink';
          minMaxRectColor = 'grey';
          if (config.rectStyleOptions) {
            if (config.rectStyleOptions.minMaxRectVisibleOpacity) {
              minMaxRectVisibleOpacity = config.rectStyleOptions.minMaxRectVisibleOpacity;
            }
            if (config.rectStyleOptions.minMaxRectDefaultOpacity) {
              minMaxRectDefaultOpacity = config.rectStyleOptions.minMaxRectDefaultOpacity;
            }
            if (config.rectStyleOptions.rectHeightPercentage) {
              rectHeightPercentage = config.rectStyleOptions.rectHeightPercentage;
            }
            if (config.rectStyleOptions.rectColor) {
              rectColor = config.rectStyleOptions.rectColor;
            }
            if (config.rectStyleOptions.minMaxRectColor) {
              minMaxRectColor = config.rectStyleOptions.minMaxRectColor;
            }
          }
        }
        function setSliderImageProps(config) {
          sliderImageHeight = 10;
          sliderImageWidth = 15;
          sliderImageRectPercentage = 30;
          sliderImagePath = "images/slider-pin.png";
          if (config.sliderImageOptions) {
            if (config.sliderImageOptions.sliderImageHeight) {
              sliderImageHeight = config.sliderImageOptions.sliderImageHeight;
            }
            if (config.sliderImageOptions.sliderImageWidth) {
              sliderImageWidth = config.sliderImageOptions.sliderImageWidth;
            }
            if (config.sliderImageOptions.sliderImageRectPercentage) {
              sliderImageRectPercentage = config.sliderImageOptions.sliderImageRectPercentage;
            }
            if (config.sliderImageOptions.sliderImagePath) {
              sliderImagePath = config.sliderImageOptions.sliderImagePath;
            }
          }
        }
        function serVerticalLineProps(config) {
          verticalLinesColor = 'pink';
          verticalLinesSeparation = 10;
          if (config.verticalLineOptions) {
            if (config.verticalLineOptions.verticalLinesColor) {
              verticalLinesColor = config.verticalLineOptions.verticalLinesColor;
            }
            if (config.verticalLineOptions.verticalLinesSeparation) {
              verticalLinesSeparation = config.verticalLineOptions.verticalLinesSeparation;
            }
          }
        }
        function setProps(config) {
          paddingUnits = config.paddingUnits || 10; //value to keep some padding between slider min and max movement
          maxPixelUnitsRatio = config.maxPixelUnitsRatio || 5;
          totalWidth = config.width || '100%';
          totalHeight = config.height || '100%';
          serRectProps(config);
          serVerticalLineProps(config);
          setSliderImageProps(config);
          rect_top_svg_height_ratio = (100 - rectHeightPercentage) / 2 / 100;
          container = d3.select(config.container);
          container.select('svg').remove();
          svg = container.append('svg')
            .attr('height', totalHeight)
            .attr('width', totalWidth);

          //svg dependent props
          rect_top = parseInt(svg.style('height'), 10) * rect_top_svg_height_ratio;
        }

        setProps(config);

        function calValues(values) {
          value = values.value || 0;
          minValue = values.minValue || 0;
          maxValue = values.maxValue || 0;

          unitsRange = maxValue - minValue + paddingUnits;
          actualPixelUnitsRatio = parseInt(svg.style('width'), 10) / unitsRange;
          pixelUnitsRatio = (actualPixelUnitsRatio > maxPixelUnitsRatio) ?
            maxPixelUnitsRatio: actualPixelUnitsRatio;
        }

        function draw(values) {
          calValues(values);
          doDraw();
        }

        function doDraw() {
          appendVerticalLines();
          rect = appendRect();
          minRect = appendMinRect();
          maxRect = appendMaxRect();
          dragPin = appendSliderPin();
          minBracket = appendMinBracket();
          maxBracket = appendMaxBracket();
          dragPin.call(drag);
        }

        function update(values) {
          value = values.value;
          minValue = values.minValue;
          maxValue = values.maxValue;

          //move rectangles accordingly
          updateRect();
          updateSliderPin();
        }

        //this will be called when dimensions or styles are changed
        function refresh(config, values) {
          setProps(config);
          draw(values);
        }

        function getRectWidth() {
          return (paddingUnits / 2 + (value - minValue)) * pixelUnitsRatio;
        }

        function getMaxRectWidth() {
          return (paddingUnits / 2 + (maxValue - minValue)) * pixelUnitsRatio;
        }

        function appendRect() {
          svg.select('.actual-rect').remove();
          return svg.append('rect')
            .attr('class', 'actual-rect')
            .attr("x", 0)
            .attr("y", rect_top)
            .attr("height", rectHeightPercentage + '%')
            .attr("width", getRectWidth())
            .style('fill', rectColor);
        }

        function updateRect() {
          svg.select('.actual-rect')
            .attr('width', getRectWidth());
        }

        function appendSliderPin() {
          var y = parseInt(svg.style('height'), 10) / 2 - (sliderImageHeight / 2);
          svg.select('.slider-pin-image').remove();
          return svg.append("svg:image")
            .attr('class', 'slider-pin-image')
            .attr('x', getRectWidth() - (sliderImageWidth * sliderImageRectPercentage / 100))
            .attr('y', y)
            .attr('width', sliderImageWidth)
            .attr('height', sliderImageHeight)
            .attr("xlink:href", sliderImagePath);
        }

        function updateSliderPin() {
          svg.select('.slider-pin-image')
            .attr('x', getRectWidth() - (sliderImageWidth * sliderImageRectPercentage / 100))
        }

        function appendMinRect() {
          svg.select('.min-rect').remove();
          return svg.append('rect')
            .attr('class', 'min-rect')
            .attr("x", 0)
            .attr("y", rect_top)
            .attr("height", rectHeightPercentage + '%')
            .attr("width", (paddingUnits / 2) * pixelUnitsRatio)
            .style('fill', minMaxRectColor)
            .style('opacity', minMaxRectDefaultOpacity)
        }

        function appendMaxRect() {
          svg.select('.max-rect').remove();
          return svg.append('rect')
            .attr('class', 'max-rect')
            .attr("x",  getMaxRectWidth())
            .attr("y", rect_top)
            .attr("height", rectHeightPercentage + '%')
            .attr("width", '100%')
            .style('fill', minMaxRectColor)
            .style('opacity', minMaxRectDefaultOpacity)
        }

        function appendMinBracket() {
          svg.select('.min-bracket-text').remove();
          return svg.append('text')
            .attr('class', 'min-bracket-text')
            .attr("x", (paddingUnits / 2) * pixelUnitsRatio)
            .attr("y", parseInt(svg.style('height'), 10) / 2)
            .text("[")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .style('opacity', minMaxRectDefaultOpacity)
            .style('font-size', parseInt(svg.style('height'), 10) * 0.85)
        }

        function appendMaxBracket() {
          svg.select('.max-bracket-text').remove();
          return svg.append('text')
            .attr('class', 'max-bracket-text')
            .attr("x", getMaxRectWidth())
            .attr("y", parseInt(svg.style('height'), 10) / 2)
            .text("]")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .style('opacity', minMaxRectDefaultOpacity)
            .style('font-size', parseInt(svg.style('height'), 10) * 0.85)
        }

        function dragHandler () {
          var slider_image_inside_rect = (sliderImageWidth * sliderImageRectPercentage / 100);
          var newX = +dragPin.attr('x') + d3.event.dx;
          newX = Number(newX.toFixed(2));

          if ((newX > (getMaxRectWidth() - slider_image_inside_rect) ) ||
            newX < ((paddingUnits / 2) * pixelUnitsRatio - slider_image_inside_rect)) {
            return;
          }

          dragPin.attr('x', newX);
          rect.attr('width', newX + slider_image_inside_rect);

          var newValue = getCurrentValue();
          newValue = Math.round(newValue); //Number(newValue.toFixed(2));

          if (typeof config.slideHandler === 'function') {
            config.slideHandler(newValue);
          }
        }

        function getCurrentValue() {
          return (rect.attr('width') / pixelUnitsRatio - paddingUnits / 2) + minValue;
        }

        function dragStartHandler() {
          showMinMaxRect();
        }

        function dragEndHandler() {
          hideMinMaxRect();
        }

        function showMinMaxRect() {
          minRect.style('opacity', minMaxRectVisibleOpacity);
          maxRect.style('opacity', minMaxRectVisibleOpacity);
          minBracket.style('opacity', 0.4);
          maxBracket.style('opacity', 0.4);
        }

        function hideMinMaxRect() {
          minRect.style('opacity', minMaxRectDefaultOpacity);
          maxRect.style('opacity', minMaxRectDefaultOpacity);
          minBracket.style('opacity', minMaxRectDefaultOpacity);
          maxBracket.style('opacity', minMaxRectDefaultOpacity);
        }

        function appendVerticalLines() {
          svg.select('.lines').remove();
          var lines = svg.append('g')
            .attr('class', 'lines');
          var width = parseInt(svg.style('width'), 10);
          var height = parseInt(svg.style('height'), 10);
          var currentPos = 0;
          while (currentPos < width) {
            lines.append("line")
              .attr("x1", currentPos)
              .attr("x2", currentPos)
              .attr("y1", 0)
              .attr("y2", height)
              .style("stroke-dasharray", "4,4")//dashed array for line
              .style("stroke", verticalLinesColor)
            currentPos += verticalLinesSeparation;
          }
          return lines;
        }

        drag = d3.behavior.drag()
          .origin(Object)
          .on('drag', dragHandler)
          .on('dragstart', dragStartHandler)
          .on('dragend', dragEndHandler);

        return {
          draw: draw,
          refresh: refresh,
          update: update
        }
      }
    }
  ]);