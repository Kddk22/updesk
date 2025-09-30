<template>
  <div class="upsum-app">
    <div class="app-header">
      <h1>UpSum - Rechner</h1>
      <p>Ihr persönlicher Taschenrechner und Berechnungstool</p>
    </div>
    
    <div class="app-content">
      <div class="calculator">
        <div class="display">
          <input 
            type="text" 
            v-model="display" 
            readonly 
            class="display-input"
            :class="{ 'error': hasError }"
          />
        </div>
        
        <div class="buttons">
          <button @click="clear" class="btn btn-clear">C</button>
          <button @click="clearEntry" class="btn btn-clear">CE</button>
          <button @click="backspace" class="btn btn-operation">⌫</button>
          <button @click="appendOperation('/')" class="btn btn-operation">÷</button>
          
          <button @click="appendNumber('7')" class="btn btn-number">7</button>
          <button @click="appendNumber('8')" class="btn btn-number">8</button>
          <button @click="appendNumber('9')" class="btn btn-number">9</button>
          <button @click="appendOperation('*')" class="btn btn-operation">×</button>
          
          <button @click="appendNumber('4')" class="btn btn-number">4</button>
          <button @click="appendNumber('5')" class="btn btn-number">5</button>
          <button @click="appendNumber('6')" class="btn btn-number">6</button>
          <button @click="appendOperation('-')" class="btn btn-operation">−</button>
          
          <button @click="appendNumber('1')" class="btn btn-number">1</button>
          <button @click="appendNumber('2')" class="btn btn-number">2</button>
          <button @click="appendNumber('3')" class="btn btn-number">3</button>
          <button @click="appendOperation('+')" class="btn btn-operation">+</button>
          
          <button @click="appendNumber('0')" class="btn btn-number btn-zero">0</button>
          <button @click="appendDecimal" class="btn btn-number">.</button>
          <button @click="calculate" class="btn btn-equals">=</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UpSum',
  data() {
    return {
      display: '0',
      previousValue: null,
      operation: null,
      waitingForNewValue: false,
      hasError: false
    }
  },
  methods: {
    appendNumber(number) {
      if (this.hasError) {
        this.clear()
      }
      
      if (this.waitingForNewValue) {
        this.display = number
        this.waitingForNewValue = false
      } else {
        this.display = this.display === '0' ? number : this.display + number
      }
    },
    
    appendDecimal() {
      if (this.hasError) {
        this.clear()
      }
      
      if (this.waitingForNewValue) {
        this.display = '0.'
        this.waitingForNewValue = false
      } else if (this.display.indexOf('.') === -1) {
        this.display += '.'
      }
    },
    
    appendOperation(nextOperation) {
      const inputValue = parseFloat(this.display)
      
      if (this.hasError) {
        this.clear()
        return
      }
      
      if (this.previousValue === null) {
        this.previousValue = inputValue
      } else if (this.operation) {
        const currentValue = this.previousValue || 0
        const newValue = this.performCalculation()
        
        this.display = String(newValue)
        this.previousValue = newValue
      }
      
      this.waitingForNewValue = true
      this.operation = nextOperation
    },
    
    calculate() {
      if (this.hasError) {
        return
      }
      
      const inputValue = parseFloat(this.display)
      
      if (this.previousValue !== null && this.operation) {
        const newValue = this.performCalculation()
        this.display = String(newValue)
        this.previousValue = null
        this.operation = null
        this.waitingForNewValue = true
      }
    },
    
    performCalculation() {
      const prev = this.previousValue
      const current = parseFloat(this.display)
      
      try {
        switch (this.operation) {
          case '+':
            return prev + current
          case '-':
            return prev - current
          case '*':
            return prev * current
          case '/':
            if (current === 0) {
              this.hasError = true
              return 'Error'
            }
            return prev / current
          default:
            return current
        }
      } catch (error) {
        this.hasError = true
        return 'Error'
      }
    },
    
    clear() {
      this.display = '0'
      this.previousValue = null
      this.operation = null
      this.waitingForNewValue = false
      this.hasError = false
    },
    
    clearEntry() {
      this.display = '0'
      this.hasError = false
    },
    
    backspace() {
      if (this.hasError) {
        this.clear()
        return
      }
      
      if (this.display.length > 1) {
        this.display = this.display.slice(0, -1)
      } else {
        this.display = '0'
      }
    }
  }
}
</script>

<style scoped>
.upsum-app {
  padding: 20px;
  max-width: 400px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.app-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border-radius: 12px;
}

.app-header h1 {
  margin: 0 0 10px 0;
  font-size: 2rem;
  font-weight: 300;
}

.app-header p {
  margin: 0;
  font-size: 1rem;
  opacity: 0.9;
}

.calculator {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.display {
  margin-bottom: 20px;
}

.display-input {
  width: 100%;
  height: 60px;
  font-size: 2rem;
  text-align: right;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 0 15px;
  background: #f8f9fa;
  color: #333;
  font-family: 'Courier New', monospace;
}

.display-input.error {
  color: #dc3545;
  border-color: #dc3545;
}

.buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.btn {
  height: 60px;
  border: none;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn:active {
  transform: translateY(0);
}

.btn-number {
  background: #f8f9fa;
  color: #333;
  border: 1px solid #e0e0e0;
}

.btn-number:hover {
  background: #e9ecef;
}

.btn-operation {
  background: #6c757d;
  color: white;
}

.btn-operation:hover {
  background: #5a6268;
}

.btn-clear {
  background: #dc3545;
  color: white;
}

.btn-clear:hover {
  background: #c82333;
}

.btn-equals {
  background: #28a745;
  color: white;
}

.btn-equals:hover {
  background: #218838;
}

.btn-zero {
  grid-column: span 2;
}
</style>