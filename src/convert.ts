import juice from "juice"

const tableString = `
  table {
    width: 100%;
    height: 100%;
    padding: 8px;
    border-collapse: collapse;
    font-size: 16px;
  }

  table > tbody > tr > td {
    padding: 8px;
  }

  tr {
    border: 1px solid black;
  }

  th {
    padding: 16px;
    background-color: black;
    color: white;
    border: 1px solid black;
    font-size: 16px;
  }

  td {
    max-width: 8em;
    border: 1px solid black;
  }

  thead {
    background-color: black;
    padding: 8px;
    color: white;
  }

  th.width {
    width: 20em;
  }
`
const cssString = `
  table {
    width: 100%;
    height: 100%;
    padding: 8px;
    border-collapse: collapse;
    font-size: 16px;
    font-family: Helvetica;
  }

  table > tbody > tr > td {
    padding: 8px;
  }

  th {
    padding: 8px;
    background-color: black;
    color: white;
  }

  td {
    max-width: 8em;
  }

  thead {
    background-color: black;
    padding: 8px;
    color: white;
  }

  .border-black {
    border: 1px solid black;
  }

  th.width {
    width: 20em;
  }

  .left {
    text-align: left;
  }

  .centered {
    text-align: center;
  }

  .mt-1 {
    margin-top: 1rem;
  }
`

const px = (n: number | string) => `${n}px`

const createSvg = (originalTable: HTMLElement) => {
  const table = originalTable.cloneNode(true)
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg")

  let { width, height } = window.getComputedStyle(originalTable)
  height = px(Math.ceil(parseFloat(height)))

  svg.setAttribute("width", width)
  svg.setAttribute("height", height)

  const style = document.createElement("style")
  style.innerHTML = cssString
  svg.appendChild(style)

  const foreignObject = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
  foreignObject.setAttribute("width", width)
  foreignObject.setAttribute("height", height)

  const div = document.createElementNS("http://www.w3.org/1999/xhtml", "div")
  div.setAttribute("xmlns", "http://www.w3.org/1999/xhtml")
  div.style.width = "100%"
  div.style.height = "100%"

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
  canvas.setAttribute("height", px(Math.ceil(parseFloat(height))))
  return canvas
}

const createIframe = () => {
  const iframe = document.body.appendChild(document.createElement("iframe"))
  iframe.style.width = "100em"
  iframe.style.height = "100em"
  iframe.style.display = "none"
  return iframe
}

const clickHandler = async (raw?: boolean) => {
  const rows = Array.from(document.querySelectorAll(".row"))
  const iframe = createIframe()
  const images = rows.map(async (row) => {
    const table = row.querySelector("table")!
    const span = document.createElement("span")
    span.style.fontSize = px(10)
    span.innerText = row.querySelector("h5")!.innerText
    span.style.fontWeight = "bold"
    const br = document.createElement("br")

    const svg = createSvg(table)
    svg.style.display = "none"
    iframe.contentDocument!.body.appendChild(svg)

    const data = new Blob([svg.outerHTML], {type: "image/svg+xml"})
    const base64Data = await blobToBase64(data) as string

    const tempImg = iframe.contentDocument!.body.appendChild(document.createElement("img"))
    tempImg.style.display = "none"
    tempImg.src = base64Data

    const canvas = drawCanvas(window.getComputedStyle(svg))
    const ctx = canvas.getContext("2d")!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    await new Promise(resolve => { tempImg.addEventListener("load", resolve, { once: true }) })
    ctx.drawImage(tempImg, 0, 0)
    const targetImg = new Image()
    targetImg.src = canvas.toDataURL()
    tempImg.remove()

    return [span.outerHTML, raw && juice.inlineContent(table.outerHTML, tableString) || targetImg.outerHTML, br.outerHTML].join("")
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

  iframe.remove()
}

export default clickHandler
