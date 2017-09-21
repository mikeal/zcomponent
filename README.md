# ZComponent

WebComponent base class for building custom HTML elements.

```javascript
const ZComponent = require('zcomponent')

class MyElement extends ZComonent {
  set customProperty (value) {
    console.log(value)
  }
}

window.customElements.define('my-element', MyElement)

document.body.innerHTML += `<my-element customProperty="test"></my-element>`
```

## Element Attributes

Any attributes set on the element that correspond to property setters
you have on your class will be set as regular properties (thereby calling
your setter) on the element.

Element attributes that do not correspond to your setters will be ignored.

## Shadow DOM

ZComponent includes two features related to the shadow DOM. First, it allows
you to set the initial shadow DOM by adding a getter for the shadow property.

```javascript
const ZComponent = require('zcomponent')

class MyElement extends ZComonent {
  get shadow () {
    return `
    <style>
    :host {
      margin: 0 0 0 0;
      padding: 0 0 0 0;
    }
    </style>
    <slot></slot>
    `
  }
}
```

Second, if you ever set the shadow property of your element it will replace
the current shadow dom.

```javascript
const ZComponent = require('zcomponent')

class MyElement extends ZComonent {
  set myCustomShadowCSS (cssString) {
    this.shadow = `<style>${cssString}</style><slot></slot>`
  }
}

window.customElements.define('my-element', MyElement)

document.body.innerHTML += `<my-element></my-element>`

document.querySelector('my-element').myCustomShadowCSS = `
  :host {
    margin: 0 0 0 0;
    padding: 0 0 0 0;
  }
`
```

If you never use these features your element will not have a shadow DOM
attached.

