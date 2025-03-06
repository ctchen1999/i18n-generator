import { Hono } from "hono"
import router from "./routes/index"

const app = new Hono()

app.route("/", router)

export default app
