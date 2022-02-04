/* global regeneratorRuntime */

import './App.css';

function App() {
  // const cssString = ".chosen { width: 65rem; height: 14rem; border-collapse: collapse; } thead { background-color: black; color: white; } .border-black { border: 1px solid black; } th.width { width: 20vw; } .left { text-align: left; } .centered { text-align: center; } .mt-1 { margin-top: 1rem; }"

  "use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var cssString = "\n    table {\n      width: 100%;\n      height: 100%;\n      border-collapse: collapse;\n    }\n\n    thead {\n      background-color: black;\n      color: white;\n    }\n\n    .border-black {\n      border: 1px solid black;\n    }\n\n    th.width {\n      width: 20vw;\n    }\n\n    .left {\n      text-align: left;\n    }\n\n    .centered {\n      text-align: center;\n    }\n\n    .mt-1 {\n      margin-top: 1rem;\n    }\n  ";

var createSvg = function createSvg(table) {
  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  var computedStyle = window.getComputedStyle(table);
  var height = parseFloat(computedStyle.height) + 30;
  svg.setAttribute("width", computedStyle.width);
  svg.setAttribute("height", "".concat(height, "px"));
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  var style = document.createElement("style");
  style.innerHTML = cssString;
  svg.appendChild(style);
  var foreignObject = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
  foreignObject.setAttribute("width", "100%");
  foreignObject.setAttribute("height", "100%");
  var div = document.createElementNS("http://www.w3.org/1999/xhtml", "div");
  div.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
  div.appendChild(table);
  foreignObject.appendChild(div);
  svg.appendChild(foreignObject);
  return svg;
};

var blobToBase64 = function blobToBase64(blob) {
  return new Promise(function (resolve, _) {
    var reader = new FileReader();

    reader.onloadend = function () {
      return resolve(reader.result);
    };

    reader.readAsDataURL(blob);
  });
};

var drawCanvas = function drawCanvas(svg) {
  var canvas = document.createElement("canvas");

  var _window$getComputedSt = window.getComputedStyle(svg),
      width = _window$getComputedSt.width,
      height = _window$getComputedSt.height;

  canvas.setAttribute("width", width);
  canvas.setAttribute("height", height);
  return canvas;
};

var clickHandler = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
    var tables, images, ims, response, data, buff, blob, objectUrl;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            tables = Array.from(document.querySelectorAll(".row"));
            images = tables.map( /*#__PURE__*/function () {
              var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(table) {
                var svg, data, base64Data, tempImg, canvas, ctx, targetImg;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        svg = createSvg(table);
                        document.body.appendChild(svg);
                        data = new Blob([svg.outerHTML], {
                          type: "image/svg+xml"
                        });
                        _context.next = 5;
                        return blobToBase64(data);

                      case 5:
                        base64Data = _context.sent;
                        tempImg = new Image();
                        tempImg.src = base64Data;
                        canvas = drawCanvas(svg);
                        ctx = canvas.getContext("2d");
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        _context.next = 13;
                        return new Promise(function (resolve) {
                          tempImg.addEventListener("load", resolve);
                        });

                      case 13:
                        ctx.drawImage(tempImg, 0, 0);
                        targetImg = new Image();
                        targetImg.src = canvas.toDataURL();
                        return _context.abrupt("return", targetImg.outerHTML);

                      case 17:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, _callee);
              }));

              return function (_x) {
                return _ref2.apply(this, arguments);
              };
            }());
            _context2.next = 4;
            return Promise.all(images);

          case 4:
            ims = _context2.sent;
            _context2.next = 7;
            return fetch("http://localhost:3000/convert", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                tables: ims.join("")
              })
            });

          case 7:
            response = _context2.sent;
            _context2.next = 10;
            return response.json();

          case 10:
            data = _context2.sent;
            buff = Buffer.from(data.docx, "base64");
            blob = new Blob([buff], {
              type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            });
            objectUrl = window.URL.createObjectURL(blob);
            window.location.href = objectUrl;
            URL.revokeObjectURL(objectUrl);

          case 16:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function clickHandler() {
    return _ref.apply(this, arguments);
  };
}();

// document.querySelector("#download").addEventListener("click", clickHandler);

//   const cssString = `
//     table {
//       width: 100%;
//       height: 100%;
//       border-collapse: collapse;
//     }

//     thead {
//       background-color: black;
//       color: white;
//     }

//     .border-black {
//       border: 1px solid black;
//     }

//     th.width {
//       width: 20vw;
//     }

//     .left {
//       text-align: left;
//     }

//     .centered {
//       text-align: center;
//     }

//     .mt-1 {
//       margin-top: 1rem;
//     }
//   `

//   const createSvg = (table: Element) => {
//     const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
//     const computedStyle = window.getComputedStyle(table)
//     const height = parseFloat(computedStyle.height) + 30
//     svg.setAttribute("width", computedStyle.width)
//     svg.setAttribute("height", `${height}px`)
//     svg.setAttribute("xmlns", "http://www.w3.org/2000/svg")

//     const style = document.createElement("style")
//     style.innerHTML = cssString
//     svg.appendChild(style)

//     const foreignObject = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
//     foreignObject.setAttribute("width", "100%")
//     foreignObject.setAttribute("height", "100%")

//     const div = document.createElementNS("http://www.w3.org/1999/xhtml", "div")
//     div.setAttribute("xmlns", "http://www.w3.org/1999/xhtml")

//     div.appendChild(table)
//     foreignObject.appendChild(div)
//     svg.appendChild(foreignObject)
//     return svg
//   }

//   const blobToBase64 = (blob: Blob) =>
//     new Promise((resolve, _) => {
//       const reader = new FileReader();
//       reader.onloadend = () => resolve(reader.result);
//       reader.readAsDataURL(blob);
//     });

//   const drawCanvas = (svg: Element) => {
//     const canvas = document.createElement("canvas")
//     const { width, height } = window.getComputedStyle(svg)
//     canvas.setAttribute("width", width)
//     canvas.setAttribute("height", height)
//     return canvas
//   }

//   const clickHandler = async () => {
//     const tables = Array.from(document.querySelectorAll(".row"))
//     const images = tables.map(async (table) => {
//       const svg = createSvg(table)
//       document.body.appendChild(svg)

//       const data = new Blob([svg.outerHTML], {type: "image/svg+xml"})
//       const base64Data = await blobToBase64(data) as string
//       const tempImg = new Image() as HTMLImageElement
//       tempImg.src = base64Data

//       const canvas = drawCanvas(svg)
//       const ctx = canvas.getContext("2d")!
//       ctx.clearRect(0, 0, canvas.width, canvas.height)
//       await new Promise((resolve) => { tempImg.addEventListener("load", resolve) })
//       ctx.drawImage(tempImg, 0, 0)

//       const targetImg = new Image()
//       targetImg.src = canvas.toDataURL()
//       return targetImg.outerHTML
//     })

//     const ims = await Promise.all(images)

//     // fetch("https://d1bivbppnd.execute-api.us-east-1.amazonaws.com/convert", {

//     const response = await fetch("http://localhost:3000/convert", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({tables: ims.join("")})
//     })

//     const data = await response.json()
//     const buff = Buffer.from(data.docx, "base64")
//     const blob = new Blob([buff], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" })
//     const objectUrl = window.URL.createObjectURL(blob)
//     window.location.href = objectUrl
//     URL.revokeObjectURL(objectUrl)
//   }

//   document.querySelector("#download")!.addEventListener("click", clickHandler)

  return (
    <div className="App">
      <button onClick={() => clickHandler()}>CLICK ME</button>
    </div>
  );
}

export default App;
