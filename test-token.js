// Script untuk test token di localStorage
// Jalankan di console browser

console.log('=== Testing localStorage for tokens ===');

const possibleKeys = ['token', 'auth_token', 'access_token', 'authToken', 'user', 'currentUser'];

console.log('Checking specific keys:');
possibleKeys.forEach(key => {
  const value = localStorage.getItem(key);
  console.log(`${key}:`, value ? `${value.substring(0, 50)}...` : 'Not found');
});

console.log('\nAll localStorage keys:');
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  const value = localStorage.getItem(key);
  console.log(`${key}:`, value ? `${value.substring(0, 50)}...` : '');
}

console.log('=== End token test ===');
