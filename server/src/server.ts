import app from './app';

const PORT = parseInt(process.env.PORT || '5000', 10);
const HOST = process.env.HOST || '127.0.0.1';

// Bind to localhost only for security
app.listen(PORT, HOST, () => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`Server is running on ${HOST}:${PORT}`);
  }
});