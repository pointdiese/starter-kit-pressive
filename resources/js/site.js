import Alpine from 'alpinejs'
window.Alpine = Alpine

const debounce = (func, wait, immediate = true) => {
  let timeout
  return function() {
    const context = this
    const args = arguments
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(function() {
      timeout = null
      if (!immediate) {
        func.apply(context, args)
      }
    }, wait)
    if (callNow) func.apply(context, args)
  }
}

const appendChildAwaitLayout = (parent, element) => {
  return new Promise((resolve) => {
    const resizeObserver = new ResizeObserver((entries, observer) => {
      observer.disconnect()
      resolve(entries)
    })
    resizeObserver.observe(element)
    parent.appendChild(element)
  })
}

document.addEventListener('alpine:init', () => {
  Alpine.data(
    'Marquee',
    ({ speed = 1, spaceX = 0, dynamicWidthElements = false }) => ({
      dynamicWidthElements,
      async init() {
        if (this.dynamicWidthElements) {
          const images = this.$el.querySelectorAll('img')
          if (images) {
            await Promise.all(
              Array.from(images).map(image => {
                return new Promise((resolve) => {
                  if (image.complete) {
                    resolve()
                  } else {
                    image.addEventListener('load', () => resolve())
                  }
                })
              })
            )
          }
        }

        this.originalElement = this.$el.cloneNode(true)
        const originalWidth = this.$el.scrollWidth + spaceX * 4
        this.$el.style.setProperty('--marquee-width', originalWidth + 'px')
        this.$el.style.setProperty('--marquee-time', ((1 / speed) * originalWidth) / 100 + 's')
        this.resize()
        window.addEventListener('resize', debounce(this.resize.bind(this), 100))
      },
      async resize() {
        this.$el.innerHTML = this.originalElement.innerHTML

        let i = 0
        while (this.$el.scrollWidth <= this.$el.clientWidth) {
          if (this.dynamicWidthElements) {
            await appendChildAwaitLayout(
              this.$el,
              this.originalElement.children[i].cloneNode(true)
            )
          } else {
            this.$el.appendChild(this.originalElement.children[i].cloneNode(true))
          }
          i = (i + 1) % this.originalElement.childElementCount
        }

        let j = 0
        while (j < this.originalElement.childElementCount) {
          this.$el.appendChild(this.originalElement.children[i].cloneNode(true))
          j++
          i = (i + 1) % this.originalElement.childElementCount
        }
      },
    })
  )
})

Alpine.start()
