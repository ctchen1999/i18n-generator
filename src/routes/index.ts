import { Hono } from "hono"

import home from "./home"
import translate from "./translate"

const router = new Hono()

router.route("/", home)
router.route("/translate", translate)

export default router