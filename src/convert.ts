const cssString = `
  .row {
    width: 100%;
    height: 100%;
  }

  table {
    width: 100%;
    height: 100%;
    padding: 8px;
    border-collapse: collapse;
    font-size: 20px;
    font-family: Helvetica;
    margin-bottom: 20px;
  }

  th {
    padding: 8px;
  }

  td {
    max-width: 7vw;
    word-break: break-all;
  }

  thead {
    background-color: black;
    padding: 8px;
    color: white;
  }

  table > tbody > tr > td {
    padding: 8px;
  }

  .border-black {
    border: 1px solid black;
  }

  th.width {
    width: 20vw;
  }

  .left {
    text-align: left;
  }

  .centered {
    text-align: center;
  }
`

const createSvg = (originalTable: Element) => {
  const table = originalTable.cloneNode(true)
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg")

  const { width, height } = window.getComputedStyle(originalTable)

  console.log("computedStyle width, height", width, height)

  svg.setAttribute("width", width)
  svg.setAttribute("height", `${parseFloat(height)}px`)

  const style = document.createElement("style")
  style.innerHTML = cssString
  svg.appendChild(style)

  const foreignObject = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
  foreignObject.setAttribute("width", width)
  foreignObject.setAttribute("height", height)

  const div = document.createElementNS("http://www.w3.org/1999/xhtml", "div")
  div.setAttribute("xmlns", "http://www.w3.org/1999/xhtml")

  div.appendChild(table)
  foreignObject.appendChild(div)
  svg.appendChild(foreignObject)
  return svg
}

const blobToBase64 = (blob: Blob) =>
  new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });

const drawCanvas = ({ width, height }: { width: string, height: string }) => {
  const canvas = document.createElement("canvas")
  canvas.setAttribute("width", width)
  canvas.setAttribute("height", `${parseFloat(height)}px`)
  return canvas
}

const clickHandler = async () => {
  const rows = Array.from(document.querySelectorAll(".row"))
  const iframe = document.body.appendChild(document.createElement("iframe"))
  iframe.style.width = "100vw"
  iframe.style.height = "100vw"
  const images = rows.map(async (row) => {
    const table = row.querySelector("table")!
    const svg = createSvg(table)
    svg.style.display = "none"
    iframe.contentDocument!.body.appendChild(svg)
    // await new Promise(resolve => { setTimeout(resolve, 1) })

    const data = new Blob([svg.outerHTML], {type: "image/svg+xml"})
    const base64Data = await blobToBase64(data) as string

    const tempImg = new Image()
    tempImg.src = base64Data

    const canvas = drawCanvas(window.getComputedStyle(svg))
    const ctx = canvas.getContext("2d")!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    await new Promise(resolve => { tempImg.addEventListener("load", resolve) })
    ctx.drawImage(tempImg, 0, 0)
    const targetImg = new Image()
    targetImg.src = canvas.toDataURL()
    tempImg.remove()

    const span = document.createElement("span")
    span.style.fontSize = "10px"
    span.innerText = row.querySelector("h5")!.innerText
    span.style.fontWeight = "bold"
    const br = document.createElement("br")
    return [span.outerHTML, targetImg.outerHTML, br.outerHTML].join("")
  })

  const ims = await Promise.all(images)
  const meta = document.querySelector<HTMLMetaElement>("meta[name='convert']")
  if (!meta) { console.error("cannot find correct meta tag for convert api"); return }

  const url = meta.content
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({tables: ims.join("")})
  })

  const data = await response.json()
  const buff = Buffer.from(data.docx, "base64")
  const blob = new Blob([buff], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" })
  const objectUrl = window.URL.createObjectURL(blob)
  window.location.href = objectUrl
  URL.revokeObjectURL(objectUrl)
}

export default clickHandler
