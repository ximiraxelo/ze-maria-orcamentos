const Modal = {
  open() {
    // Abre o modal na tela
    document
      .querySelector('.modal-overlay')
      .classList.add('active')
  },
  close() {
    // Tira o modal da tela
    document
      .querySelector('.modal-overlay')
      .classList.remove('active')
  }
}

const Storage = {
  // Pega o que está no localStorage
  get() {
    return JSON.parse(localStorage.getItem("ze.maria:services")) || []
  },

  // Salva as entradas no localStorage
  set (services) {
    localStorage.setItem("ze.maria:services", JSON.stringify(services))
  }
}

const Services = {
  all: Storage.get(),

  add(service) {
    Services.all.push(service)

    App.reload()
  },

  remove(index) {
    Services.all.splice(index, 1)

    App.reload()
  },

  removeAll() {
    Services.all = []

    App.reload()
  },

  totalPrice() {
    // Preço final do orçamento
    let amount = 0

    // Soma de todos subtotais
    Services.all.forEach(service => {
      if(service.subtotal > 0) {
        amount += service.subtotal
      }
    })

    return amount
  }
}

const Print = {
  init() {
    // Retirando todos elementos com a classe remove da tela
    document.querySelectorAll('.remove').forEach(removeElement => {
      removeElement.classList.add('invisible')
    })

    // Retirando alguns outros elementos da tela
    document
      .querySelector('.buttons')
      .classList.add('invisible')
    document
      .querySelector('.card.add-service')
      .classList.add('invisible')
    document
      .querySelector('.head-remove')
      .classList.add('invisible')
    
    // Imprimindo o conteúdo da tela
    print()

    Print.restore()
  },

  restore() {
    // Retornando os elementos na tela
    document
      .querySelector('.buttons')
      .classList.remove('invisible')
    document
      .querySelector('.card.add-service')
      .classList.remove('invisible')
    document
      .querySelector('.head-remove')
      .classList.remove('invisible')
    document.querySelectorAll('.remove').forEach(removeElement => {
      removeElement.classList.remove('invisible')
    })
  }
}

const DOM = {
  servicesContainer: document.querySelector('#data-table tbody'),
  
  addService(service, index) {
    const tr = document.createElement('tr')
    tr.innerHTML = DOM.innerHTMLService(service, index)
    tr.dataset.index = index

    DOM.servicesContainer.appendChild(tr)
  },

  innerHTMLService(service, index) {
    const price = Utils.formatCurrency(service.price)
    const subtotal = Utils.formatCurrency(service.subtotal)

    const html = `          
      <td class="service">${service.description}</td>
      <td class="quantity">${service.quantity} ${service.unit}</td>
      <td class="price">${price}</td>
      <td class="subtotal">${subtotal}</td>
      <td class="remove">
        <a href="#" class="button-remove" onclick="Services.remove(${index})">
          ${feather.icons['x-circle'].toSvg({'stroke': '#e74c3c'})}
        </a>
      </td>
    `

    return html
  },

  updateTotal() {
    document
      .getElementById('total')
      .innerHTML = Utils.formatCurrency(Services.totalPrice())
  },

  clearServices() {
    DOM.servicesContainer.innerHTML = ""
  }
}

const Utils = {
  formatPrice(price) {
    price = Number(price) * 100
    // Para evitar erros de aproximação com floats
    price = Math.round(price)
    
    return price
  },

  formatQuantity(quantity) {
    quantity = Number(quantity)

    return quantity
  },

  formatCurrency(value) {
    // Formata valor em reais
    value = String(value).replace(/\D/g, "")

    value = Number(value) / 100

    if (value === 0) {
      return ''
    }

    value = value.toLocaleString("pt-br", {
      style: "currency",
      currency: "BRL"
    })

    return value
  }
}

const Form = {
  description: document.querySelector('.services-form'),
  quantity: document.querySelector('#quantity-form'),
  unit: document.querySelector('#unity-form'),
  price: document.querySelector('#price-form'),

  getValues() {
    return {
      description: Form.description.value,
      quantity: Form.quantity.value,
      unit: Form.unit.value,
      price: Form.price.value
    }
  },

  formatData() {
    let {description, quantity, unit, price} = Form.getValues()

    
    price = Utils.formatPrice(price)
    quantity = Utils.formatQuantity(quantity)
    
    const subtotal = price * quantity

    return {
      description,
      quantity,
      unit,
      price,
      subtotal
    }
  },

  clearFields() {
    Form.description.value = ""
    Form.quantity.value = ""
    Form.unit.value = ""
    Form.price.value = ""
  },

  submit(event) {
    // Muda o comportamento padrão do submit
    event.preventDefault()

    const service = Form.formatData()
    Services.add(service)

    Form.clearFields()

    Modal.close()
  }
}

const App = {
  init() {
    Services.all.forEach((service, index) => {
      DOM.addService(service, index)
    })
    
    DOM.updateTotal()

    // Salva os dados no localStorage
    Storage.set(Services.all)
  },

  reload() {
    DOM.clearServices()
    App.init()
  }
}

App.init()