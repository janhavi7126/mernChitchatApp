
import './App.css';
import {Route} from 'react-router-dom'
import HomePage from './Pages/Homepage';
import Chat from './Pages/Chat';


function App() {
  return (
    <div className="App">
        <Route path="/" component={HomePage} exact/>
        <Route path="/chats" component={Chat}/>
        
    </div>
  );
}

export default App;
