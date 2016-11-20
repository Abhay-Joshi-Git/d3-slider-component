angular.module('app')
  .directive('unitsSlider', [
    function() {
      return {
        restrict: 'E',
        replace: true,
        template: '<div class="slider-container"></div>',
        scope: {
          width: '=',
          height: '=',

          value: '=',
          minValue: '=',
          maxValue: '=',

          onValueChange: '&',

          verticalLineSeparationOptions: '=',

          styleOptions: '='
        },
        link: function(scope, element) {
          element[0].style.height = element.parent()[0].offsetHeight + 'px';
          var values = {
            value: scope.value,
            minValue: scope.minValue,
            maxValue: scope.maxValue
          };
          var slider = Slider({
            container: element[0],
            slideHandler: slideHandler
          });
          function slideHandler (newValue) {
            scope.value = newValue;
            scope.$apply();
            if (typeof scope.onValueChange === 'function') {
              scope.onValueChange({value: newValue});
            }
          }
          slider.draw(values);

          scope.$watch('value', function(changed, oldValue) {
            if (!angular.equals(changed, oldValue)) {
              slider.update({
                value: changed,
                minValue: scope.minValue,
                maxValue: scope.maxValue
              });
            }
          })
        }
      };

      //TODO - vertical lines support
      //TODO - width, height support, change in width & height
      //TODO - style options support
      //TODO - add group for all things which appear and disappear based on drag or no-drag
      //TODO - put a max height for rect and everything actually
      //TODO - add de-bounce ??

      function Slider(config) {
        var min_max_rect_opacity = config.min_max_rect_opacity || 0.5,
          min_max_rect_default_opacity = config.min_max_rect_default_opacity || 0,
          padding_units = config.padding_units || 10, //value to keep some padding between slider min and max movement
          ideal_pixel_units_ratio = config.ideal_pixel_units_ratio || 5,
          slider_image_height = config.slider_image_height ||10,
          slider_image_width = config.slider_image_width || 15,
          slider_image_inside_rect_percentage = config.slider_image_inside_rect_percentage || 30,
          rect_height_percentage = config.rect_height_percentage || '60',
          rect_color = config.rect_color || 'pink',
          min_max_rect_color = config.min_max_rect_color || 'grey',
          slider_image_path = config.slider_image_path || "images/slider-pin-1.png";

        var svg, rect, rect_top,
          drag, dragPin,
          maxRect, minRect, minBracket, maxBracket,
          actualPixelUnitsRatio, pixelUnitsRatio, unitsRange,
          value, minValue, maxValue;

        var rect_top_svg_height_ratio = (100 - rect_height_percentage) / 2 / 100;

        var container = d3.select(config.container);
        container.select('svg').remove();
        svg = container.append('svg')
          .attr('height', '100%')
          .attr('width', '100%');

        rect_top = parseInt(svg.style('height'), 10) * rect_top_svg_height_ratio;

        function calValues(values) {
          value = values.value || 0;
          minValue = values.minValue || 0;
          maxValue = values.maxValue || 0;

          unitsRange = maxValue - minValue + padding_units;
          actualPixelUnitsRatio = parseInt(svg.style('width'), 10) / unitsRange;
          pixelUnitsRatio = (actualPixelUnitsRatio > ideal_pixel_units_ratio) ?
            ideal_pixel_units_ratio: actualPixelUnitsRatio;
        }

        function draw(values) {
          calValues(values);
          doDraw();
        }

        function doDraw() {
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
          //move rectangles accordingly
          updateRect();
          updateSliderPin();
        }

        //this will be called when dimensions are changed
        function refresh(options) {

        }

        function appendRect() {
          svg.select('.actual-rect').remove();
          return svg.append('rect')
            .attr('class', 'actual-rect')
            .attr("x", 0)
            .attr("y", rect_top)
            .attr("height", rect_height_percentage + '%')
            .attr("width", value * pixelUnitsRatio)
            .style('fill', rect_color);
        }

        function updateRect() {
          svg.select('.actual-rect')
            .attr('width', value * pixelUnitsRatio);
        }

        function appendSliderPin() {
          var y = parseInt(svg.style('height'), 10) / 2 - (slider_image_height / 2);
          svg.select('.slider-pin-image').remove();
          return svg.append("svg:image")
            .attr('class', 'slider-pin-image')
            .attr('x', value * pixelUnitsRatio - (slider_image_width * slider_image_inside_rect_percentage / 100))
            .attr('y', y)
            .attr('width', slider_image_width)
            .attr('height', slider_image_height)
            .attr("xlink:href", slider_image_path);
        }

        function updateSliderPin() {
          svg.select('.slider-pin-image')
            .attr('x', value * pixelUnitsRatio - (slider_image_width * slider_image_inside_rect_percentage / 100))
        }

        function appendMinRect() {
          svg.select('.min-rect').remove();
          return svg.append('rect')
            .attr('class', 'min-rect')
            .attr("x", 0)
            .attr("y", rect_top)
            .attr("height", rect_height_percentage + '%')
            .attr("width", (minValue < padding_units / 2 ? padding_units / 2 : minValue) * pixelUnitsRatio)
            .style('fill', min_max_rect_color)
            .style('opacity', min_max_rect_default_opacity)
        }

        function appendMaxRect() {
          svg.select('.max-rect').remove();
          return svg.append('rect')
            .attr('class', 'max-rect')
            .attr("x",  maxValue * pixelUnitsRatio)
            .attr("y", rect_top)
            .attr("height", rect_height_percentage + '%')
            .attr("width", '100%')
            .style('fill', min_max_rect_color)
            .style('opacity', min_max_rect_default_opacity)
        }

        function appendMinBracket() {
          svg.select('.min-bracket-text').remove();
          return svg.append('text')
            .attr('class', 'min-bracket-text')
            .attr("x", (minValue < padding_units / 2 ? padding_units / 2 : minValue) * pixelUnitsRatio)
            .attr("y", parseInt(svg.style('height'), 10) / 2)
            .text("[")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .style('opacity', min_max_rect_default_opacity)
            .style('font-size', parseInt(svg.style('height'), 10) * 0.85)
        }

        function appendMaxBracket() {
          svg.select('.max-bracket-text').remove();
          return svg.append('text')
            .attr('class', 'max-bracket-text')
            .attr("x", maxValue * pixelUnitsRatio)
            .attr("y", parseInt(svg.style('height'), 10) / 2)
            .text("]")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .style('opacity', min_max_rect_default_opacity)
            .style('font-size', parseInt(svg.style('height'), 10) * 0.85)
        }

        function dragHandler () {
          var newX = +dragPin.attr('x') + d3.event.dx;
          var slider_image_inside_rect = (slider_image_width * slider_image_inside_rect_percentage / 100);

          if ((newX > (maxValue * pixelUnitsRatio - slider_image_inside_rect) ) ||
            newX < ((minValue < padding_units / 2 ? padding_units / 2 : minValue) * pixelUnitsRatio - padding_units / 2)) {
            return;
          }

          dragPin.attr('x', newX);
          rect.attr('width', newX + (slider_image_width * slider_image_inside_rect_percentage / 100));
          if (typeof config.slideHandler === 'function') {
            config.slideHandler(getCurrentValue());
          }
        }

        function getCurrentValue() {
          return rect.attr('width') / pixelUnitsRatio
        }

        function dragStartHandler() {
          showMinMaxRect();
        }

        function dragEndHandler() {
          hideMinMaxRect();
        }

        function showMinMaxRect() {
          minRect.style('opacity', min_max_rect_opacity);
          maxRect.style('opacity', min_max_rect_opacity);
          minBracket.style('opacity', 0.4);
          maxBracket.style('opacity', 0.4);
        }

        function hideMinMaxRect() {
          minRect.style('opacity', min_max_rect_default_opacity);
          maxRect.style('opacity', min_max_rect_default_opacity);
          minBracket.style('opacity', min_max_rect_default_opacity);
          maxBracket.style('opacity', min_max_rect_default_opacity);
        }

        drag = d3.behavior.drag()
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