//Imports
import { Component, OnInit, Self } from "@angular/core";
import { DataService } from "./data.service";

import proj4 from "proj4";
declare global {
  interface Window {
    proj4: any;
  }
}
window.proj4 = proj4;

import * as Highcharts from "highcharts";
import MapModule from "highcharts/modules/map";
import ExportingModule from "highcharts/modules/exporting";

//Variables for button logic
let previousPointMarkerURL;
let previousPoint;

MapModule(Highcharts);
ExportingModule(Highcharts);

declare let require: any;
Highcharts.SVGRenderer.prototype.symbols.markerBalloon = function (x, y, w, h) {
  h = w * 1.3333;
  let px = w / 24.8;
  let py = h / 33.066;

  y = y - w / 1.5;

  return [
    "M",
    x + 11.12547 * px,
    y + 32.39903 * py,
    "C",
    x + 1.74179 * px,
    y + 18.79547 * py,
    x + 0 * px,
    y + 17.39933 * py,
    x + 0 * px,
    y + 12.39982 * py,
    x + 0 * px,
    y + 5.55157 * py,
    x + 5.55156 * px,
    y + 0 * py,
    x + 12.39981 * px,
    y + 0 * py,
    "c",
    6.84825 * px,
    0 * py,
    12.39981 * px,
    5.55157 * py,
    12.39981 * px,
    12.39982 * py,
    0 * px,
    4.99951 * py,
    -1.74179 * px,
    6.39565 * py,
    -11.12547 * px,
    19.99921 * py,
    -0.61579 * px,
    0.88956 * py,
    -1.93295 * px,
    0.88949 * py,
    -2.54868 * px,
    0 * py,
    "z",
    "M",
    x + 12.39981 * px,
    y + 17.5664 * py,
    "c",
    2.85344 * px,
    0 * py,
    5.16659 * px,
    -2.31314 * py,
    5.16659 * px,
    -5.16658 * py,
    0 * px,
    -2.85344 * py,
    -2.31315 * px,
    -5.16659 * py,
    -5.16659 * px,
    -5.16659 * py,
    -2.85344 * px,
    0 * py,
    -5.16659 * px,
    2.31315 * py,
    -5.16659 * px,
    5.16659 * py,
    0 * px,
    2.85344 * py,
    2.31315 * px,
    5.16658 * py,
    5.16659 * px,
    5.16658 * py,
    "z",
  ];
};

//Dropping Markers according to the Metric (Risk Score/Adjusted Value Risk)
function dropMarkers(data, metric = "riskValue") {
  for (let i = 0; i < data.length; i++) {
    let rating = data[i][metric];
    let color = "#333";
    if (metric == "riskValue") {
      //Rag Scheme for 10 values
      switch (rating) {
        case 1:
          color = "#16bf22";
          break;
        case 2:
          color = "#21db2e";
          break;
        case 3:
          color = "#5ef269";
          break;
        case 4:
          color = "#ccf56c";
          break;
        case 5:
          color = "#d0db1b";
          break;
        case 6:
          color = "#f2f227";
          break;
        case 7:
          color = "#f0d524";
          break;
        case 8:
          color = "#f5d60a";
          break;
        case 9:
          color = "#f5c827";
          break;
        case 10:
          color = "#fcad00";
          break;
      }
    } else if (metric == "adjustedValue") {
      //Rag Scheme for max and min value
      if (rating > 0) color = "#ff0000";
      else color = "#00ff00";
    }
    let marker = {
      symbol: "markerBalloon",
      fillColor: color,
      lineColor: "#888",
      lineWidth: 1.5,
      radius: 12,
    };
    data[i]["marker"] = marker;
  }
}

//Data initialization
let data = [];

let mapColor = "rgba(255, 255, 255, 1)";
let mapTitleColor = "#345eeb";
let mapSubtitleColor = "#345eeb";
let statesNameEnabled = false;

