
import express from 'express'
import { createServer } from 'node:http';
import cors from 'cors'
import { Server } from 'socket.io';



const FRAME_INTERVAL = 100;     // ms between frames used in setTimeout 
const CYCLE_DURATION = 4000;    // total ms for one grow-and-shrink cycle
const STEPS = CYCLE_DURATION / FRAME_INTERVAL; // e.g. 4000/100 = 40

const app = express();
app.use(cors());
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: 'http://localhost:5173', methods: ['GET','POST'] }
});

io.on('connection', socket => {
  let intervalId = null;
  let step = 0;

socket.on('start', () => {
  if (intervalId) return;
  step = 0;
  intervalId = setInterval(() => {
    const half   = STEPS / 2;
    // t always goes 0→1 for growth and 1→0 for shrinking height/opacity
    let t = step <= half
      ? (step / half)              // 0→1
      : ((STEPS - step) / half);   // 1→0

    // height and opacity still pulse
    const height  = t * 100;       // px
    const opacity = t;

    // width grows 0→100% then STAYS at 100%
    const width = (step <= half)
      ? (t * 100)                   // 0→100%
      : 100;                        // hold 100% during collapse

    socket.emit('animate', { height, width, opacity });

    step = (step + 1) % (STEPS + 1);
  }, FRAME_INTERVAL);
});


  socket.on('stop', () => {
    clearInterval(intervalId);
    intervalId = null;
    // reset to zero
    socket.emit('animate', { height: 0, width: 0, opacity: 0 });
  });

  socket.on('disconnect', () => {
    clearInterval(intervalId);
  });
});

httpServer.listen(4000, () =>
  console.log('🚀 Animation server listening on http://localhost:4000')
);
