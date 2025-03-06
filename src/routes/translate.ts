import { Hono } from 'hono'
import { Translator } from '../translate'

const translate = new Hono()
const translator = new Translator(process.env.OPENAI_API_KEY as string)

translate
  .post('/', async (c) => {
    const body = await c.req.parseBody()
    const result = await translator.translateText(body.message as string)
    return c.html(`
      <div class="p-4 overflow-auto">
        <pre class="text-sm whitespace-pre-wrap">${JSON.stringify(result, null, 2)}</pre>
      </div>
    `)
  })

export default translate