// Simple test to verify chrono-node can be imported
import * as chrono from 'chrono-node';

console.log('Successfully imported chrono-node');
console.log('Chrono-node version:', chrono.version);
console.log('Testing parse functionality:', chrono.parse('today at 5pm'));
