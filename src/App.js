import './App.css';
import OrdersComponent from './OrdersComponent'
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to Your Delivery App</h1>
      </header>
      <main>
        <OrdersComponent />
      </main>
    </div>
  );
}

export default App;
