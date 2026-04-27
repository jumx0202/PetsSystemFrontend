import './message.css'

let seed = 1

interface MessageOptions {
  message: string
  type?: 'success' | 'warning' | 'info' | 'error'
  duration?: number
}

const Message = (options: MessageOptions | string) => {
  if (typeof options === 'string') {
    options = { message: options }
  }
  
  const { message, type = 'info', duration = 3000 } = options
  
  const id = `el-message-${seed++}`
  
  // Create container
  const container = document.createElement('div')
  container.className = `el-message el-message--${type}`
  container.id = id
  
  // Calculate top offset
  const existingMessages = document.querySelectorAll('.el-message')
  let topOffset = 20
  existingMessages.forEach(el => {
    topOffset += (el as HTMLElement).offsetHeight + 16
  })
  container.style.top = `${topOffset}px`
  
  // Create icon (SVG)
  const iconMap = {
    success: '<svg viewBox="0 0 1024 1024" width="16" height="16"><path d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896zm-55.808 536.384-99.52-99.584a38.4 38.4 0 1 0-54.336 54.336l126.72 126.72a38.272 38.272 0 0 0 54.336 0l261.696-261.696a38.4 38.4 0 1 0-54.336-54.336L456.192 600.384z" fill="#67C23A"/></svg>',
    warning: '<svg viewBox="0 0 1024 1024" width="16" height="16"><path d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896zm0 192a58.432 58.432 0 0 0-58.24 63.744l23.36 256.384a35.072 35.072 0 0 0 69.76 0l23.296-256.384A58.432 58.432 0 0 0 512 256zm0 512a51.2 51.2 0 1 0 0-102.4 51.2 51.2 0 0 0 0 102.4z" fill="#E6A23C"/></svg>',
    info: '<svg viewBox="0 0 1024 1024" width="16" height="16"><path d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896zm0 192a58.432 58.432 0 0 0-58.24 63.744l23.36 256.384a35.072 35.072 0 0 0 69.76 0l23.296-256.384A58.432 58.432 0 0 0 512 256zm0 512a51.2 51.2 0 1 0 0-102.4 51.2 51.2 0 0 0 0 102.4z" fill="#909399"/></svg>',
    error: '<svg viewBox="0 0 1024 1024" width="16" height="16"><path d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896zm0 393.664L407.36 352.96a38.4 38.4 0 1 0-54.336 54.336L457.664 512 353.024 616.64a38.4 38.4 0 1 0 54.336 54.336L512 566.336 616.64 670.976a38.4 38.4 0 1 0 54.336-54.336L566.336 512 670.976 407.36a38.4 38.4 0 1 0-54.336-54.336L512 457.664z" fill="#F56C6C"/></svg>'
  }
  
  container.innerHTML = `
    <div class="el-message__icon">${iconMap[type]}</div>
    <p class="el-message__content">${message}</p>
  `
  
  document.body.appendChild(container)
  
  // Trigger reflow to start transition
  container.offsetHeight
  container.classList.add('el-message-fade-enter-active')
  
  const removeMessage = () => {
    container.classList.remove('el-message-fade-enter-active')
    container.classList.add('el-message-fade-leave-active')
    setTimeout(() => {
      if (document.body.contains(container)) {
        document.body.removeChild(container)
        // Move other messages up
        const remainingMessages = document.querySelectorAll('.el-message')
        let offset = 20
        remainingMessages.forEach(el => {
          (el as HTMLElement).style.top = `${offset}px`
          offset += (el as HTMLElement).offsetHeight + 16
        })
      }
    }, 300)
  }
  
  setTimeout(removeMessage, duration)
}

Message.success = (msg: string) => Message({ message: msg, type: 'success' })
Message.warning = (msg: string) => Message({ message: msg, type: 'warning' })
Message.info = (msg: string) => Message({ message: msg, type: 'info' })
Message.error = (msg: string) => Message({ message: msg, type: 'error' })

export { Message }
