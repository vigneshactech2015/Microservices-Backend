const express = require('express');
const consul = require('consul')({ host: 'consul' });
const os = require('os');
const app = express();

const serviceName = 'auth-service'; // Replace with actual service name
const serviceId = `${serviceName}-${os.hostname()}`;

app.use(express.json());

app.get('/health', (req, res) => res.send('OK'));

const USERS = [
  {id:'u1',username:'user1',password:'password'},
  {id:'u2',username:'user2',password:'password'}
]


app.post('/login',(req,res)=>{
  const {username,password} = req.body;
  const user = USERS.find(u=>u.username === username && u.password === password)

  if(user){
      res.status(200).json({message:'Login Successful',userId:user.id,token:`mock-token`});
  }else{
      res.status(401).json({message:'Invalid Credentials'});
  }
})


const PORT = 3001;
app.listen(PORT, () => {
  console.log(`${serviceName} running on port ${PORT}`);

  // Register service with Consul
  consul.agent.service.register({
    id: serviceId,
    name: serviceName,
    address: serviceName,
    port: PORT,
    check: {
      http: `http://${serviceName}:${PORT}/health`,
      interval: '10s'
    }
  }, err => {
    if (err) console.error('Error registering service:', err);
  });
});
