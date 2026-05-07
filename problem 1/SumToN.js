// Using mathematical formula
function sum_to_a(n) {
  return (n * (n + 1)) / 2;
}

console.log(sum_to_a(5));

// Using loop
function sum_to_b(n) {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}

console.log(sum_to_b(5));

// Using recursive
function sum_to_c(n) {
  if (n === 1) return 1;
  return n + sum_to_c(n - 1);
}

console.log(sum_to_c(5));
