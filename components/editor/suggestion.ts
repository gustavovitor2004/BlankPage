import { ReactRenderer } from '@tiptap/react'
import tippy, { type Instance, type Props } from 'tippy.js'
import type { SuggestionProps, SuggestionKeyDownProps } from '@tiptap/suggestion'
import SuggestionList, { type SuggestionListRef } from './SuggestionList'

export function buildSuggestion(getTerms: () => string[]) {
  return {
    items: ({ query }: { query: string }) => {
      const terms = getTerms()
      if (!query) return terms.slice(0, 8)
      return terms
        .filter(t => t.toLowerCase().startsWith(query.toLowerCase()))
        .slice(0, 8)
    },

    render: () => {
      let component: ReactRenderer<SuggestionListRef> | null = null
      let popup: Instance<Props>[] | null = null

      return {
        onStart(props: SuggestionProps) {
          component = new ReactRenderer(SuggestionList, {
            props,
            editor: props.editor,
          })

          if (!props.clientRect) return

          popup = tippy('body', {
            getReferenceClientRect: props.clientRect as () => DOMRect,
            appendTo: () => document.body,
            content: component.element,
            showOnCreate: true,
            interactive: true,
            trigger: 'manual',
            placement: 'bottom-start',
          })
        },

        onUpdate(props: SuggestionProps) {
          component?.updateProps(props)
          if (!props.clientRect || !popup) return
          popup[0].setProps({
            getReferenceClientRect: props.clientRect as () => DOMRect,
          })
        },

        onKeyDown(props: SuggestionKeyDownProps) {
          if (props.event.key === 'Escape') {
            popup?.[0].hide()
            return true
          }
          return component?.ref?.onKeyDown(props) ?? false
        },

        onExit() {
          popup?.[0].destroy()
          component?.destroy()
        },
      }
    },
  }
}
