import postcss from 'postcss'
import fs from 'fs'
import path from 'path'
import tailwind from '../../src'
import selectorParser from 'postcss-selector-parser'

function run(input, config = {}) {
  return postcss(tailwind(config)).process(input, {
    from: path.resolve(__filename),
  })
}

test('modify selectors', () => {
  let config = {
    darkMode: 'class',
    content: [path.resolve(__dirname, './modify-selectors.test.html')],
    corePlugins: { preflight: false },
    theme: {},
    plugins: [
      function ({ addVariant }) {
        addVariant('foo', ({ modifySelectors, separator }) => {
          modifySelectors(({ selector }) => {
            return selectorParser((selectors) => {
              selectors.walkClasses((classNode) => {
                classNode.value = `foo${separator}${classNode.value}`
                classNode.parent.insertBefore(classNode, selectorParser().astSync(`.foo `))
              })
            }).processSync(selector)
          })
        })
      },
    ],
  }

  let css = `
    @tailwind components;
    @tailwind utilities;

    @layer components {
      .markdown > p {
        margin-top: 12px;
      }
    }
  `

  return run(css, config).then((result) => {
    let expectedPath = path.resolve(__dirname, './modify-selectors.test.css')
    let expected = fs.readFileSync(expectedPath, 'utf8')

    expect(result.css).toMatchFormattedCss(expected)
  })
})