//Selecting location
//let map = require("@highcharts/map-collection/countries/us/us-all-all.geo.json");
let map = require("../assets/cbsa-custom.geo.json");
//let map = require("@highcharts/map-collection/countries/us/us-all.geo.json");

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit {
  title = "app";
  chart;
  updateFlag = false;
  chartCallback;
  chartConstructor = "chart";
  Highcharts: typeof Highcharts = Highcharts;
  //Setting up the map
  chartMap: Highcharts.Options;

  constructor(private dataService: DataService) {
    const self = this;
    this.chartCallback = (chart) => {
      self.chart = chart;
    };
  }

  ngOnInit() {
    this.getAndSetData();
  }

  getAndSetData(): void {
    this.dataService.getData().subscribe((jsonData) => {
      data = jsonData;
      for (let i = 0; i < data.length; i++) {
        data[i]["lat"] = data[i]["propertyLatitude"];
        delete data[i]["propertyLatitude"];
        data[i]["lon"] = data[i]["propertyLongitude"];
        delete data[i]["propertyLongitude"];
      }
      dropMarkers(data);

      this.chartMap = {
        chart: {
          map: map,
          backgroundColor: "#f7f9f9",
          events: {
            load: function () {
              const chart = this;
              chart.series[2].setData(data);
            },
          },
        },
        xAxis: {
          minRange: 5,
        },
        yAxis: {
          minRange: 5,
        },
        title: {
          text: "State",
          style: {
            color: mapTitleColor,
          },
        },
        subtitle: {
          text: "Risk Score",
          style: {
            color: mapSubtitleColor,
          },
        },
        mapNavigation: {
          enabled: true,
          enableMouseWheelZoom: false,
          enableTouchZoom: false,
          buttonOptions: {
            alignTo: "spacingBox",
          },
          //Zoom In/Out Buttons
          buttons: {
            zoomOut: {
              y: 0,
              x: 28,
            },
          },
        },
        //Bottom right legend properties
        legend: {
          layout: "horizontal",
          borderWidth: 0,
          backgroundColor: "rgba(255,255,255,0.85)",
          floating: true,
          verticalAlign: "bottom",
          align: "right",
          y: 0,
          itemMarginBottom: 10,
          itemMarginTop: 10,
          title: {
            text: "Risk Score",
          },
        },
        //Setting up the axis on legend
        colorAxis: [
          {
            min: 1,
            max: 10,
            maxColor: "#fcad00",
            minColor: "#16bf22",
          },
        ],

        plotOptions: {
          series: {
            // Some marker properties
            stickyTracking: false,
            allowPointSelect: true,
            // cursor: 'pointer',
            //point: {
            // events: {
            //   // //On click event for markers
            //   click: function (e) {
            //     console.log(this.series);
            //     this.series.chart.update({
            //       tooltip: {
            //         enabled: true,
            //       },
            //     });
            //   },
            //   if (previousPoint) {
            //     previousPointMarkerURL = previousPointMarkerURL.replace(
            //       "-s.svg",
            //       ".svg"
            //     );
            //     previousPoint.update({
            //       marker: {
            //         symbol: previousPointMarkerURL,
            //       },
            //     });
            //   }
            //   previousPointMarkerURL =
            //     e.point.series.data[e.point.index]["marker"]["symbol"];
            //   previousPoint = this;
            //   let currentPointMarkerURL =
            //     e.point.series.data[e.point.index]["marker"]["symbol"];
            //   // currentPointMarkerURL = currentPointMarkerURL.replace(
            //   //   "d_map_pin_letter",
            //   //   "d_map_pin_icon"
            //   // );
            //   currentPointMarkerURL = currentPointMarkerURL.replace(
            //     ".svg",
            //     "-s.svg"
            //   );
            //   this.update({
            //     marker: {
            //       symbol: currentPointMarkerURL,
            //     },
            //   });
            // },
            //   mouseOut: function () {
            //     this.series.chart.update({
            //       tooltip: {
            //         enabled: false,
            //       },
            //     });
            //   },
            // },
            //},
          },
        },

        //setting up tooltip properties
        tooltip: {
          enabled: false,
          snap: 0,
          headerFormat: "",
          followPointer: false,
          hideDelay: 1000,
          pointFormat:
            "<b>{point.propertyName}</b><br>Address: {point.propertyAddress}, {point.propertyCity}, {point.propertyState}<br>Zip Code: {point.propertyZipCode}<br>Lat: {point.lat}, Lon: {point.lon}<br>Risk Score: {point.riskValue}<br>Adjusted Risk Value: {point.adjustedValue}",
        },
        credits: {
          enabled: false,
        },
        series: [
          //Seies 1: Map Borders (State/CBSA)
          {
            name: "Basemap",
            borderColor: "#ffffff",
            nullColor: mapColor,
            showInLegend: false,
            type: undefined,
            dataLabels: {
              enabled: statesNameEnabled,
              format: "{point.name}",
            },
          },
          {
            //Series 2: Separators
            name: "Separators",
            type: "mapline",
            nullColor: "#888",
            showInLegend: false,
            enableMouseTracking: false,
            allowPointSelect: true,
          },
          {
            //Seties 3: Map Markers

            type: "mappoint",
            events: {
              mouseOver: function (e) {
                this.chart.tooltip.update({
                  enabled: false,
                });
              },
              click: function (e) {
                this.chart.tooltip.update({
                  enabled: true,
                });
                this.chart.tooltip.refresh(e.point);
              },
              mouseOut: function () {
                this.chart.tooltip.hide();
              },
            },
            colorAxis: 0,
            allowPointSelect: true,
            name: "Properties",
            cursor: "pointer",
            marker: {
              states: {
                select: {
                  lineColor: "#1144ff",
                  lineWidth: 3,
                  fillColor: undefined,
                },
                hover: {
                  radiusPlus: undefined,
                },
              },
            },
          },
        ],
      };
    });
  }

  stateSelected = true;
  cbsaSelected = false;

  updateBorders(event) {
    // document.getElementById("state").classList.remove("clickedButton");
    // document.getElementById("cbsa").classList.remove("clickedButton");
    // document
    //   .getElementById(event.target.attributes.id.nodeValue)
    //   .classList.toggle("clickedButton");
    if (event.target.className.search("clickedButton") == -1) {
      this.stateSelected = !this.stateSelected;
      this.cbsaSelected = !this.cbsaSelected;
    }

    let borderColor = "#FFFFFF";
    let mapTitle = "State";
    if (event.target.attributes.id.nodeValue == "cbsa") {
      borderColor = "#888";
      mapTitle = "CBSA";
    }

    const self = this,
      chart = this.chart;
    this.chartMap.series[0] = {
      name: "Basemap",
      borderColor: borderColor,
      nullColor: mapColor,
      showInLegend: false,
      type: undefined,
      dataLabels: {
        enabled: statesNameEnabled,
        format: "{point.name}",
      },
    };
    self.chartMap.title.text = mapTitle;
    self.updateFlag = true;
  }

  updateMetric(currentButton) {
    previousPoint = null;
    var metric = "riskValue";
    var mapTitle = "Risk Score";
    var minVal = 1;
    var maxVal = 10;
    var minColor = "#16bf22";
    var maxColor = "#fcad00";
    if (currentButton == "adjustedValue") {
      metric = "adjustedValue";
      mapTitle = "Adjusted Risk Value";
      minVal = -30;
      maxVal = 40;
      minColor = "#ff0000";
      maxColor = "#00ff00";
    }

    dropMarkers(data, currentButton);
    this.chartMap.series[2] = {
      type: "mappoint",
      colorAxis: 0,
      allowPointSelect: true,
      name: "Properties",
      data: data,
    };
    this.chartMap.legend.title.text = mapTitle;
    this.chartMap.colorAxis[0].min = minVal;
    this.chartMap.colorAxis[0].max = maxVal;
    this.chartMap.colorAxis[0].maxColor = maxColor;
    this.chartMap.colorAxis[0].minColor = minColor;
    this.chartMap.subtitle.text = mapTitle;
    this.updateFlag = true;
  }
}
