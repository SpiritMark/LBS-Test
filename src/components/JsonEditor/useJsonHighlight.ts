import { ref, computed } from 'vue'

export function useJsonHighlight(code: Ref<string>) {
  const lineCount = computed(() => {
    return code.value.split('\n').length
  })
  
  const highlightedContent = computed(() => {
    return highlightJson(code.value)
  })
  
  function highlightJson(json: string): string {
    try {
      // 基础的语法高亮
      return json
        .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, 
          match => {
            let cls = 'number'
            if (/^"/.test(match)) {
              if (/:$/.test(match)) {
                cls = 'key'
              } else {
                cls = 'string'
              }
            } else if (/true|false/.test(match)) {
              cls = 'boolean'
            } else if (/null/.test(match)) {
              cls = 'null'
            }
            return `<span class="${cls}">${match}</span>`
          })
        .replace(/[{}\[\]]/g, match => 
          `<span class="bracket">${match}</span>`)
    } catch (e) {
      return json
    }
  }

  return {
    lineCount,
    highlightedContent
  }
} 