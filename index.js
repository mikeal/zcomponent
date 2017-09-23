/* globals MutationObserver, HTMLElement */
const each = (arr, fn) => {
  return Array.from(arr).forEach(fn)
}

const observer = (element, onAttributes) => {
  var observer = new MutationObserver(mutations => {
    mutations = Array.from(mutations)
    let attributes = Object.assign({},
      mutations
      .filter(m => m.type === 'attributes')
      .map(m => m.attributeName)
      .map(attr => {
        let o = {}
        o[attr] = element.getAttribute(attr)
        return o
      })
    )
    onAttributes(attributes)

    mutations.filter(m => m.type === 'childList')
    .forEach(m => {
      if (m.addedNodes && element.onAddedNode) {
        each(m.addedNodes, n => element.onAddedNode(n))
      }
      if (m.removedNodes && element.onRemovedNode) {
        each(m.removedNodes, n => element.onRemovedNode(n))
      }
    })
  })

  observer.observe(element, {attributes: true, childList: true})
  return observer
}

class ZComponent extends HTMLElement {
  constructor () {
    super()
    let shadow = this.shadow
    if (shadow) {
      let shadowRoot = this.attachShadow({mode: 'open'})
      shadowRoot.innerHTML = shadow
    }
    let _keys = []
    let parseProto = obj => {
      let proto = Object.getPrototypeOf(obj)
      if (proto === ZComponent) return

      let descs = Object.getOwnPropertyDescriptors(proto)
      let __keys = Object.keys(descs).filter(k => descs[k].set)

      /* This is a hack, and I would prefer a different detection method.
         The problem is that the entire proto chain is just "HTMLElement"
         and the polyfills for WebComponents complicate things a bit.
         I tried other detection methods but this was the best I could do.
      */
      if (!__keys.includes('_zcomponentSetterIdentifier')) {
        _keys = _keys.concat(__keys)
        parseProto(proto)
      }
    }
    parseProto(this)
    observer(this, attributes => {
      for (let key in attributes) {
        if (_keys.indexOf(key) !== -1) {
          this[key] = attributes[key]
        }
      }
    })
    let constructedKeys = []
    each(this.attributes, node => {
      let key = node.name
      if (_keys.indexOf(key) !== -1) {
        // Ensure subclass constructor has finished
        // before setting properties w/ setTimeout.
        setTimeout(() => {
          this[key] = node.nodeValue
        }, 0)
      }
      constructedKeys.push(key)
    })
    // Safari Hack
    // For some reason mutation observer doesn't pick up
    // initial attributes but those are also not on the element yet.
    setTimeout(() => {
      each(this.attributes, node => {
        let key = node.name
        if (constructedKeys.includes(key)) return
        if (_keys.indexOf(key) !== -1) {
          this[key] = node.nodeValue
        }
      })
    }, 0)
  }
  set shadow (shadow) {
    this.shadowRoot.innerHTML = shadow
  }
  set _zcomponentSetterIdentifier (value) {
  }
}

module.exports = ZComponent
