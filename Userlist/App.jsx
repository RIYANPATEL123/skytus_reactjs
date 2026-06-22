import {useState} from 'react';

function UserList({user, onToggle}){
  return (
    <div style={{border:'1px solid #ccc', padding:'10px' ,margin:'10px',backgroundColor: user.active ? 'lightgreen' : 'red'

    }}>
      <h2>Name: {user.name}</h2>
      <p>Email: {user.email}</p>
      <p>Status: {user.active ? 'Active' : 'Inactive'}</p>
      <button onClick={() => onToggle(user.id)}>
        {user.active ? 'Deactivate' : 'Activate'}
      </button>
    </div>
  );
}
function App(){
  const [users, setUsers] = useState([
    {id:1, name:'John Doe',email:'john.doe@example.com',active:true},
    {id:2, name:'Jane Smith',email:'jane@gmail.com',active:false},
    {id:3, name:'Bob Johnson',email:'bob@gmail.com',active:true},
  ]);

  const toggleStatus = (id) => {
    setUsers(users.map(user => 
      user.id === id ? {...user, active: !user.active} : user
    ));
  }
  return (
    <div>
      <h1>User list</h1>
      {users.length === 0 ? (
        <p>No users found.</p>
      ):(
        users.map(user => (
          <UserList key={user.id} user={user} onToggle={toggleStatus} />
        )))}
    </div>
  );
}

export default App;