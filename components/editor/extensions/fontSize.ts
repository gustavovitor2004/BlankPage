import { Extension } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: number) => ReturnType
    }
  }
}

export const FontSize = Extension.create({
  name: 'fontSize',

  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => {
              const s = element.style.fontSize
              return s ? s.replace('px', '') : null
            },
            renderHTML: attributes => {
              if (!attributes.fontSize) return {}
              return { style: `font-size: ${attributes.fontSize}px` }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setFontSize: (size: number) => ({ chain }) => {
        return chain().setMark('textStyle', { fontSize: size }).run()
      },
    }
  },
})
