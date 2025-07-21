const express = require('express');
const consul = require('consul')({ host: 'consul' });
const cors = require('cors');
const app = express();

const serviceName = 'auth-service';
const serviceId = 'auth-service';

// Configure CORS
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

app.get('/health', (req, res) => res.send('OK'));

const USERS = [
  {id:'u1',username:'user123',password:'password'},
  {id:'u2',username:'user124',password:'password'}
]


app.post('/login',(req,res)=>{
const {username,password} = req.body;
  if(!username){
   return res.status(400).json({message:"Please enter username"})
  }
  if(!password){
   return res.status(400).json({message:"Please enter password"})
  }
  const user = USERS.find(u=>u.username === username && u.password === password)

  if(user){
     return res.status(200).json({message:'Login Successful',userId:user.id,token:`mock-token`});
  }else{
     return res.status(401).json({message:'Invalid Credentials'});
  }
})


const PORT = 3001;
app.listen(PORT,'0.0.0.0', () => {
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
