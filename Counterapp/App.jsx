import {useState} from 'react'

function Counter(){
  const [count, setCount] = useState(0);
  return(
    <div>
      <h1>Counter App</h1>
      <h2>Count: {count}</h2>

      <button onClick={() => setCount(count + 1)}>Increment</button>

      <button onClick={() => setCount(count - 1)} disabled={count==0} >Decrement</button>
 
      <button onClick={() => setCount(0)}>Reset</button>

      {count>10 && <p style={{color:'red'}}>Warning! when value exceeds a limit</p>}


    </div>
  );
}
function App() {
  return (
    <div>
      <Counter />
    </div>
  );
}

export default App;