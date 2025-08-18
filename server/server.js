const app = require('./index');
const { PORT } = require('./config/config');

app.listen(PORT, () => {
  console.log(` API running at http://localhost:${PORT}`);
});