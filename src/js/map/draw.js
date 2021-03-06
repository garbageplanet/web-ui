/* jslint browser: true, white: true, sloppy: true, maxerr: 1000 */
/* global L, $, tools, alerts, api, ui, maps */

/**
  * All code related to drawing shapes
  */

var drawing = ( function () {

    'use strict';

    var draw_control;

    function _bindEvents (type) {

        var draw_button = $('.btn-draw');

        // Disable regular map click and load drawing listeners
        draw_button.on('click', function(e) {

            maps.map.off('click', actions.mapClick);

            type === 'polyline'? _bindPolylineEvents() : _bindPolygonEvents();

        });

        // Disable start drawing buttons
        maps.map.on('draw:drawstart', function (e) {
            draw_button.addClass('disabled');
        });

        // Reactivate map clik listeners once drawing is done
        maps.map.on('draw:drawstop', function () {
            maps.map.off('click', actions.mapClick);
            maps.map.on('click', actions.mapClick);
        });

        // What to do once a shape is created
        maps.map.on('draw:created', function (e) {

            var latlngs = e.layer.getLatLngs().toString().replace(/\(/g, '[').replace(/\)/g, ']').replace(/LatLng/g, '');

            // Add the latlngs to the form
            document.querySelector('.latlngs').value = latlngs;
            // $('.latlngs').val(latlngs);

            maps.map.fitBounds(e.layer.getBounds(), {paddingBottomRight: [300,0]});

            maps.map.addLayer(e.layer);

            // Reactivate default marker event listener and drawing button
            maps.map.on('click', actions.mapClick);

            // Delete the feature on cancel button
            document.querySelector('.btn-cancel').addEventListener('click', function () {
                maps.map.removeLayer(e.layer);
            });

            ui.sidebar.on('hide', function() {
                maps.map.removeLayer(e.layer);
            });
        });
    }

    function _bindPolygonEvents () {

      var polygon_listener = new L.Draw.Polygon(maps.map, {
             shapeOptions:{
                color: '#33cccc',
                weight: 5,
                opacity: 0.5},
            showArea: true,
            metric: true,
            clickable: true,
            allowIntersection: false,
                   drawError:{
                   color: '#cc0000',
                   timeout: 2000}
      });

      polygon_listener.enable();

      document.querySelector('.btn-cancel').addEventListener('click', function () {

          polygon_listener.disable();
      });
    }

    function _bindPolylineEvents () {

        var polyline_listener = new L.Draw.Polyline(maps.map, {
            allowIntersection: false,
               drawError: {
               color: '#cc0000',
               timeout: 2000
               },
            metric: true,
            clickable: true,
            shapeOptions: {
              color: '#A9A9A9',
              weight: 10,
              opacity: 0.5
            }
        });

        polyline_listener.enable();

        maps.map.on('draw:created', function (e) {

          // var radio_input = document.queryselectorAll('input[type=radio]');
          // Range slider for amount of garbage on polyline
          $('input[type=radio]').on('change', function () {
              // Get the color value from the select options
              var selected_value = parseInt($(this).attr('value'), 10);
             // Set the color of the line
              e.layer.setStyle({color: tools.setPolylineColor(selected_value)});
          });

          document.getElementById('litter-physical-length').value = polyline_listener._getMeasurementString();

        });

        document.querySelector('.btn-cancel').addEventListener('click', function () {

            polyline_listener.disable();
        });
    }

    function init (type) {

          // drawing apabilities are only called when the forms are loaded in /js/forms.js
          tools.getScript('https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/0.4.13/leaflet.draw.js')

              .then(function() {

                console.log('Got draw.js');

                draw_control = new L.Control.Draw({
                    position: 'topright',
                    draw: {
                        circle: false,
                        rectangle: false,
                        marker: false,
                        circlemarker: false
                    }
                });

                maps.map.addControl(draw_control);
                _bindEvents(type);
              })

              .catch( function(err) {

                console.log(err);
                return false;

              });
      }

    return { init : init }
}());
