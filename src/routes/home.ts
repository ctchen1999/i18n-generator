import { Hono } from "hono";
import * as fs from "fs"
import path from "path"

const home = new Hono()

home
  .get('/', (c) => {
    const filePath = path.join(__dirname, "../public", "translate.html")
    const html = fs.readFileSync(filePath, "utf8")
    return c.html(html)
  })
  .get('/multi', (c) => {
    const filePath = path.join(__dirname, "../public", "translate-multi.html")
    const html = fs.readFileSync(filePath, "utf8")
    return c.html(html)
  })

export default home
