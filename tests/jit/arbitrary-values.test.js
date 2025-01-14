import postcss from 'postcss'
import fs from 'fs'
import path from 'path'
import tailwind from '../../src'

function run(input, config = {}) {
  return postcss(tailwind(config)).process(input, { from: path.resolve(__filename) })
}

test('arbitrary values', () => {
  let config = {
    content: [path.resolve(__dirname, './arbitrary-values.test.html')],
    corePlugins: { preflight: false },
    theme: {},
    plugins: [],
  }

  let css = `
    @tailwind utilities;
  `

  return run(css, config).then((result) => {
    let expectedPath = path.resolve(__dirname, './arbitrary-values.test.css')
    let expected = fs.readFileSync(expectedPath, 'utf8')

    expect(result.css).toMatchFormattedCss(expected)
  })
})
