const observing = new Set<FakeResizeObserver>()

export class FakeResizeObserver implements ResizeObserver {
  readonly onResize: ResizeObserverCallback
  readonly targets = new Set<Element>()

  constructor(onResize: ResizeObserverCallback) {
    this.onResize = onResize
  }

  observe(target: Element) {
    this.targets.add(target)
    observing.add(this)
  }

  unobserve(target: Element) {
    this.targets.delete(target)
  }

  disconnect() {
    observing.delete(this)
  }
}

export function resize(target: Element) {
  observing.forEach((observer) => {
    if (observer.targets.has(target)) {
      observer.onResize([], observer)
    }
  })
}
