int func()
{
  return 1;
}

int main()
{
  int a = 1; // declaration + assignment
  int b;     // first declaration
  b = 1;     // then assignment

  a;                    // simple expression
  b = a * (2 + func()); // assignment complex RHS: parentheses, function calls with return value

  int *c = 1 ? &a : &b; // ternary (conditional) operator and unary operator (reference)
  b = *(c + 1);         // binary operator and unary operator (dereference)
  b = (int)b;           // ignore explicit type casting
  b++;                  // unary operator (postfix)
  --b;                  // unary operator (prefix)
  b -= 2;               // compound assign operator

  int **d = &c;
  *(&*d + 1) = c; // complex LHS
  return a << b;  // return also takes expression
}