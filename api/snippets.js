module.exports = {
  curl: "curl https://pinoy-dev-quotes-api.vercel.app/api/v1/random",
  javascript: `const res = await fetch('https://pinoy-dev-quotes-api.vercel.app/api/v1/random');
const data = await res.json();
console.log(data.data.quote);`,
  python: `import requests
res = requests.get('https://pinoy-dev-quotes-api.vercel.app/api/v1/random')
data = res.json()
print(data['data']['quote'])`,
  php: `<?php
$json = file_get_contents('https://pinoy-dev-quotes-api.vercel.app/api/v1/random');
$data = json_decode($json, true);
echo $data['data']['quote'];
?>`
};
