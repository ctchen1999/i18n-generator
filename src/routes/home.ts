import { Hono } from "hono";
import * as fs from "fs"
import path from "path"

const filePath = path.join(__dirname, "../public", "translate.html")

const home = new Hono()

home
  .get('/', (c) => {
    const html = fs.readFileSync(filePath, "utf8")
    return c.html(html)
  })

export default home
